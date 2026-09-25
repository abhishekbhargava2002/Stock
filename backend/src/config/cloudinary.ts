import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { Request } from "express";

// ================= CLOUDINARY CONFIG =================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

// ================= FILE FORMAT LIST =================
const imageFormats = ["png", "jpg", "jpeg", "webp", "svg", "avif"];

const videoFormats = ["mp4", "mov", "avi", "mkv"];

const documentFormats = ["pdf", "doc", "docx", "xls", "xlsx"];

const allowedFormats = [
    ...imageFormats,
    ...videoFormats,
    ...documentFormats,
];

// ================= STORAGE CONFIG =================
const storage = new CloudinaryStorage({
    cloudinary, params: async (req: Request, file: Express.Multer.File): Promise<any> => {
        const ext = path
            .extname(file.originalname)
            .toLowerCase()
            .replace(".", "");

        // ❌ Invalid file type
        if (!allowedFormats.includes(ext)) {
            throw new Error(
                "Invalid file type. Allowed formats: PNG, JPG, JPEG, WEBP, SVG, AVIF, MP4, MOV, AVI, MKV, PDF, DOC, DOCX, XLS, XLSX."
            );
        }

        // ✅ Decide resource type
        const resource_type = imageFormats.includes(ext)
            ? "image"
            : videoFormats.includes(ext)
                ? "video"
                : "raw";

        // ✅ Optimize only images
        const transformation =
            resource_type === "image"
                ? [{ quality: "auto:good", fetch_format: "auto" }]
                : [];

        return {
            folder: "Invexus-Inventory-Management",
            resource_type,
            type: "upload",
            public_id: `${Date.now()}-${file.originalname}`,
            transformation,
        };
    },
});

// ================= MULTER CONFIG =================
export const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },

    fileFilter: (
        req: Request,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback
    ) => {
        const ext = path
            .extname(file.originalname)
            .toLowerCase()
            .replace(".", "");

        if (!allowedFormats.includes(ext)) {
            return cb(new Error("Unsupported file type"));
        }

        cb(null, true);
    },
});

// ================= PUBLIC URL GENERATOR =================
export const getPublicCloudinaryUrl = (
    public_id: string,
    resource_type: "image" | "video" | "raw" = "raw"
): string => {
    return cloudinary.url(`Local-Trade-Street/${public_id}`, {
        resource_type,
        type: "upload",
        secure: true,
        flags: "attachment:false",
    });
};

export { cloudinary };