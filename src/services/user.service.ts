import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CreateUserInput, LoginInput } from "../validators/user.validator";
import { ApiResponse } from "../dto/ApiResponse";
import { User } from "../entities/user.entity";
import { AppDataSource } from "../config/data-source";

const userRepo = AppDataSource.getRepository(User); // PostgreSQL repository
const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret";

export class UserService {
  /**
   * Login user
   */
  static async loginUser(data: LoginInput, response: ApiResponse): Promise<void> {
    try {
      const { email, password } = data;

      // 1️⃣ Check if user exists
      const user = await userRepo.findOne({ where: { email } });
      if (!user) {
        response.success = false;
        response.message = "Invalid credentials";
        response.errors = ["Email not found"];
        response.object = null;
        return;
      }

      // 2️⃣ Validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        response.success = false;
        response.message = "Invalid credentials";
        response.errors = ["Incorrect password"];
        response.object = null;
        return;
      }

      // 3️⃣ Generate JWT
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "8h" }
      );

      // 4️⃣ Success response
      response.success = true;
      response.message = "Login successful";
      response.object = {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      };
      response.errors = null;
    } catch (err: any) {
      // 5️⃣ Catch unexpected errors
      response.success = false;
      response.message = "Internal server error";
      response.errors = [err.message || String(err)];
      response.object = null;
    }
  }

  /**
   * Register a new user
   */
  static async registerUser(data: CreateUserInput, response: ApiResponse): Promise<void> {
    try {
      const { username, email, password } = data;

      // Check if user exists
      const existingUser = await userRepo.findOne({ where: { email } });
      if (existingUser) {
        response.success = false;
        response.message = "Email or username already exists";
        response.object = null;
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = userRepo.create({
        username,
        email,
        password: hashedPassword,
        role: "ADMIN", // or "USER" as needed
      });

      await userRepo.save(newUser);

      response.success = true;
      response.message = "User registered successfully";
      response.object = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      };
    } catch (err: any) {
      response.success = false;
      response.message = "Internal server error";
      response.errors = [err.message || String(err)];
      response.object = null;
    }
  }
}
