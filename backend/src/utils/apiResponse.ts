import { Response } from "express";

export function sendSuccess<T>(res: Response, message: string, data?: T, statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function sendList<T>(
  res: Response,
  message: string,
  data: T[],
  pagination?: { page: number; limit: number; total: number; totalPages: number }
) {
  return res.status(200).json({ success: true, message, data, pagination });
}

export function sendError(res: Response, message: string, statusCode = 400, errors?: unknown) {
  return res.status(statusCode).json({ success: false, message, errors });
}
