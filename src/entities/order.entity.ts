import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Product } from "./product.entity";

@Entity("orders")
export class Order {
    @PrimaryGeneratedColumn("uuid")
    id!: string; // UUID instead of ObjectId

    @ManyToOne(() => User, (user) => user.orders)
    user!: User;

    @Column({ nullable: true })
    description?: string;

    @Column("decimal")
    totalPrice!: number;

    @Column()
    status!: string; // e.g., "pending", "completed", "cancelled"

    @ManyToMany(() => Product)
    @JoinTable({
        name: "order_products", // join table name
        joinColumn: { name: "orderId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "productId", referencedColumnName: "id" },
    })
    products!: Product[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
