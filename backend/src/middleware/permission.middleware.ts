import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/apiResponse";

export function requirePermission(moduleName: string, action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // TODO: Load role permissions from DB and validate module/action.
    // Keeping this permissive in skeleton so frontend/backend can start quickly.
    if (!req.user) return sendError(res, "Unauthorized", 401);
    next();
  };
}
