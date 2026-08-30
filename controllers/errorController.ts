import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";

type ErrorWithPrismaDetails = AppError & {
  code?: string;
  meta?: {
    driverAdapterError?: {
      cause?: { constraint?: { fields?: string[] } };
    };
  };
};

const handleDuplicatePrismaErr = (err: ErrorWithPrismaDetails): AppError => {
  const fields = err.meta?.driverAdapterError?.cause?.constraint?.fields ?? ["field"];
  return new AppError(`Duplicate value for ${fields.join(", ")}. Please use another value.`, 400);
};

const handleMaxLengthErr = (): AppError => {
  return new AppError(`Value must not exceed the maximum length. Please use a shorter value.`, 400);
};

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "fail",
      message: "Something went very wrong!",
    });
  }
};

export const globalErrorHandler = (
  err: ErrorWithPrismaDetails,
  req: Request,
  res: Response,
  next: NextFunction //* important to include next even if not used, to ensure Express recognizes this as an error-handling middleware
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "fail";

  if (err.code === "P2002") err = handleDuplicatePrismaErr(err);
  if (err.code === "P2000") err = handleMaxLengthErr();

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};
