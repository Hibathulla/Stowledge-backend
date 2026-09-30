import { z } from "zod";

export const updateMeValidator = z
  .object({
    name: z.string().trim().min(1, "Name cannot be empty").optional(),
    email: z.string().email("Please provide a valid email address").optional(),
    photo: z.string().optional(),
  })
  .strict(); // Ensure no additional fields are present
