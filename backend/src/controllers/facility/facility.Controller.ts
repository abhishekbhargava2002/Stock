import mongoose from "mongoose";
import { Request, Response } from "express";
import { State, City, IState, ICity, } from "country-state-city";
import { Facility } from '../../models/facilities/facilities.model';
import { updateFacilitySchema } from "../../validations/facility/facility.Validation";


export const getAllFacility = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const totalFacilities = await Facility.countDocuments();

        const facilities = await Facility.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Facilities fetched successfully",
            data: facilities,
            pagination: {
                total: totalFacilities,
                page,
                limit,
                totalPages: Math.ceil(totalFacilities / limit),
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


export const getFacilityById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid facility ID",
            });
        }

        const facility = await Facility.findById(id);

        // Check facility exists
        if (!facility) {
            return res.status(404).json({
                success: false,
                message: "Facility not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Facility fetched successfully",
            data: facility,
        });

    } catch (error) {
        console.log("Error:", error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


export const updateFacility = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        // Validate facility ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid facility ID",
            });
        }

        // Validate request body
        const validatedData = updateFacilitySchema.parse(req.body);

        // Check facility exists
        const existingFacility = await Facility.findById(id);

        if (!existingFacility) {
            return res.status(404).json({
                success: false,
                message: "Facility not found",
            });
        }

        // Update facility
        const updatedFacility = await Facility.findByIdAndUpdate(
            id,
            validatedData,
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            success: true,
            message: "Facility updated successfully",
            data: updatedFacility,
        });

    } catch (error: any) {
        console.log("Error:", error);

        // Zod validation error
        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.errors,
            });
        }

        // Mongo duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Facility code already exists in this organization",
            });
        }

        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


export const getStateDropdown = async (req: Request, res: Response) => {
    try {
        const { search } = req.query as { search?: string };

        let states: IState[] = State.getStatesOfCountry("IN");

        // 🔍 search filter
        if (search && typeof search === "string") {
            const searchLower = search.toLowerCase();

            states = states.filter((s: IState) =>
                s.name.toLowerCase().includes(searchLower)
            );
        }

        const formattedStates = states.map((s: IState) => ({
            name: s.name,
            isoCode: s.isoCode,
        }));

        return res.status(200).json({
            success: true,
            message: "States fetched successfully",
            total: formattedStates.length,
            data: formattedStates,
        });

    } catch (error: any) {
        console.error("State Dropdown Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};


export const getCityDropdown = async (req: Request, res: Response) => {
    try {
        const { stateName } = req.body;
        const { search } = req.query as { search?: string };

        // validation
        if (!stateName || typeof stateName !== "string") {
            return res.status(400).json({
                success: false,
                message: "stateName is required in request body",
            });
        }

        const states = State.getStatesOfCountry("IN");

        const matchedState = states.find(
            (s) => s.name.toLowerCase() === stateName.toLowerCase()
        );

        if (!matchedState) {
            return res.status(404).json({
                success: false,
                message: "State not found",
            });
        }

        let cities: ICity[] = City.getCitiesOfState("IN", matchedState.isoCode);

        // 🔍 search filter
        if (search && typeof search === "string") {
            const searchLower = search.toLowerCase();

            cities = cities.filter((c: ICity) =>
                c.name.toLowerCase().includes(searchLower)
            );
        }

        const formattedCities = cities.map((c: ICity) => ({
            name: c.name,
        }));

        return res.status(200).json({
            success: true,
            message: "Cities fetched successfully",
            state: matchedState.name,
            total: formattedCities.length,
            data: formattedCities,
        });

    } catch (error: any) {
        console.error("City Dropdown Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};