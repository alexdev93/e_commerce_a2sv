import bcrypt from "bcryptjs";
import { CreateUserInput, LoginInput } from "../validators/userValidator";
import { ApiResponse } from "../model/ApiResponse";
import { User } from "../model/user.model";

export class UserService {

  static async loginUser(data: LoginInput, response: ApiResponse): Promise<void> {
    // const user = await User.findOne({ email });
    // if (user && (await bcrypt.compare(password, user.password!))) {
    //   // return user;
    // }
  }


  /**
   * Register a new user
   * @param data User input
   * @param response ApiResponse object passed by reference
   */
  static async registerUser(
    data: CreateUserInput,
    response: ApiResponse
  ): Promise<void> {
    const { name, email, password } = data;

    // Check if email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }, { name }] });
    if (existingUser) {
      response.success = false;
      response.message = "Email or username already exists";
      response.object = null;
      response.errors = null;
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
      await user.save();
      
    response.success = true;
    response.message = "User registered successfully";
    response.object = {
      id: user._id,
      name: user.name,
      email: user.email,
    };
    response.errors = null;
  }

}
