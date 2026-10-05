import { z } from "zod";

export const stockMovementValidator = z.object({
  productId: z.coerce
    .number({ error: "Product ID is required" })
    .int("Product ID must be an number")
    .positive("Product ID must be positive"),
  quantity: z.coerce
    .number({ error: "Quantity field is required" })
    .int("Quantity must be a valid number")
    .nonnegative("Quantity field is required"),
  movementType: z.enum(["INWARD", "OUTWARD", "TRANSFER"], {
    error: "Type must be INWARD, OUTWARD, or TRANSFER",
  }),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  requiresApproval: z.boolean().optional(),
});

export type StockMovementInput = z.infer<typeof stockMovementValidator>;
