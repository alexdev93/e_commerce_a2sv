import { AppDataSource } from "../config/data-source";
import { Product } from "../entities/product.entity";
import { User } from "../entities/user.entity";
import { ApiResponse } from "../model/ApiResponse";
import { CreateProductInput, UpdateProductInput, GetProductsInput } from "../validators/product.validator";
import { PaginatedResponse } from "../model/PaginatedResponse";

const productRepo = AppDataSource.getRepository(Product);
const userRepo = AppDataSource.getRepository(User);

export class ProductService {
    /**
     * Create a new product (Admin only)
     */
    static async createProduct(adminId: string, data: CreateProductInput): Promise<ApiResponse> {
        const apiResponse = new ApiResponse({ message: "" });

        try {
            const admin = await userRepo.findOne({ where: { id: adminId } });
            if (!admin) throw new Error("Admin not found");

            const product = productRepo.create({
                ...data,
                user: admin,
            });

            await productRepo.save(product);

            apiResponse.success = true;
            apiResponse.message = "Product created successfully";
            apiResponse.object = product;
            return apiResponse;
        } catch (err: any) {
            apiResponse.success = false;
            apiResponse.message = "Internal server error";
            apiResponse.errors = [err.message || String(err)];
            return apiResponse;
        }
    }

    /**
     * Update an existing product (Admin only)
     */
    static async updateProduct(productId: string, data: UpdateProductInput): Promise<ApiResponse> {
        const apiResponse = new ApiResponse({ message: "" });

        try {
            const product = await productRepo.findOne({ where: { id: productId } });
            if (!product) {
                apiResponse.success = false;
                apiResponse.message = "Product not found";
                apiResponse.errors = [`No product found with ID ${productId}`];
                return apiResponse;
            }

            Object.assign(product, data);
            await productRepo.save(product);

            apiResponse.success = true;
            apiResponse.message = "Product updated successfully";
            apiResponse.object = product;
            return apiResponse;
        } catch (err: any) {
            apiResponse.success = false;
            apiResponse.message = "Internal server error";
            apiResponse.errors = [err.message || String(err)];
            return apiResponse;
        }
    }

    /**
     * Get paginated list of products (public)
     */
    static async getProducts({ page, pageSize, search }: GetProductsInput): Promise<ApiResponse> {
        const apiResponse = new PaginatedResponse({ message: "" });

        try {
            const query = productRepo.createQueryBuilder("product");

            if (search?.trim()) {
                query.where("LOWER(product.name) LIKE :search", { search: `%${search.toLowerCase()}%` });
            }

            const totalProducts = await query.getCount();

            const products = await query
                .orderBy("product.name", "ASC")
                .skip((page - 1) * pageSize)
                .take(pageSize)
                .getMany();

            apiResponse.success = true;
            apiResponse.message = "Products retrieved successfully";
            apiResponse.pageNumber = page;
            apiResponse.pageSize = pageSize;
            apiResponse.totalSize = totalProducts;
            apiResponse.object = {
                products: products.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    stock: p.stock,
                    category: p.category,
                })),
            };

            return apiResponse;
        } catch (err: any) {
            apiResponse.success = false;
            apiResponse.message = "Failed to retrieve products";
            apiResponse.errors = [err.message || String(err)];
            return apiResponse;
        }
    }

    /**
     * Get product details by ID (public)
     */
    static async getProductById(productId: string): Promise<ApiResponse> {
        const apiResponse = new ApiResponse({ message: "" });

        try {
            const product = await productRepo.findOne({ where: { id: productId } });
            if (!product) {
                apiResponse.success = false;
                apiResponse.message = "Product not found";
                apiResponse.errors = [`No product found with ID ${productId}`];
                return apiResponse;
            }

            apiResponse.success = true;
            apiResponse.message = "Product retrieved successfully";
            apiResponse.object = product;
            return apiResponse;
        } catch (err: any) {
            apiResponse.success = false;
            apiResponse.message = "Failed to retrieve product";
            apiResponse.errors = [err.message || String(err)];
            return apiResponse;
        }
    }

    /**
     * Delete a product (Admin only)
     */
    static async deleteProduct(productId: string): Promise<ApiResponse> {
        const apiResponse = new ApiResponse({ message: "" });

        try {
            const product = await productRepo.findOne({ where: { id: productId } });
            if (!product) {
                apiResponse.success = false;
                apiResponse.message = "Product not found";
                apiResponse.errors = [`No product found with ID ${productId}`];
                return apiResponse;
            }

            await productRepo.remove(product);

            apiResponse.success = true;
            apiResponse.message = "Product deleted successfully";
            apiResponse.object = null;
            return apiResponse;
        } catch (err: any) {
            apiResponse.success = false;
            apiResponse.message = "Failed to delete product";
            apiResponse.errors = [err.message || String(err)];
            return apiResponse;
        }
    }
}
