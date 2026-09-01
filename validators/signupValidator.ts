import { z } from "zod";
import { Role } from "../generated/prisma/enums";

export const signupValidator = z
  .object({
    name: z.string({ error: "Name is required" }).trim().min(1, "Name is required"),
    role: z
      .string()
      .optional()
      .refine(
        (value) =>
          value === undefined ||
          Object.values(Role).includes(value as (typeof Role)[keyof typeof Role]),
        {
          message: "Role must be one of: ADMIN, EDITOR, VIEWER, DRIVER",
        }
      ),
    email: z
      .string({ error: "Email is required" })
      .min(1, "Email is required")
      .email("Please provide a valid email address"),
    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters long"),
    passwordConfirm: z
      .string({ error: "Password confirmation is required" })
      .min(8, "Password confirmation must be at least 8 characters long"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Password and confirm password must match",
    // path: ["passwordConfirm"],
  });
