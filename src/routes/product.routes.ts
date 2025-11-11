import express from "express";
import { catchAsync } from "../utils/catchAsync";
import {
    createProductSchema,
    GetProductsInput,
    getProductsQuerySchema,
    updateProductSchema,
} from "../validators/product.validator";
import { ApiResponse } from "../dto/ApiResponse";
import { ProductService } from "../services/product.service";
import { authorizeRoles, verifyJwt } from "../middleware/authHandler";
import { PaginatedResponse } from "../dto/PaginatedResponse";
import multer from "multer";

const productRoutes = express.Router();
const upload = multer({ dest: "uploads/" });

/**
 * @route POST /products
 * @desc Create a new product (Admin only)
 */
productRoutes.post(
    "/",
    verifyJwt,
    authorizeRoles(["ADMIN"]),
    upload.single("image"),
    catchAsync(async (req, res) => {
        const apiResponse = new ApiResponse({ message: "" });

        const parseResult = createProductSchema.safeParse(req.body);
        if (!parseResult.success) {
            apiResponse.success = false;
            apiResponse.message = "Validation failed";
            apiResponse.errors = parseResult.error.issues.map((err) => err.message);
            res.status(400).json(apiResponse);
            return;
        }

        const imageFile = req.file;

        const adminId = req.user?.userId;
        if (!adminId) {
            apiResponse.success = false;
            apiResponse.message = "Unauthorized";
            apiResponse.errors = ["Missing admin ID from token"];
            res.status(401).json(apiResponse);
            return;
        }

        const result = await ProductService.createProduct(adminId, parseResult.data, imageFile);

        res.status(result.success ? 201 : 400).json(result);
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
    catchAsync(async (req, res) => {
        const apiResponse = new ApiResponse({ message: "" });

        const parseResult = updateProductSchema.safeParse(req.body);
        if (!parseResult.success) {
            apiResponse.success = false;
            apiResponse.message = "Validation failed";
            apiResponse.errors = parseResult.error.issues.map((err) => err.message);
            res.status(400).json(apiResponse);
            return;
        }

        const adminId = req.user?.userId;
        if (!adminId) {
            apiResponse.success = false;
            apiResponse.message = "Unauthorized";
            apiResponse.errors = ["Missing admin ID from token"];
            res.status(401).json(apiResponse);
            return;
        }

        const productId = req.params.id; // treat as string UUID
        const result = await ProductService.updateProduct(productId, parseResult.data);

        res
            .status(result.success ? 200 : result.message === "Product not found" ? 404 : 400)
            .json(result);
    })
);

/**
 * @route GET /products
 * @desc Get a paginated list of products (public)
 */
productRoutes.get(
    "/",
    catchAsync(async (req, res) => {
        const parseResult = getProductsQuerySchema.safeParse(req.query);
        if (!parseResult.success) {
            const apiResponse = new PaginatedResponse({ message: "" });
            apiResponse.success = false;
            apiResponse.message = "Invalid query parameters";
            apiResponse.errors = parseResult.error.issues.map((err) => err.message);
            res.status(400).json(apiResponse);
            return;
        }

        const { page, pageSize, search } = parseResult.data as GetProductsInput;
        const result = await ProductService.getProducts({ page, pageSize, search });
        res.status(result.success ? 200 : 400).json(result);
    })
);

/**
 * GET /products/:id
 * Get detailed information of a single product by ID (public)
 */
productRoutes.get(
    "/:id",
    catchAsync(async (req, res) => {
        const productId = req.params.id; // string UUID
        const result = await ProductService.getProductById(productId);

        if (!result.success) {
            res.status(result.message === "Product not found" ? 404 : 400).json(result);
            return;
        }

        res.status(200).json(result);
    })
);

/**
 * @route DELETE /products/:id
 * @desc Delete a product (Admin only)
 */
productRoutes.delete(
    "/:id",
    verifyJwt,
    authorizeRoles(["ADMIN"]),
    catchAsync(async (req, res) => {
        const adminId = req.user?.userId;
        if (!adminId) {
            const apiResponse = new ApiResponse({ message: "" });
            apiResponse.success = false;
            apiResponse.message = "Unauthorized";
            apiResponse.errors = ["Missing admin ID from token"];
            res.status(401).json(apiResponse);
            return;
        }

        const productId = req.params.id; // string UUID
        const result = await ProductService.deleteProduct(productId);
        res
            .status(result.success ? 200 : result.message === "Product not found" ? 404 : 400)
            .json(result);
    })
);

export default productRoutes;
