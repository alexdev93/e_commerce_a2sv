"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../src/app"));
const data_source_1 = require("../../src/config/data-source");
const user_entity_1 = require("../../src/entities/user.entity");
const product_entity_1 = require("../../src/entities/product.entity");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret";
describe("POST /orders", () => {
    let connection;
    let userToken;
    let product1;
    let product2;
    beforeAll(async () => {
        connection = await data_source_1.AppDataSource.initialize();
        await connection.synchronize(true);
        // Create user
        const userRepo = connection.getRepository(user_entity_1.User);
        const user = userRepo.create({
            username: "testuser",
            email: "testuser@example.com",
            password: await bcryptjs_1.default.hash("Password123!", 12),
            role: "USER",
        });
        await userRepo.save(user);
        userToken = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
        // Create products
        const productRepo = connection.getRepository(product_entity_1.Product);
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
        const res = await (0, supertest_1.default)(app_1.default)
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
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/orders")
            .set("Authorization", `Bearer ${userToken}`)
            .send([{ productId: product2.id, quantity: 10 }]); // exceeds stock
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Insufficient stock for Phone");
    });
    it("should fail if productId does not exist", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/orders")
            .set("Authorization", `Bearer ${userToken}`)
            .send([{ productId: "non-existent-uuid", quantity: 1 }]);
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Product not found");
    });
    it("should fail if user is not authenticated", async () => {
        const res = await (0, supertest_1.default)(app_1.default).post("/orders").send([
            { productId: product1.id, quantity: 1 },
        ]);
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Unauthorized");
    });
});
