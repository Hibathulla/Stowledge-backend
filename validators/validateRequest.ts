import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";

export const validateRequest = (schema: { safeParse: (value: unknown) => any }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    console.log(result, "result");

    if (!result.success) {
      const message = result.error.issues
        .map((issue: { path: PropertyKey[]; message: string }) => {
          const field = issue.path.join(".");
          return `${field.length ? `${field}: ` : ""}${issue.message}`;
        })
        .join(", ");

      return next(new AppError(message, 400));
    }

    req.body = result.data;
    next();
  };
};
