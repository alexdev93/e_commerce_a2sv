import express from "express";
import { catchAsync } from "../utils/catchAsync";
import { verifyJwt, authorizeRoles } from "../middleware/authHandler";
import { ApiResponse } from "../model/ApiResponse";
import { OrderService } from "../services/order.service";

const orderRoutes = express.Router();

/**
 * @route   POST /orders
 * @desc    Place a new order
 * @access  Private (User only)
 */
orderRoutes.post(
    "/",
    verifyJwt,
    authorizeRoles(["USER"]),
    catchAsync(async (req, res): Promise<void> => {
        const userId = req.user?.userId;
        const orderItems = req.body; // expected to be an array [{productId, quantity}, ...]

        if (!Array.isArray(orderItems) || orderItems.length === 0) {
            const response = new ApiResponse({
                success: false,
                message: "Order items must be a non-empty array",
                errors: ["Invalid request body"],
            });
            res.status(400).json(response);
            return;
        }

        const result = await OrderService.placeOrder(userId ?? "", orderItems);

        if (!result.success) {
            if (result.errors && result.errors[0]?.includes("not found")) {
                res.status(404).json(result);
                return;
            }
            if (result.errors && result.errors[0]?.includes("Insufficient stock")) {
                res.status(400).json(result);
                return;
            }
            res.status(500).json(result);
            return;
        }

        res.status(201).json(result);
        return;
    })
);

export default orderRoutes ;
