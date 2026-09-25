import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions } from "jsonwebtoken";

// ── Extend Express Request ────────────────────────────────────────────────────
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// ── JWT Payload shape ─────────────────────────────────────────────────────────
interface JwtPayload {
  id: string;
  role: string;
}

// ── Generate JWT Token ────────────────────────────────────────────────────────
export const generateToken = (
  payload: JwtPayload,
  secret: string,
  options: SignOptions
): string => {

  return jwt.sign(payload, secret, options);

};
// ── Authenticate — verify JWT ─────────────────────────────────────────────────
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as JwtPayload;

    req.user = decoded;
    next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ── Authorize — check role ────────────────────────────────────────────────────
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}.`,
      });
      return;
    }

    next();
  };
};
