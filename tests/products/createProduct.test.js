"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../src/app"));
const data_source_1 = require("../../src/config/data-source");
const user_entity_1 = require("../../src/entities/user.entity");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret";
describe("POST /products", () => {
    let connection;
    let adminToken;
    let userToken;
    beforeAll(async () => {
        connection = await data_source_1.AppDataSource.initialize();
        await connection.synchronize(true);
        const repo = connection.getRepository(user_entity_1.User);
        // Create Admin user
        const admin = repo.create({
            username: "admin",
            email: "admin@example.com",
            password: await bcryptjs_1.default.hash("AdminPass123!", 12),
            role: "ADMIN",
        });
        await repo.save(admin);
        adminToken = jsonwebtoken_1.default.sign({ userId: admin.id, username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: "8h" });
        // Create normal user
        const user = repo.create({
            username: "normaluser",
            email: "user@example.com",
            password: await bcryptjs_1.default.hash("UserPass123!", 12),
            role: "USER",
        });
        await repo.save(user);
        userToken = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
    });
    afterAll(async () => {
        await connection.destroy();
    });
    afterEach(async () => {
        // Clear product table
        await connection.query(`TRUNCATE TABLE "products" CASCADE`);
    });
    it("should allow ADMIN to create a product", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/products")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
            name: "Laptop",
            description: "High performance laptop",
            price: 1500,
            stock: 10,
            category: "Electronics",
        });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Product created successfully");
        expect(res.body.object).toMatchObject({
            name: "Laptop",
            description: "High performance laptop",
            price: 1500,
            stock: 10,
            category: "Electronics",
        });
    });
    it("should not allow normal USER to create a product", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/products")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
            name: "Laptop",
            description: "High performance laptop",
            price: 1500,
            stock: 10,
            category: "Electronics",
        });
        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Forbidden: Admins only");
    });
    it("should fail if required fields are missing", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/products")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
            name: "",
            price: -5,
        });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toContain("Name must be between 3 and 100 characters");
        expect(res.body.errors).toContain("Price must be greater than 0");
    });
    it("should fail if not authenticated", async () => {
        const res = await (0, supertest_1.default)(app_1.default).post("/products").send({
            name: "Laptop",
            description: "High performance laptop",
            price: 1500,
            stock: 10,
            category: "Electronics",
        });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Unauthorized");
    });
});
