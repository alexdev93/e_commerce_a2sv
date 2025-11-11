import { ObjectId } from "mongodb";
import { AppDataSource } from "../config/data-source";
import { Product } from "../entities/product.entity";
import { User } from "../entities/user.entity";
import { ApiResponse } from "../model/ApiResponse";
import { CreateProductInput, UpdateProductInput } from "../validators/product.validator";

const productRepo = AppDataSource.getMongoRepository(Product);
const userRepo = AppDataSource.getMongoRepository(User);

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
}
