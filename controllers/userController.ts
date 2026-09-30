import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";

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
