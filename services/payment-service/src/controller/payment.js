"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentVerification = exports.checkOut = void 0;
const TryCatch_js_1 = require("../utils/TryCatch.js");
const errorHandler_js_1 = __importDefault(require("../utils/errorHandler.js"));
const db_js_1 = require("../utils/db.js");
const index_js_1 = require("../index.js");
const crypto_1 = __importDefault(require("crypto"));
exports.checkOut = (0, TryCatch_js_1.TryCatch)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_js_1.default(401, "No valid User");
    }
    const user_id = req.user.user_id;
    const [user] = await (0, db_js_1.sql) `SELECT * FROM users WHERE user_id = ${user_id}`;
    const subTime = user?.subscription
        ? new Date(user.subscription).getTime()
        : 0;
    const now = Date.now();
    const isSubscribed = subTime > now;
    if (isSubscribed) {
        throw new errorHandler_js_1.default(400, "You already have a subscription");
    }
    const options = {
        amount: Number(119 * 100),
        currency: "INR",
        notes: {
            user_id: user_id.toString(),
        },
    };
    const order = await index_js_1.instance.orders.create(options);
    res.status(201).json({
        order,
    });
});
exports.paymentVerification = (0, TryCatch_js_1.TryCatch)(async (req, res) => {
    const user = req.user;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto_1.default
        .createHmac("sha256", process.env.Razorpay_Secret)
        .update(body)
        .digest("hex");
    const isAuthentic = expectedSignature === razorpay_signature;
    if (isAuthentic) {
        const now = new Date();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        const expiryDate = new Date(now.getTime() + thirtyDays);
        const [updatedUser] = await (0, db_js_1.sql) `UPDATE users SET subscription = ${expiryDate} WHERE user_id = ${user?.user_id} RETURNING *`;
        res.json({
            message: "Subscription Purchased Successfully",
            updatedUser,
        });
    }
    else {
        return res.status(400).json({
            message: "Payment Failed",
        });
    }
});
