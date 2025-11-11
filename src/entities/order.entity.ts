import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Order {
    @ObjectIdColumn()
    id!: ObjectId;

    @Column()
    userId!: ObjectId; // reference to the User who placed the order

    @Column()
    description?: string;

    @Column()
    totalPrice!: number;

    @Column()
    status!: string; // e.g., "pending", "completed", "cancelled"

    @Column()
    products!: {
        productId: ObjectId;
        quantity: number;
    }[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
