# SmartShortenerHanz

## Overview

This is a retro/sci-fi themed URL shortener application called "Warp Link." Users can paste long URLs and receive shortened links with optional custom codes and expiration times. The application features a galactic starship aesthetic with glitch effects, neon colors, and space-themed animations.

The frontend is a React SPA with a futuristic HUD-style interface, while the backend is an Express.js API that stores URL mappings in PostgreSQL using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom retro/sci-fi theme (galactic starship palette)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Animations**: Framer Motion for glitch effects and transitions
- **Build Tool**: Vite with path aliases (@/ for client/src, @shared/ for shared)

### Backend Architecture
- **Framework**: Express.js 5 with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Pattern**: REST endpoints defined in shared/routes.ts with Zod validation
- **Code Generation**: nanoid for short URL codes (6 characters)
- **Development**: tsx for TypeScript execution, Vite dev server with HMR

### Data Model
Single `urls` table with fields:
- `id`: Auto-incrementing primary key
- `originalUrl`: The full URL to redirect to
- `shortCode`: Unique 6-character code (or custom code)
- `expiresAt`: Optional timestamp for link expiration
- `createdAt`: Timestamp of creation
- `clicks`: Click counter
- `passwordHash`: Hashed password for protected URLs (newly added)

### API Endpoints
- `POST /api/shorten` - Create shortened URL with optional custom code, expiration, and password
- `GET /api/resolve/:code` - Resolve short code to original URL (returns 404/410 for expired/missing)

### Key Design Decisions
- **Shared Types**: Schema and API contracts defined in `shared/` folder, used by both frontend and backend
- **Zod Validation**: Request/response validation using Zod schemas with drizzle-zod integration
- **Expiration Options**: 1 minute, 1 hour, 1 day, 1 week, 2 weeks, or never
- **Custom Codes**: Users can specify custom short codes (3-20 alphanumeric characters)

## External Dependencies

### Database
- **PostgreSQL**: Primary data store (requires DATABASE_URL environment variable)
- **Drizzle Kit**: Database migrations with `npm run db:push`

### Third-Party Libraries
- **nanoid**: Generates unique short codes
- **date-fns**: Date manipulation for expiration calculations
- **react-confetti**: Celebration effects on successful URL shortening
- **framer-motion**: Animation library for retro UI effects
- **bcrypt**: For password hashing
- **express-rate-limit**: For API rate limiting

### Fonts (Google Fonts)
- Orbitron (display font)
- Press Start 2P (retro/pixel font)
- Space Mono (monospace)

## Database Schema

Here is the full SQL `CREATE TABLE` statement for the `urls` table, based on the `shared/schema.ts` definition:

```sql
CREATE TABLE urls (
    id SERIAL PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    clicks INTEGER DEFAULT 0,
    password_hash TEXT
);
```

## Troubleshooting Data Insertion / URL Resolution

If you are encountering issues where data is not being inserted into the database or URLs are not resolving correctly, please consider the following:

1.  **Database Schema Synchronization:**
    *   **Crucial Step:** Ensure you have run `npm run db:push` in your terminal *after* any changes to `shared/schema.ts` (especially after adding the `password_hash` column). This command updates your PostgreSQL database schema to match your Drizzle ORM definition. If the `password_hash` column does not exist in your actual database table, insertions involving this column will likely fail.

2.  **Server Console Logs:**
    *   When you attempt to create a shortened URL or access a short URL (e.g., `http://localhost:3000/VBX-ri`), please check your server's console output for any error messages. The backend now includes `console.error` statements in `server/routes.ts` for both URL shortening and resolution. These logs will provide specific details if a database operation fails or if a URL is not found by the query.

    Example errors to look for:
    *   `Error shortening URL: ...`
    *   `Error resolving URL: ...`
    *   Any PostgreSQL errors related to missing columns, constraint violations, etc.

3.  **Case Sensitivity:**
    *   PostgreSQL's `TEXT` columns are typically case-sensitive. Ensure that the `short_code` you are trying to access (e.g., `VBX-ri`) exactly matches the case of the `short_code` stored in your database.

Please perform these checks and let me know the output from your server console when you try to access the URL. This will help pinpoint the exact cause of the "SYSTEM CRITICAL - COORDINATES LOST" error.