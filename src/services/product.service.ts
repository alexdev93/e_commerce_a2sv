import { ObjectId } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Product } from "../entities/product.entity";
import { User, UserRole } from "../entities/user.entity";
import { ApiResponse } from "../model/ApiResponse";
import { CreateProductInput } from "../validators/product.validator";

const productRepo = AppDataSource.getMongoRepository(Product);
const userRepo = AppDataSource.getMongoRepository(User);

export class ProductService {
    /**
     * Create a new product (Admin only)
     */
    static async createProduct(adminId: string, data: CreateProductInput): Promise<ApiResponse> {
        try {

            // 2. Create product
            const product = productRepo.create({
                name: data.name,
                description: data.description,
                price: data.price,
                stock: data.stock,
                category: data.category,
                userId: adminId
            });

            await productRepo.save(product);

            return { success: true, message: "Product created successfully", object: product, errors: null };
        } catch (err) {
            console.error("Error creating product:", err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            return { success: false, message: "Internal server error", object: null, errors: [errorMessage] };
        }
    }
}
