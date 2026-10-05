import { validateRequest } from "./../validators/validateRequest";
import express from "express";
import { protectRoute, restrictRoute } from "../controllers/authController";
import {
  approveStockMovement,
  createStockMovement,
  deleteStockMovement,
  getAllStockMovements,
} from "../controllers/stockMovementController";
import { API_URLS } from "../constants/apiUrls";
import { stockMovementValidator } from "../validators/stockMovementValidator";
import { Role } from "../generated/prisma/browser";

const router = express.Router();

router.use(protectRoute);

router
  .route(API_URLS.BASE)
  .get(restrictRoute(Role.ADMIN, Role.VIEWER), getAllStockMovements)
  .post(restrictRoute(Role.ADMIN), validateRequest(stockMovementValidator), createStockMovement);

router.route("/:id/approve").put(restrictRoute(Role.ADMIN), approveStockMovement);

router.delete("/:id", restrictRoute(Role.ADMIN), deleteStockMovement);

export default router;
