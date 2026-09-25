import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/apiResponse";

export function notFound(req: Request, res: Response) {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  console.error(error);
  return sendError(res, error.message || "Internal server error", 500);
}
