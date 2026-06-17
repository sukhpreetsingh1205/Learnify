import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  createOrder,
  stripeWebhook,
  verifyPayment,
} from "../controllers/orderController.js";

let paymentRouter = express.Router();

paymentRouter.post("/webhook", stripeWebhook);
paymentRouter.post("/create-order", isAuth, createOrder);
paymentRouter.post("/verify-payment", isAuth, verifyPayment);

export default paymentRouter;
