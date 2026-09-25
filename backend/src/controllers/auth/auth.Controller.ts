import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { Auth } from "../../models/auth/auth.Model";
import { registerSchema, loginSchema, userLoginSchema } from "../../validations/auth/auth.Validation";
import { generateToken, AuthRequest } from '../../middleware/auth.middleware';
import { User } from '../../models/user/user.model'

export const register = async (req: Request, res: Response) => {
    try {
        const parsed = registerSchema.safeParse(req.body);

        if (!parsed.success) {
            const errors = parsed.error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            }));

            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
            return;
        }

        const { username, email, phone, password, role, status } = parsed.data;

        const existingUser = await Auth.findOne({
            $or: [{ email }, { phone }],
        });

        if (existingUser) {
            const conflictField = existingUser.email === email ? "email" : "phone";

            res.status(409).json({
                success: false,
                message: `User with this ${conflictField} already exists`,
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await Auth.create({
            username,
            email,
            phone,
            password: hashedPassword,
            role,
            status,
        });

        const { password: _pw, ...safeUser } = newUser.toObject();

        res.status(201).json({
            success: true,
            message: "Registered successfully",
            data: safeUser,
        });
    } catch (error) {
        console.error("[register]", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


export const login = async (req: Request, res: Response) => {
    try {
        const parsed = loginSchema.safeParse(req.body);

        if (!parsed.success) {
            const errors = parsed.error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            }));

            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
            return;
        }

        const { email, password } = parsed.data;

        const user = await Auth.findOne({ email }).select("+password");

        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
            return;
        }

        if (user.status === "inactive") {
            res.status(403).json({
                success: false,
                message: "Your account is inactive. Please contact support.",
            });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
            return;
        }

        const token = generateToken(
            {
                id: user._id.toString(),
                role: user.role,
            },
            process.env.JWT_ACCESS_SECRET as string,
            { expiresIn: "7d" }
        );

        const { password: _pw, ...safeUser } = user.toObject();

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: safeUser,
        });

    } catch (error) {
        console.error("[login]", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


export const getMe = async (req: AuthRequest, res: Response) => {
    try {

        const user = await Auth.findById(req.user?.id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        if (user.status === "inactive") {
            res.status(403).json({
                success: false,
                message: "Your account is inactive. Please contact support",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user,
        });

    } catch (error) {
        console.error("[getMe]", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const logout = async (req: AuthRequest, res: Response) => {
    try {
        const user = await Auth.findById(req.user?.id);

        if (!user) {
            res.status(401).json({
                success: false,
                message: "Not authenticated.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Logged out successfully.",
        });

    } catch (error) {
        console.error("[logout]", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};



export const loginUser = async (req: Request, res: Response) => {
    try {
        const validatedData = userLoginSchema.parse(req.body);
        const { identifier, password } = validatedData;

        const user = await User.findOne({
            $or: [
                {
                    email: identifier.toLowerCase(),
                },
                {
                    username: identifier,
                },
            ],
        }).select("+password");


        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const isPasswordMatched = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordMatched) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }


        if (user.status === "inactive") {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive",
            });
        }

        const token = generateToken(
            {
                id: user._id.toString(),
                role: user.role,
            },
            process.env.JWT_ACCESS_SECRET as string,
            { expiresIn: "7d" }
        );


        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
        });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                message: error.errors[0].message,
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};