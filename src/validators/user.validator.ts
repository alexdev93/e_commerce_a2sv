import { z } from "zod";

// ✅ Password validator with all required rules
const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long." })
  .regex(/[A-Z]/, {
    message: "Password must include at least one uppercase letter (A-Z).",
  })
  .regex(/[a-z]/, {
    message: "Password must include at least one lowercase letter (a-z).",
  })
  .regex(/[0-9]/, {
    message: "Password must include at least one number (0-9).",
  })
  .regex(/[^A-Za-z0-9]/, {
    message:
      "Password must include at least one special character (e.g., !@#$%^&*).",
  });

// ✅ Username validator: alphanumeric only
const usernameSchema = z
  .string()
  .min(3, { message: "Username must be at least 3 characters long." })
  .max(30, { message: "Username cannot exceed 30 characters." })
  .regex(/^[a-zA-Z0-9]+$/, {
    message: "Username must be alphanumeric (no spaces or special characters).",
  });

// ✅ User creation schema
export const createUserSchema = z.object({
  username: usernameSchema,
  email: z.string().email("Invalid email format."),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;

export type CreateUserInput = z.infer<typeof createUserSchema>;
