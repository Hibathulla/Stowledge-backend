import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../lib/prisma";
import type { NextFunction, Request, Response } from "express";
import { createJWT } from "../utils/createJWT";
import { AppError } from "../utils/appError";
import { comparePassword } from "../utils/comparePassword";

export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;

  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 12,
  });
  const createUser = await prisma.user.create({
    data: { email, password: hashedPassword, name },
  });

  if (createUser) {
    const accessToken = createJWT(createUser.id, next);

    res.status(201).json({
      status: "success",
      accessToken,
      data: {
        user: createUser,
      },
    });
  }
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await comparePassword(password, user?.password as string))) {
    return next(new AppError("Invalid email or password", 401));
  }

  const accessToken = createJWT(user?.id, next);

  res.status(200).json({
    status: "success",
    accessToken,
  });
});
