import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { nanoid } from "nanoid";
import { addMinutes, addHours, addDays, addWeeks } from "date-fns";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Create Short URL
  app.post(api.urls.create.path, async (req, res) => {
    try {
      const input = api.urls.create.input.parse(req.body);
      
      let shortCode = input.customCode;
      
      // If no custom code, generate one
      if (!shortCode) {
        // Simple retry logic for collision
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 5) {
          const candidate = nanoid(6); // 6 chars is usually enough
          const existing = await storage.getUrlByCode(candidate);
          if (!existing) {
            shortCode = candidate;
            isUnique = true;
          }
          attempts++;
        }
        
        if (!shortCode) {
          return res.status(500).json({ message: "Failed to generate unique code. Please try again." });
        }
      } else {
        // Check custom code uniqueness
        const existing = await storage.getUrlByCode(shortCode);
        if (existing) {
          return res.status(409).json({ message: "Custom code already in use" });
        }
      }

      // Calculate expiration
      let expiresAt: Date | null = null;
      const now = new Date();
      switch (input.expiration) {
        case "1m": expiresAt = addMinutes(now, 1); break;
        case "1h": expiresAt = addHours(now, 1); break;
        case "1d": expiresAt = addDays(now, 1); break;
        case "1w": expiresAt = addWeeks(now, 1); break;
        case "2w": expiresAt = addWeeks(now, 2); break;
        case "never": expiresAt = null; break;
      }

      const url = await storage.createUrl({
        originalUrl: input.originalUrl,
        shortCode: shortCode,
        expiresAt: expiresAt,
      });

      res.status(201).json(url);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Resolve URL (for interstitial)
  app.get(api.urls.resolve.path, async (req, res) => {
    const code = req.params.code as string;
    const url = await storage.getUrlByCode(code);

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    // Check expiration
    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      return res.status(410).json({ message: "URL has expired" });
    }

    // Increment clicks (fire and forget)
    storage.incrementClicks(url.id).catch(console.error);

    res.json(url);
  });

  // Serve static files is handled by Vite in dev/prod setup automatically
  // But we need to make sure the frontend routes (/:code) are served.
  // The generic fallback in server/index.ts usually handles serving index.html for unknown routes,
  // which lets client-side routing take over.

  return httpServer;
}
