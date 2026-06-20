"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_js_1 = require("../middlewares/auth.js");
const payment_js_1 = require("../controllers/payment.js");
const router = express_1.default.Router();
router.post("/checkout", auth_js_1.isAuth, payment_js_1.checkOut);
router.post("/verify", auth_js_1.isAuth, payment_js_1.paymentVerification);
exports.default = router;
