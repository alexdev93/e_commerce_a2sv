import express from "express";
import { catchAsync } from "../utils/catchAsync";
import { createProductSchema } from "../validators/product.validator";
import { ApiResponse } from "../model/ApiResponse";
import { ProductService } from "../services/product.service";
import { authorizeRoles, verifyJwt } from "../middleware/authHandler";

const productRoutes = express.Router();

productRoutes.post(
    "/",
    verifyJwt,
    authorizeRoles(["ADMIN"]),
    catchAsync(async (req, res): Promise<void> => {
        const parseResult = createProductSchema.safeParse(req.body);
        const apiResponse = new ApiResponse({ message: "" });

        // 1️⃣ Validate request body
        if (!parseResult.success) {
            apiResponse.success = false;
            apiResponse.message = "Validation failed";
            apiResponse.errors = parseResult.error.issues.map((err) => err.message);
            res.status(400).json(apiResponse);
            return;
        }

        // 2️⃣ Get adminId from JWT payload
        const adminId = req.user?.userId;
        if (!adminId) {
            apiResponse.success = false;
            apiResponse.message = "Unauthorized";
            apiResponse.errors = ["Missing admin ID from token"];
            res.status(401).json(apiResponse);
            return;
        }

        // 3️⃣ Create product
        const result = await ProductService.createProduct(adminId, parseResult.data);

        // 4️⃣ Return standardized response
        apiResponse.success = result.success;
        apiResponse.message = result.message;
        apiResponse.object = result.object;
        apiResponse.errors = result.errors;

        res.status(apiResponse.success ? 201 : 400).json(apiResponse);
    })
);

export default productRoutes;
