import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
} from "../controllers/productController";
import { validateRequest } from "../validators/validateRequest";
import { createProductValidator } from "../validators/productValidator";

const router = express.Router();

router.route("/").get(getAllProducts).post(validateRequest(createProductValidator), createProduct);
router.route("/:id").delete(deleteProduct).get(getProductById);

export default router;
