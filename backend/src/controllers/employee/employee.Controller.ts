import { Request, Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from '../../middleware/auth.middleware';
import { Employee } from "../../models/employee/employee.Model";
import { Facility } from '../../models/facilities/facilities.model';
import { createEmployeeSchema, updateEmployeeSchema } from "../../validations/employee/employee.Validation";
import { Organization } from "../../models/organization/organization.model";


// CREATE
export const create = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;

        const validatedData = createEmployeeSchema.safeParse(req.body);

        if (!validatedData.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validatedData.error.flatten().fieldErrors,
            });
        }

        const { email, phoneNumber } = validatedData.data;

        // CHECK EXISTING EMPLOYEE
        const existingEmployee =
            await Employee.findOne({
                userId: user,
                $or: [
                    { email },
                    { phoneNumber },
                ],
            });

        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                message: "Employee already exists with same email, phone, or employee ID",
            });
        }

        // CREATE EMPLOYEE
        const employee = await Employee.create({
            userId: user,
            ...validatedData.data,
        });

        res.status(201).json({
            success: true,
            message: "Employee Created Successfully",
            data: employee,
        });

    } catch (error) {
        console.log("Error: ", error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


// GET ALL
export const getAll = async (req: Request, res: Response) => {
    try {

        // PAGE & LIMIT
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        // SKIP
        const skip = (page - 1) * limit;

        // TOTAL COUNT
        const totalEmployees = await Employee.countDocuments();

        // GET EMPLOYEES
        const employees = await Employee.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "All Employees Fetched Successfully",
            data: employees,
            pagination: {
                total: totalEmployees,
                page,
                limit,
                totalPages: Math.ceil(
                    totalEmployees / limit
                ),
            },
        });
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


// UPDATE
export const update = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;
        // PARAM ID
        const id = req.params.id as string;

        // MONGODB OBJECT ID VALIDATION
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Employee ID",
            });
        }

        // VALIDATION
        const validatedData = updateEmployeeSchema.safeParse(req.body);

        if (!validatedData.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validatedData.error.flatten().fieldErrors,
            });
        }

        // CHECK EMPLOYEE
        const existingEmployee =
            await Employee.findOne({
                _id: id,
                userId: user,
            });

        if (!existingEmployee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        // CHECK DUPLICATE EMAIL / PHONE
        if (validatedData.data.email || validatedData.data.phoneNumber) {
            const duplicateEmployee =
                await Employee.findOne({
                    _id: { $ne: id },
                    userId: user,
                    $or: [
                        {
                            email: validatedData.data.email,
                        },
                        {
                            phoneNumber: validatedData.data.phoneNumber,
                        },
                    ],
                });

            if (duplicateEmployee) {
                return res.status(400).json({
                    success: false,
                    message: "Employee already exists with same email or phone number",
                });
            }
        }

        // UPDATE EMPLOYEE
        const updatedEmployee =
            await Employee.findByIdAndUpdate(
                id,
                validatedData.data,
                {
                    new: true,
                    runValidators: true,
                }
            );

        res.status(200).json({
            success: true,
            message: "Employee Updated Successfully",
            data: updatedEmployee,
        });

    } catch (error) {

        console.log("Error: ", error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// GET GENDERS
export const getGenders = async (req: Request, res: Response) => {
    try {
        const gender = [
            {
                label: "MALE",
                value: "Male"
            },
            {
                label: "FEMALE",
                value: "Female"
            },
            {
                label: "OTHER",
                value: "Other"
            }
        ]

        res.status(200).json({
            success: true,
            message: "Genders Fetched Successfully",
            data: gender,
        });

    } catch (error) {
        console.log("Error: ", error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


// GET ROLES
export const getRoles = async (req: Request, res: Response) => {
    try {

        const roles = [
            {
                label: "CLIENT SUPER ADMIN",
                value: "Client Super Admin",
            },
            {
                label: "ADMIN",
                value: "Admin",
            },
            {
                label: "FACILITY ADMIN",
                value: "Facility Admin",
            },
            {
                label: "STOCK MANAGER",
                value: "Stock Manager",
            },
            {
                label: "SALES OPERATOR",
                value: "Sales Operator",
            },
            {
                label: "REPORT VIEWER",
                value: "Report Viewer",
            },
        ];

        res.status(200).json({
            success: true,
            message: "Roles Fetched Successfully",
            data: roles,
        });

    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


// GET FACILITIES
export const getFacilities = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;
        // FIND ORGANIZATION
        const organization =
            await Organization.findOne({
                createdBy: user,
            });

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found",
            });
        }

        // FIND FACILITIES
        const facilities = await Facility.find({
            organization: organization._id,
        }).select("_id name");

        // FORMAT RESPONSE
        const formattedFacilities =
            facilities.map((facility) => ({
                label: facility.name.toUpperCase(),
                value: facility._id,
            }));

        res.status(200).json({
            success: true,
            message: "Facilities Fetched Successfully",
            data: formattedFacilities,
        });

    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


// GET STATUS
export const getStatuses = async (req: Request, res: Response) => {
    try {
        const status = [
            {
                label: "ACTIVE",
                value: "active",
            },
            {
                label: "INACTIVE",
                value: "inactive",
            }
        ]
        res.status(200).json({
            success: true,
            message: "Statuses Fetched Successfully",
            data: status
        });

    } catch (error) {
        console.log("Error: ", error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};