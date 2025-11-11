import { AppDataSource } from "../config/data-source";
import { ApiResponse } from "../model/ApiResponse";
import { Order } from "../entities/order.entity";
import { Product } from "../entities/product.entity";
import { User } from "../entities/user.entity";

export class OrderService {
    /**
     * Place a new order
     */
    static async placeOrder(
        userId: string,
        orderItems: { productId: string; quantity: number }[]
    ): Promise<ApiResponse> {
        const apiResponse = new ApiResponse({ message: "" });

        try {
            const userRepo = AppDataSource.getRepository(User);
            const productRepo = AppDataSource.getRepository(Product);
            const orderRepo = AppDataSource.getRepository(Order);

            // Find user
            const user = await userRepo.findOne({ where: { id: userId } });
            if (!user) throw new Error("User not found");

            // Start a transaction
            await AppDataSource.transaction(async (manager) => {
                let totalPrice = 0;
                const products: Product[] = [];

                for (const item of orderItems) {
                    const product = await manager.findOne(Product, {
                        where: { id: item.productId },
                    });
                    if (!product) throw new Error(`Product not found: ${item.productId}`);
                    if (product.stock < item.quantity)
                        throw new Error(`Insufficient stock for ${product.name}`);

                    totalPrice += product.price * item.quantity;

                    // Reduce stock
                    product.stock -= item.quantity;
                    await manager.save(product);

                    products.push(product);
                }

                // Create order
                const newOrder = manager.create(Order, {
                    user,
                    totalPrice,
                    status: "pending",
                    description: `Order with ${orderItems.length} items`,
                    products, // ManyToMany relation
                });

                const savedOrder = await manager.save(newOrder);

                apiResponse.success = true;
                apiResponse.message = "Order placed successfully";
                apiResponse.object = savedOrder;
            });

            return apiResponse;
        } catch (error: any) {
            apiResponse.success = false;
            apiResponse.message = "Failed to place order";
            apiResponse.errors = [error.message];
            return apiResponse;
        }
    }

    /**
     * Get all orders for a specific user
     */
    static async getUserOrders(userId: string): Promise<ApiResponse> {
        try {
            const orderRepo = AppDataSource.getRepository(Order);

            const orders = await orderRepo.find({
                where: { user: { id: userId } },
                relations: ["products"], // include products if needed
                order: { createdAt: "DESC" },
                select: ["id", "status", "totalPrice", "createdAt"],
            });

            return {
                success: true,
                message: "User orders retrieved successfully",
                object: orders,
                errors: null,
            };
        } catch (error: any) {
            return {
                success: false,
                message: "Failed to retrieve user orders",
                object: null,
                errors: [error.message],
            };
        }
    }
}
