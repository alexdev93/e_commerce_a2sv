import express from "express";
import { createUserSchema, loginSchema } from "../validators/user.validator";
import { catchAsync } from "../utils/catchAsync";
import { UserService } from "../services/user.service";
import { ApiResponse } from "../dto/ApiResponse";

const userRoutes = express.Router();

userRoutes.post(
  "/register",
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

userRoutes.post(
  "/login",
  catchAsync(async (req, res): Promise<void> => {

    const parseResult = loginSchema.safeParse(req.body);
    const apiResponse = new ApiResponse({ message: "" });

    if (!parseResult.success) {
      apiResponse.success = false;
      apiResponse.message = "Validation failed";
      apiResponse.errors = parseResult.error.issues.map((err) => err.message);
      res.status(400).json(apiResponse);
      return;
    }

    await UserService.loginUser(parseResult.data, apiResponse);
    res.status(apiResponse.success ? 201 : 400).json(apiResponse);
  })
);

export default userRoutes;
