import express from "express";
import { login, signup } from "../controllers/authController";
import { getAllUsers } from "../controllers/userController";
import { loginValidator } from "../validators/loginValidator";
import { signupValidator } from "../validators/signupValidator";
import { validateRequest } from "../validators/validateRequest";

const router = express.Router();

// auth
router.post("/signup", validateRequest(signupValidator), signup);
router.post("/login", validateRequest(loginValidator), login);

router.get("/", getAllUsers);

export default router;
