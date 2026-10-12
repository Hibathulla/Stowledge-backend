import express from "express";
import { API_URLS } from "../constants/apiUrls";
import { validateRequest } from "../validators/validateRequest";
import { resetPasswordValidator } from "../validators/resetPasswordValidator";
import { emailValidator } from "../validators/emailValidator";
import { loginValidator } from "../validators/loginValidator";
import { signupValidator } from "../validators/signupValidator";
import {
  forgotPassword,
  handleRefreshToken,
  login,
  resetPassword,
  signup,
  updatePassword,
} from "../controllers/authController";
import { updatePasswordValidator } from "../validators/updatePasswordValidator";
import { deleteMe, updateMe } from "../controllers/userController";
import { updateMeValidator } from "../validators/updateUserValidator";

const router = express.Router();

// auth
router.post(API_URLS.SIGNUP, validateRequest(signupValidator), signup);
router.post(API_URLS.LOGIN, validateRequest(loginValidator), login);
router.post(API_URLS.REFRESH, handleRefreshToken);
// forgot password and reset password for users that are not logged in
router.post(API_URLS.FORGOT_PASSWORD, validateRequest(emailValidator), forgotPassword);
router.post(
  API_URLS.RESET_PASSWORD + "/:resetToken",
  validateRequest(resetPasswordValidator),
  resetPassword
);

// update password for logged in users
router.patch(API_URLS.UPDATE_PASSWORD, validateRequest(updatePasswordValidator), updatePassword);

// user routes
router.patch(API_URLS.UPDATE_ME, validateRequest(updateMeValidator), updateMe);
router.delete(API_URLS.DELETE_ME, deleteMe);

export default router;
