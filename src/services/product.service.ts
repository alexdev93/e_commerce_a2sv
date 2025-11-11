import { ObjectId } from "mongodb";
import { AppDataSource } from "../config/data-source";
import { Product } from "../entities/product.entity";
import { User } from "../entities/user.entity";
import { ApiResponse } from "../model/ApiResponse";
import { CreateProductInput, UpdateProductInput, GetProductsInput } from "../validators/product.validator";
import { PaginatedResponse } from "../model/PaginatedResponse";
import { AppError } from "../utils/AppError";

const productRepo = AppDataSource.getMongoRepository(Product);
// const userRepo = AppDataSource.getMongoRepository(User);


export class ProductService {
    /**
     * Create a new product (Admin only)
     */
    static async createProduct(adminId: string, data: CreateProductInput): Promise<ApiResponse> {
        const apiResponse = new ApiResponse({ message: "" });

        try {
            // 1️⃣ Create product entity
            const product = productRepo.create({
                name: data.name,
                description: data.description,
                price: data.price,
                stock: data.stock,
                category: data.category,
                userId: adminId
            });

            // 2️⃣ Save to DB
            await productRepo.save(product);

            // 3️⃣ Success response
            apiResponse.success = true;
            apiResponse.message = "Product created successfully";
            apiResponse.object = product;
            return apiResponse;

        } catch (err) {
            console.error("Error creating product:", err);
            const errorMessage = err instanceof Error ? err.message : String(err);

            apiResponse.success = false;
            apiResponse.message = "Internal server error";
            apiResponse.errors = [errorMessage];
            return apiResponse;
        }
    }

    /**
     * Update an existing product (Admin only)
     */
    static async updateProduct(productId: string | ObjectId, data: UpdateProductInput): Promise<ApiResponse> {
        const apiResponse = new ApiResponse({ message: "" });

        try {
            // 1️⃣ Check if product exists
            console.log("productid: ", productId);

            const product = await productRepo.findOneBy({ _id: new ObjectId(productId) });
            if (!product) {
                apiResponse.success = false;
                apiResponse.message = "Product not found";
                apiResponse.errors = [`No product found with ID ${productId}`];
                return apiResponse;
            }

            // 2️⃣ Update only provided fields
            Object.assign(product, data);

            // 3️⃣ Save updated product
            await productRepo.save(product);

            // 4️⃣ Success response
            apiResponse.success = true;
            apiResponse.message = "Product updated successfully";
            apiResponse.object = product;
            return apiResponse;

        } catch (err) {
            console.error("Error updating product:", err);
            const errorMessage = err instanceof Error ? err.message : String(err);

            apiResponse.success = false;
            apiResponse.message = "Internal server error";
            apiResponse.errors = [errorMessage];
            return apiResponse;
        }
    }

    /**
   * Get paginated list of products (public)
   */
    static async getProducts({ page, pageSize, search }: GetProductsInput): Promise<ApiResponse> {
        const apiResponse = new PaginatedResponse({ message: "" });

        try {
            let whereClause = {};
            if (search && search.trim() !== "") {
                // Case-insensitive partial match on product name
                const regex = new RegExp(search.trim(), "i"); // "i" for case-insensitive
                whereClause = { name: { $regex: regex } };
            }

            // 1️⃣ Count total matching products
            const totalProducts = await productRepo.count({ where: whereClause });

            // 2️⃣ Calculate total pages
            const totalPages = Math.ceil(totalProducts / pageSize);

            // 3️⃣ Fetch products with pagination and search
            const products = await productRepo.find({
                where: whereClause,
                skip: (page - 1) * pageSize,
                take: pageSize,
                order: { name: "ASC" },
            });

            // 4️⃣ Map products to essential info
            const productList = products.map((p) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                stock: p.stock,
                category: p.category,
            }));

            // 5️⃣ Return success response
            apiResponse.success = true;
            apiResponse.message = "Products retrieved successfully";
            apiResponse.pageNumber = page;
            apiResponse.pageSize = pageSize;
            apiResponse.totalSize = totalProducts;
            apiResponse.object = {
                products: productList,
            };

            return apiResponse;
        } catch (err) {
            console.error("Error fetching products:", err);
            const errorMessage = err instanceof Error ? err.message : String(err);

            apiResponse.success = false;
            apiResponse.message = "Failed to retrieve products";
            apiResponse.errors = [errorMessage];
            return apiResponse;
        }
    }

    /**
  * Get product details by ID (public)
  */
    static async getProductById(productId: string): Promise<ApiResponse> {
        const apiResponse = new ApiResponse({ message: "" });

        try {
            // Validate ObjectId
            if (!ObjectId.isValid(productId)) {
                apiResponse.success = false;
                apiResponse.message = "Invalid product ID format";
                apiResponse.errors = ["The provided ID is not a valid ObjectId"];
                return apiResponse;
            }

            // Find product by ID
            const product = await productRepo.findOneBy({ _id: new ObjectId(productId) });

            if (!product) {
                apiResponse.success = false;
                apiResponse.message = "Product not found";
                apiResponse.errors = [`No product found with ID ${productId}`];
                return apiResponse;
            }

            // Success response
            apiResponse.success = true;
            apiResponse.message = "Product retrieved successfully";
            apiResponse.object = product;
            return apiResponse;
        } catch (error) {
            apiResponse.success = false;
            apiResponse.message = "Failed to retrieve product";
            apiResponse.errors = [error.message];
            return apiResponse;
        }
    }
}
