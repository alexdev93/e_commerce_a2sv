import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Product } from "./product.entity";
import { Order } from "./order.entity";
import { Exclude } from "class-transformer";

export type UserRole = "USER" | "ADMIN";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Exclude()
  @Column()
  password!: string;

  @Column({
    type: "enum",
    enum: ["USER", "ADMIN"],
    default: "USER",
  })
  role!: UserRole;

  @OneToMany(() => Product, (product) => product.user)
  products!: Product[]; // ← Add this line

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[]; // optional, if you have orders

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
