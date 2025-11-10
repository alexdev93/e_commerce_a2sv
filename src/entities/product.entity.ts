import {
    Entity,
    ObjectIdColumn,
    ObjectId,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity("products")
export class Product {
    @ObjectIdColumn()
    id!: ObjectId;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column("double")
    price!: number;

    @Column("int")
    stock!: number;

    @Column()
    category!: string;

    @Column()
    userId!: ObjectId; 
}
