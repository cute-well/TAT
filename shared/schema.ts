import { pgTable, text, serial, timestamp, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  categoryId: integer("category_id").references(() => categories.id),
  status: text("status").default("pending"), 
  extractedData: json("extracted_data"), // e.g., { names: string[], dates: string[], amounts: number[] }
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Document = typeof documents.$inferSelect;

export type DocumentWithCategory = Document & { category?: Category | null };
