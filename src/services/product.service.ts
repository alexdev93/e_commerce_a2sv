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
    static async createProduct(user: { adminId: ObjectId, userRole: string }, data: CreateProductInput): Promise<ApiResponse> {
        try {
            // 1. Verify Admin user
            const admin = await userRepo.findOneBy({ id: new ObjectId(user.adminId) });
            if (!admin) {
                return { success: false, message: "Admin user not found", object: null, errors: ["Unauthorized"] };
            }
            if (admin.role !== user.userRole) {
                return { success: false, message: "Access denied", object: null, errors: ["Forbidden"] };
            }

            // 2. Create product
            const product = productRepo.create({
                name: data.name,
                description: data.description,
                price: data.price,
                stock: data.stock,
                category: data.category,
                userId: admin.id
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
