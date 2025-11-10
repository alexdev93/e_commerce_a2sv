import { z } from "zod";

export const createProductSchema = z.object({
    name: z
        .string()
        .min(3, { message: "Name must be at least 3 characters long." })
        .max(100, { message: "Name must not exceed 100 characters." }),

    description: z
        .string()
        .min(10, { message: "Description must be at least 10 characters long." }),

    price: z
        .number({ error: "Price must be a number." })
        .positive({ message: "Price must be a positive number." }),

    stock: z
        .number({ error: "Stock must be a number." })
        .int({ message: "Stock must be an integer." })
        .nonnegative({ message: "Stock cannot be negative." }),

    category: z
        .string()
        .min(1, { message: "Category is required." })
});

export type CreateProductInput = z.infer<typeof createProductSchema>;