import express from "express";
import { catchAsync } from "../utils/catchAsync";
import { createProductSchema, getProductsQuerySchema, updateProductSchema } from "../validators/product.validator";
import { ApiResponse } from "../model/ApiResponse";
import { ProductService } from "../services/product.service";
import { authorizeRoles, verifyJwt } from "../middleware/authHandler";
import { ObjectId } from "mongodb";
import { PaginatedResponse } from "../model/PaginatedResponse";

const productRoutes = express.Router();

/**
 * @route POST /products
 * @desc Create a new product (Admin only)
 */
productRoutes.post(
    "/",
    verifyJwt,
    authorizeRoles(["ADMIN"]),
    catchAsync(async (req, res): Promise<void> => {
        const apiResponse = new ApiResponse({ message: "" });

        const parseResult = createProductSchema.safeParse(req.body);
        if (!parseResult.success) {
            apiResponse.success = false;
            apiResponse.message = "Validation failed";
            apiResponse.errors = parseResult.error.issues.map((err) => err.message);
            res.status(400).json(apiResponse);
            return;
        }

        console.log("🟢 Controller (Create) User:", req.user);
        const adminId = req.user?.userId;

        if (!adminId) {
            apiResponse.success = false;
            apiResponse.message = "Unauthorized";
            apiResponse.errors = ["Missing admin ID from token"];
            res.status(401).json(apiResponse);
            return;
        }

        const result = await ProductService.createProduct(adminId, parseResult.data);

        apiResponse.success = result.success;
        apiResponse.message = result.message;
        apiResponse.object = result.object;
        apiResponse.errors = result.errors;

        res.status(apiResponse.success ? 201 : 400).json(apiResponse);
        return;
    })
);

/**
 * @route PUT /products/:id
 * @desc Update existing product (Admin only)
 */
productRoutes.put(
    "/:id",
    verifyJwt,
    authorizeRoles(["ADMIN"]),
    catchAsync(async (req, res): Promise<void> => {
        const apiResponse = new ApiResponse({ message: "" });

        const parseResult = updateProductSchema.safeParse(req.body);
        if (!parseResult.success) {
            apiResponse.success = false;
            apiResponse.message = "Validation failed";
            apiResponse.errors = parseResult.error.issues.map((err) => err.message);
            res.status(400).json(apiResponse);
            return;
        }

        console.log("🟡 Controller (Update) User:", req.user);
        const adminId = req.user?.userId || "";

        if (!adminId) {
            apiResponse.success = false;
            apiResponse.message = "Unauthorized";
            apiResponse.errors = ["Missing admin ID from token"];
            res.status(401).json(apiResponse);
            return;
        }

        const productId: ObjectId | string = req.params.id;
        const result = await ProductService.updateProduct(productId, parseResult.data);

        apiResponse.success = result.success;
        apiResponse.message = result.message;
        apiResponse.object = result.object;
        apiResponse.errors = result.errors;

        res.status(result.success ? 200 : result.message === "Product not found" ? 404 : 400).json(apiResponse);
    })
);

/**
 * @route GET /products
 * @desc Get a paginated list of products (public)
 */
productRoutes.get(
    "/",
    catchAsync(async (req, res): Promise<void> => {
        const apiResponse = new PaginatedResponse({ message: "" });

        // Validate query parameters
        const parseResult = getProductsQuerySchema.safeParse(req.query);
        if (!parseResult.success) {
            apiResponse.success = false;
            apiResponse.message = "Invalid query parameters";
            apiResponse.errors = parseResult.error.issues.map((err) => err.message);
            res.status(400).json(apiResponse);
            return;
        }

        const { page, pageSize } = parseResult.data;

        // Fetch products with pagination
        const result = await ProductService.getProducts({ page, pageSize });


        res.status(result.success ? 200 : 400).json(result);
    })
);

export default productRoutes;
