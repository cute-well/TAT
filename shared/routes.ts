import { z } from "zod";
import { insertCategorySchema, type Category, type Document, type DocumentWithCategory } from "./schema";

export const errorSchemas = {
  validation: z.object({ message: z.string() }),
  notFound: z.object({ message: z.string() }),
};

export const processDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  text: z.string().min(1, "Document text is required"),
});

export const api = {
  categories: {
    list: {
      method: "GET" as const,
      path: "/api/categories" as const,
      responses: {
        200: z.array(z.custom<Category>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/categories" as const,
      input: insertCategorySchema,
      responses: {
        201: z.custom<Category>(),
      },
    },
  },
  documents: {
    list: {
      method: "GET" as const,
      path: "/api/documents" as const,
      responses: {
        200: z.array(z.custom<DocumentWithCategory>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/documents/:id" as const,
      responses: {
        200: z.custom<DocumentWithCategory>(),
        404: errorSchemas.notFound,
      },
    },
    process: {
      method: "POST" as const,
      path: "/api/documents/process" as const,
      input: processDocumentSchema,
      responses: {
        201: z.custom<Document>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
