import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { Organization } from '../../models/organization/organization.model';
import { Facility } from '../../models/facilities/facilities.model';
import { User } from "../../models/user/user.model";
import { createOrganizationSchema, updateOrganizationSchema } from '../../validations/organizations/organizations.Validation';

export const createOrganization = async (req: Request, res: Response) => {
    try {
        const validatedData = createOrganizationSchema.parse(req.body);

        const { organization, facility, superAdmin } = validatedData;

        const [existingOrganization, existingUser] = await Promise.all([
            Organization.findOne({
                $or: [
                    { email: organization.email },
                    { phone: organization.phone }
                ]
            }),
            User.findOne({
                $or: [
                    { email: superAdmin.email },
                    { phone: superAdmin.phone }
                ]
            }),
        ]);

        if (existingOrganization) {
            return res.status(400).json({
                success: false,
                message: "Organization already exists",
            });
        }

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const org = await Organization.create({
            name: organization.name,
            email: organization.email,
            phone: organization.phone,
            gstNumber: organization.gstNumber,
            address: organization.address,
            facilityLimit: organization.facilityLimit,
            userLimit: organization.userLimit,
        });

        const fac = await Facility.create({
            name: facility.name,
            code: facility.code,
            city: facility.city,
            state: facility.state,
            address: facility.address,
            organization: org._id,
        });

        const hashedPassword = await bcrypt.hash(superAdmin.password, 10);

        const user = await User.create({
            name: superAdmin.name,
            email: superAdmin.email,
            phone: superAdmin.phone,
            password: hashedPassword,
            role: "super_admin",
            organization: org._id,
            facility: fac._id,
        });

        org.facilities.push(fac._id);
        org.createdBy = user._id;
        await org.save();

        res.status(201).json({
            message: "Organization created successfully",
            data: {
                org,
                facility: fac,
                user: user,
            },
        });
    } catch (error: any) {

        if (error.name === "ZodError") {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.errors,
            });
        }

        console.log("Error: ", error);

        res.status(500).json({
            message: "Server Error",
        });
    }
};


export const fetchAllOrganization = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const skip = (page - 1) * limit;

        const organizations = await Organization.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Organization.countDocuments();

        res.status(200).json({
            success: true,
            message: "Organizations fetched successfully",
            data: organizations,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


export const getOrganizationById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid organization ID",
            });
        }

        const organization = await Organization.findById(id).lean();

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Organization fetched successfully",
            data: organization,
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


export const UpdateOrganization = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        // Validate Mongo ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid organization ID",
            });
        }

        // Validate Request Body
        const validatedData = updateOrganizationSchema.parse(req.body);


        // Check Organization Exists
        const organization = await Organization.findById(id);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found",
            });
        }

        // Duplicate Email Check
        if (validatedData.email) {
            const existingEmail =
                await Organization.findOne({
                    email: validatedData.email,
                    _id: { $ne: id },
                });

            if (existingEmail) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists",
                });
            }
        }

        // Duplicate Phone Check
        if (validatedData.phone) {
            const existingPhone =
                await Organization.findOne({
                    phone: validatedData.phone,
                    _id: { $ne: id },
                });

            if (existingPhone) {
                return res.status(409).json({
                    success: false,
                    message: "Phone already exists",
                });
            }
        }

        // Update Organization
        const updatedOrganization =
            await Organization.findByIdAndUpdate(
                id,
                {
                    $set: validatedData,
                },
                {
                    new: true,
                    runValidators: true,
                }
            ).select("name email phone gstNumber address facilityLimit userLimit");

        return res.status(200).json({
            success: true,
            message: "Organization updated successfully",
            data: updatedOrganization,
        });
    } catch (error: any) {
        console.log("Error:", error);

        // Zod Validation Error
        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.errors,
            });
        }

        // Mongo Duplicate Error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Duplicate field value",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};