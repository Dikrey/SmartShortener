import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const urls = pgTable("urls", {
  id: serial("id").primaryKey(),
  originalUrl: text("original_url").notNull(),
  shortCode: text("short_code").notNull().unique(),
  expiresAt: timestamp("expires_at"), // Null means never expires
  createdAt: timestamp("created_at").defaultNow(),
  clicks: integer("clicks").default(0),
});

// === SCHEMAS ===
export const insertUrlSchema = createInsertSchema(urls).pick({
  originalUrl: true,
  shortCode: true,
  expiresAt: true,
});

// === EXPLICIT API TYPES ===
export type Url = typeof urls.$inferSelect;
export type InsertUrl = z.infer<typeof insertUrlSchema>;

// Request types
export const createUrlRequestSchema = z.object({
  originalUrl: z.string().url("Please enter a valid URL"),
  customCode: z.string().min(3).max(20).regex(/^[a-zA-Z0-9-_]+$/, "Only letters, numbers, dashes, and underscores").optional(),
  expiration: z.enum(["1m", "1h", "1d", "1w", "2w", "never"]).default("never"),
});

export type CreateUrlRequest = z.infer<typeof createUrlRequestSchema>;

export type UrlResponse = Url;
