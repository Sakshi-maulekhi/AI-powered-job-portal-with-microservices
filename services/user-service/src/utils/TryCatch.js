"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TryCatch = void 0;
const ErrorHandler_js_1 = __importDefault(require("./ErrorHandler.js"));
const TryCatch = (controller) => async (req, res, next) => {
    try {
        await controller(req, res, next);
    }
    catch (error) {
        console.error("ERROR OCCURRED:");
        console.error(error);
        if (error instanceof ErrorHandler_js_1.default) {
            return res.status(error.statusCode).json({
                message: error.message
            });
        }
        return res.status(500).json({
            message: "Internal Server Error",
            error: error?.message
        });
    }
};
exports.TryCatch = TryCatch;
