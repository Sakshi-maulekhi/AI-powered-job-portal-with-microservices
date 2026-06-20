import express from "express";
import { isAuth } from "../middlewares/auth.js";
import { checkOut, paymentVerification } from "../controller/payment.js";

const router = express.Router();

router.post("/checkout", isAuth, checkOut);
router.post("/verify", isAuth, paymentVerification);

export default router;

