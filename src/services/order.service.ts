import { ObjectId } from "mongodb";
import { AppDataSource } from "../config/data-source";
import { ApiResponse } from "../model/ApiResponse";
import { Order } from "../entities/order.entity";
import { Product } from "../entities/product.entity";
import { User } from "../entities/user.entity";
import { AppError } from "../utils/AppError";

const orderRepo = AppDataSource.getMongoRepository(Order);
const productRepo = AppDataSource.getMongoRepository(Product);
const userRepo = AppDataSource.getMongoRepository(User);

export class OrderService {
    /**
     * Place a new order
     */
    static async placeOrder(userId: string, orderItems: { productId: string; quantity: number }[]): Promise<ApiResponse> {
        const apiResponse = new ApiResponse({ message: "" });

        try {
            // Validate user
            const user = await userRepo.findOneBy({ _id: new ObjectId(userId) });
            if (!user) {
                apiResponse.success = false;
                apiResponse.message = "User not found";
                apiResponse.errors = ["Invalid user"];
                return apiResponse;
            }

            // Validate and prepare products
            let totalPrice = 0;
            const orderedProducts: { productId: ObjectId; quantity: number }[] = [];

            // We'll use a session-like transaction (MongoDB-style)
            const queryRunner = AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                for (const item of orderItems) {
                    const product = await productRepo.findOneBy({ _id: new ObjectId(item.productId) });
                    if (!product) {
                        throw new AppError(`Product not found with ID: ${item.productId}`);
                    }

                    if (product.stock < item.quantity) {
                        throw new AppError(`Insufficient stock for product: ${product.name}`);
                    }

                    // Calculate total
                    totalPrice += product.price * item.quantity;

                    // Deduct stock
                    product.stock -= item.quantity;
                    await queryRunner.manager.save(Product, product);

                    orderedProducts.push({
                        productId: new ObjectId(item.productId),
                        quantity: item.quantity,
                    });
                }

                // Create the order
                const newOrder = orderRepo.create({
                    userId: new ObjectId(userId),
                    description: `Order with ${orderedProducts.length} items`,
                    totalPrice,
                    status: "pending",
                    products: orderedProducts,
                });

                await queryRunner.manager.save(Order, newOrder);
                await queryRunner.commitTransaction();

                apiResponse.success = true;
                apiResponse.message = "Order placed successfully";
                apiResponse.object = newOrder;
                return apiResponse;
            } catch (error: any) {
                await queryRunner.rollbackTransaction();
                apiResponse.success = false;
                apiResponse.message = "Error placing order";
                apiResponse.errors = [error.message];
                return apiResponse;
            } finally {
                await queryRunner.release();
            }
        } catch (error: any) {
            apiResponse.success = false;
            apiResponse.message = "Failed to place order";
            apiResponse.errors = [error.message];
            return apiResponse;
        }
    }
}
