import { z } from "zod";

export const createProductValidator = z.object({
  name: z.string().trim().min(1, "Name is required"),
  price: z.number().finite("Price must be a valid number").nonnegative("Price field is required"),
  desc: z.string().trim().min(1, "Description is required"),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  requiresApproval: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductValidator>;
