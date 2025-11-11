// src/utils/createAdminUser.ts
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user.entity";

export const createAdminUser = async () => {
    const userRepo = AppDataSource.getRepository(User);
    const existingAdmin = await userRepo.findOne({ where: { role: "ADMIN" } });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("Admin@123", 10);
        const admin = userRepo.create({
            username: "admin",
            email: "admin@email.com",
            password: hashedPassword,
            role: "ADMIN",
        });

        await userRepo.save(admin);
        console.log("✅ Default admin user created: admin@email.com / Admin@123");
    }
};
