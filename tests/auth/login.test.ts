import request from "supertest";
import { DataSource } from "typeorm";
import  app  from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entities/user.entity";
import bcrypt from "bcryptjs";

describe("POST /auth/login", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        await connection.synchronize(true);
    });

    afterAll(async () => {
        await connection.destroy();
    });

    afterEach(async () => {
        // Clear DB between tests
        await connection.query(`TRUNCATE TABLE "orders" CASCADE`);
        await connection.query(`TRUNCATE TABLE "products" CASCADE`);
        await connection.query(`TRUNCATE TABLE "users" CASCADE`);
    });

    const createUser = async (overrides?: Partial<User>) => {
        const repo = connection.getRepository(User);
        const user = repo.create({
            username: "testuser",
            email: "testuser@example.com",
            password: await bcrypt.hash("Password123!", 12),
            role: "USER",
            ...overrides,
        });
        await repo.save(user);
        return user;
    };

    it("should login successfully with correct credentials", async () => {
        await createUser();

        const res = await request(app)
            .post("/auth/login")
            .send({
                email: "testuser@example.com",
                password: "Password123!",
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Login successful");
        expect(res.body.object).toHaveProperty("token");
        expect(res.body.object.user).toMatchObject({
            username: "testuser",
            email: "testuser@example.com",
        });
        expect(res.body.object.user).not.toHaveProperty("password");
    });

    it("should fail login if email does not exist", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                email: "nonexistent@example.com",
                password: "Password123!",
            });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Invalid credentials");
        expect(res.body.errors).toContain("Email not found");
    });

    it("should fail login if password is incorrect", async () => {
        await createUser();

        const res = await request(app)
            .post("/auth/login")
            .send({
                email: "testuser@example.com",
                password: "WrongPassword1!",
            });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Invalid credentials");
        expect(res.body.errors).toContain("Incorrect password");
    });

    it("should fail login if email format is invalid", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                email: "invalid-email",
                password: "Password123!",
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        // adjust according to your validation error message
        expect(res.body.errors).toContain("Invalid email format");
    });
});
