import express from "express";
import { createUserSchema } from "../validators/userValidator";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../model/ApiResponse";
import { UserService } from "../services/user.service";

const userRoutes = express.Router();

userRoutes.post(
  "/auth/register",
  catchAsync(async (req, res): Promise<void> => {
    
    const parseResult = createUserSchema.safeParse(req.body);
    const apiResponse = new ApiResponse({ message: "" });

    if (!parseResult.success) {
      apiResponse.success = false;
      apiResponse.message = "Validation failed";
      apiResponse.errors = parseResult.error.issues.map((err) => err.message);
      res.status(400).json(apiResponse);
      return;
    }

    await UserService.registerUser(parseResult.data, apiResponse);
    res.status(apiResponse.success ? 201 : 400).json(apiResponse);
  })
);

export default userRoutes;
