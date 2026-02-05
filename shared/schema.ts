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
  passwordHash: text("password_hash"), // New field for password protection
});

// === SCHEMAS ===
export const insertUrlSchema = createInsertSchema(urls).pick({
  originalUrl: true,
  shortCode: true,
  expiresAt: true,
  passwordHash: true, // Include passwordHash in insert schema
});

// Response schema for resolving a URL
export const resolveUrlResponseSchema = z.object({
  id: z.number(),
  originalUrl: z.string(),
  shortCode: z.string(),
  expiresAt: z.coerce.date().nullable(), // Correctly parse ISO date strings to Date objects
  createdAt: z.coerce.date().nullable(), // Correctly parse ISO date strings to Date objects
  clicks: z.number(),
  isPasswordProtected: z.boolean(), // New field to indicate if the URL is password protected
});


// === EXPLICIT API TYPES ===
export type Url = typeof urls.$inferSelect;
export type InsertUrl = z.infer<typeof insertUrlSchema>;
export type ResolveUrlResponse = z.infer<typeof resolveUrlResponseSchema>; // New type for the resolve response

// Request types
export const createUrlRequestSchema = z.object({
  originalUrl: z.string().url("Please enter a valid URL"),
  customCode: z.string().min(3).max(20).regex(/^[a-zA-Z0-9-_]+$/, "Only letters, numbers, dashes, and underscores").optional(),
  expiration: z.enum(["1m", "1h", "1d", "1w", "2w", "never"]).default("never"),
  password: z.string().min(6, "Password must be at least 6 characters long").optional().or(z.literal("")), // Optional password
  honeypot: z.string().optional(), // Honeypot field for anti-spam
});

export type CreateUrlRequest = z.infer<typeof createUrlRequestSchema>;

export type UrlResponse = Url;
