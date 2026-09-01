import { z } from "zod";

export const emailValidator = z.object({
  email: z
    .string({ error: "Email is required" })
    .min(1, "Email is required")
    .email("Please provide a valid email address"),
});
