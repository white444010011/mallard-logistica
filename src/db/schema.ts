import { pgTable, text, timestamp, uuid, integer, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["SUPER_ADMIN", "ADMIN", "USER", "CD"]);
export const orderStatusEnum = pgEnum("status", ["pending", "assumed", "in_transit", "delivered", "canceled"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").default("USER").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  availableStock: integer("available_stock").default(0).notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  assignedCdId: uuid("assigned_cd_id").references(() => users.id), // Which CD member assumed it
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
