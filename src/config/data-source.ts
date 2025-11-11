import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/user.entity";
import { Product } from "../entities/product.entity";
import { Order } from "../entities/order.entity";

export const AppDataSource = new DataSource({
  type: "mongodb",
  host: "localhost",
  port: 27017,
  username: "user",
  password: "pass",
  database: "a2sv_eccomerce",
  authSource: "admin",
  synchronize: true,
  entities: [User, Product, Order],

});
