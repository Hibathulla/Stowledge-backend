import express from "express";
import {
  forgotPassword,
  login,
  protectRoute,
  resetPassword,
  signup,
  updatePassword,
} from "../controllers/authController";
import { deleteMe, getAllUsers, updateMe } from "../controllers/userController";
import { loginValidator } from "../validators/loginValidator";
import { signupValidator } from "../validators/signupValidator";
import { validateRequest } from "../validators/validateRequest";
import { API_URLS } from "../constants/apiUrls";
import { emailValidator } from "../validators/emailValidator";
import { resetPasswordValidator } from "../validators/resetPasswordValidator";
import { updatePasswordValidator } from "../validators/updatePasswordValidator";
import { updateMeValidator } from "../validators/updateUserValidator";

const router = express.Router();

// auth
router.post(API_URLS.SIGNUP, validateRequest(signupValidator), signup);
router.post(API_URLS.LOGIN, validateRequest(loginValidator), login);

// forgot password and reset password for users that are not logged in
router.post(API_URLS.FORGOT_PASSWORD, validateRequest(emailValidator), forgotPassword);
router.post(
  API_URLS.RESET_PASSWORD + "/:resetToken",
  validateRequest(resetPasswordValidator),
  resetPassword
);

router.use(protectRoute);
// update password for logged in users
router.patch(
  API_URLS.UPDATE_PASSWORD,
  protectRoute,
  validateRequest(updatePasswordValidator),
  updatePassword
);

// user routes
router.patch(API_URLS.UPDATE_ME, validateRequest(updateMeValidator), updateMe);
router.delete(API_URLS.DELETE_ME, deleteMe);

router.get("/", getAllUsers);

export default router;
