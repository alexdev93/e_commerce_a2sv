import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity("products")
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id!: string; // UUID instead of ObjectId

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column("decimal") // Use decimal for price in PostgreSQL
    price!: number;

    @Column("int")
    stock!: number;

    @Column()
    category!: string;

    @ManyToOne(() => User, (user) => user.products)
    user!: User;

    @Column({ nullable: true })
    image!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
