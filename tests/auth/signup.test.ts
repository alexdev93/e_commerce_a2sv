import request from "supertest";
import { DataSource } from "typeorm";
import  app  from "../../src/app"; // your Express app
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entities/user.entity";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        // Initialize the test database
        connection = await AppDataSource.initialize();
        await connection.synchronize(true); // reset DB
    });

    afterAll(async () => {
        await connection.destroy();
    });

    afterEach(async () => {
        // Clear all tables safely respecting FK constraints
        await connection.query(`TRUNCATE TABLE "orders" CASCADE`);
        await connection.query(`TRUNCATE TABLE "products" CASCADE`);
        await connection.query(`TRUNCATE TABLE "users" CASCADE`);
    });

    it("should register a new user successfully", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({
                username: "testuser",
                email: "testuser@example.com",
                password: "Password123!",
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("User registered successfully");
        expect(res.body.object).toMatchObject({
            username: "testuser",
            email: "testuser@example.com",
        });
        expect(res.body.object).not.toHaveProperty("password");
    });

    it("should fail if email is already registered", async () => {
        // Create a user first
        await request(app).post("/auth/register").send({
            username: "testuser",
            email: "testuser@example.com",
            password: "Password123!",
        });

        const res = await request(app)
            .post("/auth/register")
            .send({
                username: "anotheruser",
                email: "testuser@example.com",
                password: "Password123!",
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Email or username already exists");
    });

    it("should fail if username is already taken", async () => {
        // Create a user first
        await request(app).post("/auth/register").send({
            username: "testuser",
            email: "testuser1@example.com",
            password: "Password123!",
        });

        const res = await request(app)
            .post("/auth/register")
            .send({
                username: "testuser",
                email: "testuser2@example.com",
                password: "Password123!",
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Email or username already exists");
    });

    it("should fail if password is weak", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({
                username: "weakpassuser",
                email: "weakpass@example.com",
                password: "weak", // weak password
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toContain(
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
        );
    });
});
