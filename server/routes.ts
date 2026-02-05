import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, ResolveUrlResponse } from "@shared/routes";
import { z } from "zod";
import { nanoid } from "nanoid";
import { addMinutes, addHours, addDays, addWeeks } from "date-fns";
import bcrypt from "bcrypt";
import { rateLimit } from 'express-rate-limit'; // Import rateLimit

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Rate limiter for URL creation
  const shortenLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 requests per `windowMs`
    message: "Too many URL creation requests from this IP, please try again after a minute.",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
  
  // Create Short URL
  app.post(api.urls.create.path, shortenLimiter, async (req, res) => { // Apply limiter here
    try {
      const input = api.urls.create.input.parse(req.body);

      // Honeypot check: If this field is filled, it's likely a bot
      if (input.honeypot) {
        console.warn("Honeypot field filled, likely a bot submission.");
        return res.status(400).json({ message: "Bad Request: Honeypot triggered." });
      }
      
      let shortCode = input.customCode;
      let passwordHash: string | undefined;

      if (input.password && input.password.length > 0) {
        passwordHash = await bcrypt.hash(input.password, 10);
      }
      
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
        passwordHash: passwordHash, // Store the hashed password
      });

      res.status(201).json(url);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Error shortening URL:", err); // Log the error for debugging
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Resolve URL (for interstitial)
  app.get(api.urls.resolve.path, async (req, res) => {
    const code = req.params.code as string;
    
    try {
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

      // Construct the response to include isPasswordProtected
      const response: ResolveUrlResponse = {
        id: url.id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt,
        clicks: url.clicks,
        isPasswordProtected: !!url.passwordHash, // True if passwordHash exists
      };

      res.json(response);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Error resolving URL:", err); // Log the error for debugging
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Verify Password for protected URLs
  app.post(api.urls.verifyPassword.path, async (req, res) => {
    const code = req.params.code as string;
    
    try {
      const input = api.urls.verifyPassword.input.parse(req.body);
      const url = await storage.getUrlByCode(code);

      if (!url) {
        return res.status(404).json({ message: "URL not found" });
      }

      if (!url.passwordHash) {
        return res.status(400).json({ message: "URL is not password protected" });
      }

      const isMatch = await bcrypt.compare(input.password, url.passwordHash);

      if (isMatch) {
        return res.status(200).json({ message: "Password verified successfully" });
      } else {
        return res.status(401).json({ message: "Incorrect password" });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Error verifying password:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Serve static files is handled by Vite in dev/prod setup automatically
  // But we need to make sure the frontend routes (/:code) are served.
  // The generic fallback in server/index.ts usually handles serving index.html for unknown routes,
  // which lets client-side routing take over.

  return httpServer;
}
