import { Status, StockMovementType } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";

export async function getCurrentStock(productId: number): Promise<number> {
  const [inwardSum, outwardSum] = await Promise.all([
    prisma.stockMovement.aggregate({
      where: { productId, status: Status.APPROVED, movementType: StockMovementType.INWARD },
      _sum: {
        quantity: true,
      },
    }),
    prisma.stockMovement.aggregate({
      where: { productId, status: Status.APPROVED, movementType: StockMovementType.OUTWARD },
      _sum: { quantity: true },
    }),
  ]);

  const totalSum = (inwardSum._sum.quantity || 0) - (outwardSum._sum.quantity || 0);
  return totalSum;
}
