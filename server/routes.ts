import type { Express } from "express";
import { createServer, type Server } from "http";
import { rateLimit } from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
});

// Stricter rate limit for AI processing endpoint (expensive external API calls)
const processLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // max 10 document submissions per minute
  message: { message: "Too many processing requests. Please wait before submitting again." },
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  app.get(api.categories.list.path, async (req, res) => {
    const cats = await storage.getCategories();
    res.json(cats);
  });

  app.post(api.categories.create.path, async (req, res) => {
    try {
      const input = api.categories.create.input.parse(req.body);
      const cat = await storage.createCategory(input);
      res.status(201).json(cat);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.documents.list.path, async (req, res) => {
    const docs = await storage.getDocuments();
    // Return objects as the response schema expects
    res.json(docs);
  });

  app.get(api.documents.get.path, async (req, res) => {
    const doc = await storage.getDocument(Number(req.params.id));
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.json(doc);
  });

  app.post(api.documents.process.path, processLimiter, async (req, res) => {
    try {
      const { title, text } = api.documents.process.input.parse(req.body);
      
      // Initially create the document as pending
      let document = await storage.createDocument({
        title,
        content: text,
        status: "processing",
        extractedData: null,
      });
      
      res.status(201).json(document);
      
      // Process asynchronously
      (async () => {
        try {
          const prompt = `You are a document extraction assistant. Extract names, dates, and financial amounts from the following text. Also suggest a short Category name (e.g. "Invoice", "Contract", "Receipt", "Report") that best describes the document.
          Respond strictly with a JSON object in this format:
          {
            "names": ["name1", "name2"],
            "dates": ["date1"],
            "amounts": [100.50],
            "suggestedCategory": "Category Name"
          }

Document Text:
${text}`;

          const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });

          const resultText = result.text ?? "";
          const extracted = JSON.parse(resultText);

          // Find or create category
          let categoryId = null;
          if (extracted.suggestedCategory) {
            let cat = await storage.getCategoryByName(extracted.suggestedCategory);
            if (!cat) {
              cat = await storage.createCategory({ name: extracted.suggestedCategory, description: "Auto-generated category" });
            }
            categoryId = cat.id;
          }

          await storage.updateDocument(document.id, {
            status: "completed",
            categoryId,
            extractedData: {
              names: extracted.names || [],
              dates: extracted.dates || [],
              amounts: extracted.amounts || []
            }
          });

        } catch (error) {
          console.error("OCR Extraction failed:", error);
          await storage.updateDocument(document.id, { status: "failed" });
        }
      })();
      
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed data function
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingCategories = await storage.getCategories();
  if (existingCategories.length === 0) {
    const invCat = await storage.createCategory({ name: "Invoice", description: "Invoices and bills" });
    const conCat = await storage.createCategory({ name: "Contract", description: "Legal agreements" });

    await storage.createDocument({
      title: "Monthly Hosting Invoice",
      content: "Invoice #1024\\nDate: 2023-10-01\\nAmount Due: $150.00\\nBilled to: Acme Corp",
      categoryId: invCat.id,
      status: "completed",
      extractedData: {
        names: ["Acme Corp"],
        dates: ["2023-10-01"],
        amounts: [150.00]
      }
    });

    await storage.createDocument({
      title: "Employment Agreement - John Doe",
      content: "Contract starting 2023-11-01.\\nEmployee: John Doe\\nBase Salary: $80000",
      categoryId: conCat.id,
      status: "completed",
      extractedData: {
        names: ["John Doe"],
        dates: ["2023-11-01"],
        amounts: [80000]
      }
    });
  }
}
