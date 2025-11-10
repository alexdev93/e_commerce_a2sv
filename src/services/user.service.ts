import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CreateUserInput, LoginInput } from "../validators/user.validator";
import { ApiResponse } from "../model/ApiResponse";
import { User } from "../entities/user.entity";
import { AppDataSource } from "../config/data-source";

const userRepo = AppDataSource.getMongoRepository(User);
const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret";

export class UserService {
  /**
   * Login user
   */
  static async loginUser(data: LoginInput, response: ApiResponse): Promise<void> {
    const { email, password } = data;

    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      response.success = false;
      response.message = "Invalid Email";
      response.object = null;
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      response.success = false;
      response.message = "Invalid Password";
      response.object = null;
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    response.success = true;
    response.message = "Login successful";
    response.object = {
      token
    };
  }

  /**
   * Register a new user
   */
  static async registerUser(data: CreateUserInput, response: ApiResponse): Promise<void> {
    const { username, email, password } = data;

    // Check if user exists (email or name)
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
      role: "USER",
    });

    await userRepo.save(newUser);

    response.success = true;
    response.message = "User registered successfully";
    response.object = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    };
  }
}
