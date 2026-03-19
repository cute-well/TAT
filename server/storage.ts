import { db } from "./db";
import { categories, documents, type Category, type InsertCategory, type Document, type DocumentWithCategory } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getCategories(): Promise<Category[]>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  getDocuments(): Promise<DocumentWithCategory[]>;
  getDocument(id: number): Promise<DocumentWithCategory | undefined>;
  createDocument(doc: Omit<typeof documents.$inferInsert, "id" | "createdAt">): Promise<Document>;
  updateDocument(id: number, updates: Partial<typeof documents.$inferInsert>): Promise<Document>;
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.name, name));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async getDocuments(): Promise<DocumentWithCategory[]> {
    const rows = await db
      .select({
        document: documents,
        category: categories,
      })
      .from(documents)
      .leftJoin(categories, eq(documents.categoryId, categories.id))
      .orderBy(desc(documents.createdAt));

    return rows.map((row) => ({
      ...row.document,
      category: row.category,
    }));
  }

  async getDocument(id: number): Promise<DocumentWithCategory | undefined> {
    const rows = await db
      .select({
        document: documents,
        category: categories,
      })
      .from(documents)
      .leftJoin(categories, eq(documents.categoryId, categories.id))
      .where(eq(documents.id, id));

    if (rows.length === 0) return undefined;
    return {
      ...rows[0].document,
      category: rows[0].category,
    };
  }

  async createDocument(doc: Omit<typeof documents.$inferInsert, "id" | "createdAt">): Promise<Document> {
    const [document] = await db.insert(documents).values(doc).returning();
    return document;
  }

  async updateDocument(id: number, updates: Partial<typeof documents.$inferInsert>): Promise<Document> {
    const [document] = await db.update(documents).set(updates).where(eq(documents.id, id)).returning();
    return document;
  }
}

export const storage = new DatabaseStorage();
