import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";
import { getCurrentStock } from "../utils/getCurrentStock";
import { Status, StockMovementType, DeliveryStatus } from "../generated/prisma/enums";

export const getAllStockMovements = catchAsync(async (req: Request, res: Response) => {
  const stockMovements = await prisma.stockMovement.findMany({
    select: {
      id: true,
      productId: true,
      quantity: true,
      movementType: true,
      status: true,
      deliveryStatus: true,
      requiresApproval: true,
      createdAt: true,
      approvedById: true,
      updatedAt: true,
      assignedDriverId: true,
      approvedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  return res.status(200).json({
    status: "success",
    data: stockMovements,
  });
});

export const createStockMovement = catchAsync(
  async (req: Request, res: Response, next: Function) => {
    const { productId, quantity, movementType, lowStockThreshold } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    const currentStock = await getCurrentStock(productId);

    if (quantity > currentStock && movementType === "OUTWARD") {
      return next(
        new AppError(
          `Cannot move ${quantity} units. only ${currentStock} in stock for product ${product.name}`,
          400
        )
      );
    }

    const needsApproval =
      product?.requiresApproval || // blanket rule: always needs approval
      quantity > product?.approvalThreshold; // if the quantity exceeds the product's approval threshold, it needs approval

    const deliveryStatus =
      movementType === StockMovementType.OUTWARD
        ? DeliveryStatus.PENDING
        : DeliveryStatus.NOT_APPLICABLE;
    const newStockMovement = await prisma.stockMovement.create({
      data: {
        productId,
        quantity,
        movementType,
        status: needsApproval ? Status.PENDING : Status.APPROVED, // if needs approval, set status to pending
        deliveryStatus,
        requiresApproval: needsApproval,
      },
    });

    return res.status(201).json({
      status: "success",
      data: newStockMovement,
    });
  }
);

export const deleteStockMovement = catchAsync(
  async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;

    const stockMovement = await prisma.stockMovement.findUnique({
      where: { id: Number(id) },
    });

    if (!stockMovement) {
      return next(new AppError("Stock movement not found", 404));
    }

    await prisma.stockMovement.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      status: "success",
      message: "Stock movement deleted successfully",
    });
  }
);

export const approveStockMovement = catchAsync(
  async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;

    const { isApproved } = req!.body;

    const stockMovement = await prisma.stockMovement.findUnique({
      where: { id: Number(id) },
    });

    if (!stockMovement) {
      return next(new AppError("Stock movement not found", 404));
    }

    if (stockMovement.status !== Status.PENDING) {
      return next(new AppError("Only pending stock movements can be approved", 400));
    }

    const updatedStockMovement = await prisma.stockMovement.update({
      where: { id: Number(id) },
      data: {
        status: isApproved ? Status.APPROVED : Status.REJECTED,
        approvedById: req?.user?.id,
      },
    });

    return res.status(200).json({
      status: "success",
      data: updatedStockMovement,
    });
  }
);
