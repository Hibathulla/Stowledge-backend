import express from "express";
import { API_URLS } from "../constants/apiUrls";
import { protectRoute } from "../controllers/authController";
import { getAllUsers, getMe } from "../controllers/userController";

const router = express.Router();

router.use(protectRoute);

router.get("/", getAllUsers);
router.get(API_URLS.GET_ME, getMe);

export default router;
