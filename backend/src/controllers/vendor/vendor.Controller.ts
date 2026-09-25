import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { createVendorValidation, updateVendorValidation } from "../../validations/vendor/vendor.Validation";
import { Vendor } from "../../models/vendor/vendor.Model";


export class VendorController {
    /* Create Vendor */
    static async create(req: AuthRequest, res: Response) {
        try {

            // validate request body
            const validatedData = createVendorValidation.parse(req.body);

            // check existing vendor
            const existingVendor = await Vendor.findOne({
                vendorName: validatedData.vendorName,
                phoneNumber: validatedData.phoneNumber,
                userId: req.user?.id,
            });

            if (existingVendor) {
                return res.status(409).json({
                    success: false,
                    message: "Vendor already exists",
                });
            }

            // create vendor
            const vendor = await Vendor.create({
                ...validatedData,
                userId: req.user?.id,
            });

            return res.status(201).json({
                success: true,
                message: "Vendor created successfully",
                data: vendor,
            });

        } catch (error: any) {

            console.log("Vendor Create Error:", error);

            // zod validation error
            if (error.name === "ZodError") {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.flatten().fieldErrors,
                });
            }

            // mongodb duplicate key error
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "Vendor already exists",
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to create vendor",
            });
        }
    }

    /* Get All Vendors */
    static async getAll(req: AuthRequest, res: Response) {
        try {

            // pagination
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // total vendors count
            const total = await Vendor.countDocuments({
                userId: req.user?.id,
            });

            // get vendors
            const vendors = await Vendor.find({
                userId: req.user?.id,
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            return res.status(200).json({
                success: true,
                message: "Vendors fetched successfully",
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
                data: vendors,
            });

        } catch (error: any) {
            console.log("Get Vendors Error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch vendors",
            });
        }
    }
    /* Get Vendor By Id */
    static async getById(req: AuthRequest, res: Response) {
        try {

            const { id } = req.params;

            // find vendor
            const vendor = await Vendor.findOne({
                _id: id,
                userId: req.user?.id,
            });

            // check vendor exists
            if (!vendor) {
                return res.status(404).json({
                    success: false,
                    message: "Vendor not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Vendor fetched successfully",
                data: vendor,
            });

        } catch (error: any) {

            console.log("Get Vendor Error:", error);

            // invalid mongodb object id
            if (error.name === "CastError") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid vendor id",
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to fetch vendor",
            });
        }
    }

    /* Update Vendor */
    static async update(req: AuthRequest, res: Response) {
        try {

            const { id } = req.params;

            // validate request body
            const validatedData = updateVendorValidation.parse(req.body);

            // check existing vendor
            const existingVendor = await Vendor.findOne({
                vendorName: validatedData.vendorName,
                phoneNumber: validatedData.phoneNumber,
                userId: req.user?.id,
                _id: { $ne: id },
            });

            if (existingVendor) {
                return res.status(409).json({
                    success: false,
                    message: "Vendor already exists",
                });
            }

            // update vendor
            const vendor = await Vendor.findOneAndUpdate(
                {
                    _id: id,
                    userId: req.user?.id,
                },
                validatedData,
                {
                    new: true,
                    runValidators: true,
                }
            );

            // check vendor exists
            if (!vendor) {
                return res.status(404).json({
                    success: false,
                    message: "Vendor not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Vendor updated successfully",
                data: vendor,
            });

        } catch (error: any) {

            console.log("Update Vendor Error:", error);

            // zod validation error
            if (error.name === "ZodError") {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.flatten().fieldErrors,
                });
            }

            // invalid mongodb object id
            if (error.name === "CastError") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid vendor id",
                });
            }

            // duplicate key error
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "Vendor already exists",
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to update vendor",
            });
        }
    }

    /* Update Vendor Status */
    static async updateStatus(req: AuthRequest, res: Response) {
        try {

            const { id } = req.params;

            // find vendor
            const vendor = await Vendor.findOne({
                _id: id,
                userId: req.user?.id,
            });

            // check vendor exists
            if (!vendor) {
                return res.status(404).json({
                    success: false,
                    message: "Vendor not found",
                });
            }

            // toggle status
            vendor.status = vendor.status === "active" ? "inactive" : "active";

            await vendor.save();

            return res.status(200).json({
                success: true,
                message: `Vendor ${vendor.status} successfully`,
                data: vendor,
            });

        } catch (error: any) {

            console.log("Update Vendor Status Error:", error);

            // invalid mongodb object id
            if (error.name === "CastError") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid vendor id",
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to update vendor status",
            });
        }
    }

    /* Vendor Status Count */
    static async status(req: AuthRequest, res: Response) {
        try {
            const statuses = [
                {
                    label: "ACTIVE",
                    value: "active",
                },
                {
                    label: "INACTIVE",
                    value: "inactive",
                },
            ];

            return res.status(200).json({
                success: true,
                message: "Vendor status fetched successfully",
                count: statuses.length,
                data: statuses
            });

        } catch (error: any) {
            console.log("Vendor Status Error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch vendor status",
            });
        }
    }
}