import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entities/user.entity";
import { Product } from "../../src/entities/product.entity";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret";

describe("POST /orders", () => {
    let connection: DataSource;
    let userToken: string;
    let product1: Product;
    let product2: Product;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        await connection.synchronize(true);

        // Create user
        const userRepo = connection.getRepository(User);
        const user = userRepo.create({
            username: "testuser",
            email: "testuser@example.com",
            password: await bcrypt.hash("Password123!", 12),
            role: "USER",
        });
        await userRepo.save(user);

        userToken = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        // Create products
        const productRepo = connection.getRepository(Product);
        product1 = productRepo.create({
            name: "Laptop",
            description: "High performance laptop",
            price: 1500,
            stock: 5,
            category: "Electronics",
            userId: user.id,
        });
        product2 = productRepo.create({
            name: "Phone",
            description: "Latest smartphone",
            price: 800,
            stock: 3,
            category: "Electronics",
            userId: user.id,
        });
        await productRepo.save([product1, product2]);
    });

    afterAll(async () => {
        await connection.destroy();
    });

    afterEach(async () => {
        // Clean orders table
        await connection.query(`TRUNCATE TABLE "orders" CASCADE`);
    });

    it("should allow authenticated user to place an order", async () => {
        const res = await request(app)
            .post("/orders")
            .set("Authorization", `Bearer ${userToken}`)
            .send([
                { productId: product1.id, quantity: 2 },
                { productId: product2.id, quantity: 1 },
            ]);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Order placed successfully");
        expect(res.body.object).toHaveProperty("orderId");
        expect(res.body.object.totalPrice).toBe(1500 * 2 + 800 * 1);
        expect(res.body.object.products).toHaveLength(2);
    });

    it("should fail if user tries to order more than available stock", async () => {
        const res = await request(app)
            .post("/orders")
            .set("Authorization", `Bearer ${userToken}`)
            .send([{ productId: product2.id, quantity: 10 }]); // exceeds stock

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Insufficient stock for Phone");
    });

    it("should fail if productId does not exist", async () => {
        const res = await request(app)
            .post("/orders")
            .set("Authorization", `Bearer ${userToken}`)
            .send([{ productId: "non-existent-uuid", quantity: 1 }]);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Product not found");
    });

    it("should fail if user is not authenticated", async () => {
        const res = await request(app).post("/orders").send([
            { productId: product1.id, quantity: 1 },
        ]);

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Unauthorized");
    });
});
