import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      photo: true,
      createdAt: true,
      role: true,
      active: true,
      assignedStockMovements: true,
    },
  });
  res.status(200).json(users);
});

export const updateMe = catchAsync(async (req: Request, res: Response, next: Function) => {
  const { name, email, photo } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      name,
      email,
      photo,
    },
    select: {
      id: true,
      email: true,
      name: true,
      photo: true,
      createdAt: true,
      role: true,
    },
  });

  res.status(200).json(updatedUser);
});

export const deleteMe = catchAsync(async (req: Request, res: Response, next: Function) => {
  await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      active: false,
    },
  });

  res
    .status(204)
    .json({ status: "success", message: `${req.user?.name} deactivated successfully` });
});

export const getMe = catchAsync(async (req: Request, res: Response, next: Function) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      name: true,
      photo: true,
      createdAt: true,
      role: true,
    },
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json(user);
});
