import express from "express";
import { protectRoute } from "../controllers/authController";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
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

export default router;
