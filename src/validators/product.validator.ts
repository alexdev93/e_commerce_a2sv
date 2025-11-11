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


export const updateProductSchema = z.object({
    name: z
        .string({ message: "Name is required" })
        .min(3, "Name must be at least 3 characters long")
        .max(100, "Name must not exceed 100 characters")
        .optional(),

    description: z
        .string({ message: "Description is required" })
        .min(10, "Description must be at least 10 characters long")
        .optional(),

    price: z
        .preprocess(
            (val) => (val !== "" ? Number(val) : undefined),
            z.number().positive("Price must be greater than 0")
        )
        .optional(),

    stock: z
        .preprocess(
            (val) => (val !== "" ? Number(val) : undefined),
            z.number().int().nonnegative("Stock cannot be negative")
        )
        .optional(),

    category: z
        .string({ message: "Category is required" })
        .min(3, "Category must be at least 3 characters long")
        .optional(),
});

export const getProductsQuerySchema = z.object({
    page: z.preprocess((val) => {
        const parsed = Number(val);
        return isNaN(parsed) || parsed <= 0 ? 1 : parsed;
    }, z.number()),

    pageSize: z.preprocess((val) => {
        const parsed = Number(val);
        return isNaN(parsed) || parsed <= 0 ? 10 : parsed;
    }, z.number().max(100, { message: "Page size must be between 1 and 100" })),

    search: z.string().optional(),
});

export type GetProductsInput = z.infer<typeof getProductsQuerySchema>;

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export type CreateProductInput = z.infer<typeof createProductSchema>;