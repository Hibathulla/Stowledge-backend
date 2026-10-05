import express from "express";
import { protectRoute } from "../controllers/authController";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getTotalStockForProduct,
  paramValidate,
} from "../controllers/productController";
import { Role } from "../generated/prisma/enums";
import { createProductValidator } from "../validators/productValidator";
import { validateRequest } from "../validators/validateRequest";
import { restrictRoute } from "./../controllers/authController";

const router = express.Router();

router.use(protectRoute);

router
  .route("/")
  .get(restrictRoute(Role.ADMIN, Role.VIEWER), getAllProducts)
  .post(restrictRoute(Role.ADMIN), validateRequest(createProductValidator), createProduct);
router.param("id", paramValidate);
router.route("/:id").delete(restrictRoute(Role.ADMIN), deleteProduct).get(getProductById);

router.route("/stock/:productId").get(restrictRoute(Role.ADMIN), getTotalStockForProduct);

export default router;
