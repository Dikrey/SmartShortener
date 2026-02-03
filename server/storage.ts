import { urls, type Url, type InsertUrl } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  createUrl(url: InsertUrl): Promise<Url>;
  getUrlByCode(code: string): Promise<Url | undefined>;
  incrementClicks(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createUrl(insertUrl: InsertUrl): Promise<Url> {
    const [url] = await db.insert(urls).values(insertUrl).returning();
    return url;
  }

  async getUrlByCode(code: string): Promise<Url | undefined> {
    const [url] = await db.select().from(urls).where(eq(urls.shortCode, code));
    return url;
  }

  async incrementClicks(id: number): Promise<void> {
    await db
      .update(urls)
      .set({ clicks: sql`${urls.clicks} + 1` })
      .where(eq(urls.id, id));
  }
}

export const storage = new DatabaseStorage();
