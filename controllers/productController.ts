import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";

export const getProducts = catchAsync(async (req: Request, res: Response) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const newProduct = await prisma.product.create({
    data: req.body,
  });

  res.status(201).json(newProduct);
});

export const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const { cursor, limit } = req.query;
  const products = await prisma.product.findMany({
    take: limit ? parseInt(limit as string, 10) : 10, // Default limit to 10 if not provided,
    cursor: cursor ? { id: parseInt(cursor as string, 10) } : undefined,
    skip: cursor ? 1 : 0, // Skip the cursor item if cursor is provided
  });

  res.status(200).json({
    data: products,
    nextCursor: products.length > 0 ? products[products.length - 1]!.id : undefined,
  });
});

export const getProductById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      return next(new AppError(`Product with ID ${id} not found`, 404));
    }

    res.status(200).json(product);
  }
);

export const updateProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const updatedProduct = await prisma.product.update({
    where: { id: Number(id) },
    data: req.body, // Update with the provided fields
  });

  if (!updatedProduct) {
    return next(new AppError(`Product with ID ${id} not found`, 404));
  }

  res.status(200).json(updatedProduct);
});

export const paramValidate = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.params, "res");

  if (!req.params?.id) {
    return next(new AppError("Please provide a valid id!", 400));
  }

  next();
};

export const deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const deletedProduct = await prisma.product.delete({
    where: { id: Number(id) },
  });

  if (!deletedProduct) {
    return next(new AppError(`Product with ID ${id} not found`, 404));
  }
  res
    .status(200)
    .json({ status: "success", message: "Product successfully deleted!", product: deletedProduct });
});
