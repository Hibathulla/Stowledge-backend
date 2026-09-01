import express from "express";
import { forgotPassword, login, resetPassword, signup } from "../controllers/authController";
import { getAllUsers } from "../controllers/userController";
import { loginValidator } from "../validators/loginValidator";
import { signupValidator } from "../validators/signupValidator";
import { validateRequest } from "../validators/validateRequest";
import { API_URLS } from "../constants/apiUrls";
import { emailValidator } from "../validators/emailValidator";

const router = express.Router();

// auth
router.post(API_URLS.SIGNUP, validateRequest(signupValidator), signup);
router.post(API_URLS.LOGIN, validateRequest(loginValidator), login);
router.post(API_URLS.FORGOT_PASSWORD, validateRequest(emailValidator), forgotPassword);
router.post(API_URLS.RESET_PASSWORD, resetPassword);

router.get("/", getAllUsers);

export default router;
