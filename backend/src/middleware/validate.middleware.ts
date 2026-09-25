import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { sendError } from "../utils/apiResponse";

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return sendError(
        res,
        "Validation failed",
        422,
        result.error.errors.map((issue) => ({ field: issue.path.join("."), message: issue.message }))
      );
    }
    req.body = result.data;
    next();
  };
}
