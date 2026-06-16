import express from 'express';
import {forgotPassword, loginUser,register, resetPassword } from "../controller/auth.js";
import uploadFile from '../middleware/multer.js';

const router = express.Router();
router.post("/register", uploadFile,register)
router.post("/login", loginUser)
router.post("/forgot",forgotPassword)
router.post("/reset/:token",resetPassword);

export default router;