import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../lib/prisma";
import type { NextFunction, Request, Response } from "express";
import { createJWT } from "../utils/createJWT";
import { AppError } from "../utils/appError";
import { comparePassword } from "../utils/comparePassword";
import { verifyJWT } from "../utils/verifyJWT";
import { Role } from "../generated/prisma/enums";
import { createPasswordResetToken } from "../utils/createPasswordResetToken";
import { sendEmail } from "../utils/email";
import { hashPassword } from "../utils/hashPassword";

function createJWTAndSendResponse(
  user: any,
  statusCode: number,
  res: Response,
  next: NextFunction
) {
  const accessToken = createJWT(user.id, next);

  if (!accessToken) {
    return;
  }

  const { password: _, ...safeUser } = user;

  res.cookie("jwt", accessToken, {
    httpOnly: true,
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN as string) * 24 * 60 * 60 * 1000
    ), // Convert JWT_COOKIE_EXPIRES_IN to milliseconds
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(statusCode).json({
    status: "success",
    accessToken,
    data: {
      user: safeUser,
    },
  });
}

export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name, role } = req.body;

  const hashedPassword = await hashPassword(password);

  const createUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      ...(role && { role: role as Role }),
    },
  });

  if (createUser) {
    createJWTAndSendResponse(createUser, 201, res, next);
  }
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await comparePassword(password, user?.password as string))) {
    return next(new AppError("Invalid email or password", 401));
  }

  createJWTAndSendResponse(user, 200, res, next);
});

export const protectRoute = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token;
  if (req.headers?.authorization && req?.headers?.authorization?.startsWith("Bearer")) {
    token = req?.headers?.authorization?.split(" ")?.[1];
  }

  if (!token) {
    return next(new AppError("You are not authorized. Please login", 400));
  }

  //2) verify jwt
  const decoded = verifyJWT(token);

  //3) verify user really exists. what if user change password after login?
  const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!currentUser) {
    return next(new AppError("User no longer exists", 401));
  }

  //4) CHeck if password changed by user

  // Grant access to the protected route
  req.user = currentUser;

  next();
});

export const restrictRoute = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log(roles, req?.user?.role, "roles");

    if (req.user && !roles.includes(req.user.role as Role)) {
      return next(new AppError("You don't have permission to perform this action!", 400));
    }
    next();
  };
};

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    //1) Get user based on posted email

    const user = await prisma.user.findUnique({ where: { email: req.body.email } });
    // console.log(user, "user email");

    if (!user) {
      return next(new AppError("No user found with this email!", 404));
    }

    //2) Generate random reset token and update the passwordResetToken in DB
    const { resetTokenHash, resetToken, expiresAt } = await createPasswordResetToken();

    await prisma.user.update({
      where: { id: user?.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: expiresAt,
      },
    });

    //3) Send the token to user email
    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetTokenHash}`;
    const message = `Reset your password at ${resetUrl}`;

    try {
      // console.log(resetUrl, "test in db");

      await sendEmail({
        email: user.email,
        subject: "Your password reset is valid for 10 min",
        text: message,
      });
      console.log(resetUrl, "test in db 2");
    } catch (err) {
      console.log(err, "err in nodemailer");

      await prisma.user.update({
        where: { id: user?.id },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });

      return next(
        new AppError("There was an error sending the mail. Please try again later!", 500)
      );
    }

    console.log(resetToken, "resetToken");
    res.status(200).json({
      status: "success",
      message: "Your mail is sent to reset password!",
    });
  }
);

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  //1) Get user based on token
  const { resetToken, expiresAt } = await createPasswordResetToken(
    req?.params?.resetToken as string
  );

  //2) if token has not expired, and there is user get the user
  const user = await prisma.user.findUnique({
    where: {
      passwordResetToken: resetToken,
      passwordResetExpires: {
        gte: new Date(),
      },
    },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  //3) Update changed Password property for the user
  const updatedUser = await prisma.user.update({
    where: { id: user?.id },
    data: {
      password: await hashPassword(req.body.password),
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });
  //4) Log the user in, send JWT
  createJWTAndSendResponse(updatedUser, 200, res, next);
});

export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 2) Check if POSTed current password is correct
    if (!(await comparePassword(req.body.currentPassword, req?.user!.password as string))) {
      return next(new AppError("Your current password is wrong.", 401));
    }

    //3) If so, update password
    const updatedUser = await prisma.user.update({
      where: { id: req?.user?.id },
      data: {
        password: await hashPassword(req.body.password),
      },
    });

    //4) Log user in, send JWT
    createJWTAndSendResponse(updatedUser, 200, res, next);
  }
);
