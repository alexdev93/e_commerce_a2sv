import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entities/user.entity";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret";

describe("POST /products", () => {
    let connection: DataSource;
    let adminToken: string;
    let userToken: string;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        await connection.synchronize(true);

        const repo = connection.getRepository(User);

        // Create Admin user
        const admin = repo.create({
            username: "admin",
            email: "admin@example.com",
            password: await bcrypt.hash("AdminPass123!", 12),
            role: "ADMIN",
        });
        await repo.save(admin);

        adminToken = jwt.sign(
            { userId: admin.id, username: admin.username, role: admin.role },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        // Create normal user
        const user = repo.create({
            username: "normaluser",
            email: "user@example.com",
            password: await bcrypt.hash("UserPass123!", 12),
            role: "USER",
        });
        await repo.save(user);

        userToken = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: "8h" }
        );
    });

    afterAll(async () => {
        await connection.destroy();
    });

    afterEach(async () => {
        // Clear product table
        await connection.query(`TRUNCATE TABLE "products" CASCADE`);
    });

    it("should allow ADMIN to create a product", async () => {
        const res = await request(app)
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
        const res = await request(app)
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
        const res = await request(app)
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
        const res = await request(app).post("/products").send({
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
