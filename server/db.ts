import { drizzle } from "drizzle-orm/node-postgres";
import dotenv from 'dotenv';
import pg from "pg";
import * as schema from "@shared/schema";

dotenv.config();

const { Pool } = pg;


if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(client => {
    console.log('Database connected successfully');
    client.release(); 
  })
  .catch(error => {
    console.error('Database connection error:', error);
  });


export const db = drizzle(pool, { schema });
