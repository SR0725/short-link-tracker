# Short URL Tracker

A complete short URL service built with Next.js 15, featuring URL shortening, click tracking, and comprehensive analytics.

## Features

- **URL Shortening**: Convert long URLs into short, shareable links
- **Custom Slugs**: Option to create custom short codes
- **Click Tracking**: Track clicks with detailed analytics
- **Analytics Dashboard**: View click trends, referrers, device types, and geographic data
- **CSV Export**: Export analytics data for external analysis
- **Admin Authentication**: Secure admin panel with "Remember Me" functionality
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for performance optimization
- **UI**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts for analytics visualization
- **Authentication**: JWT with secure HTTP-only cookies

## Setup

1. **Clone and Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Database Setup**
   ```bash
   # Start local Prisma Postgres server
   npx prisma dev

   # Apply database migrations
   npx prisma migrate dev --name init

   # Generate Prisma client
   npx prisma generate
   ```

3. **Environment Variables**
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
   
   Required variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `REDIS_URL`: Redis connection string
   - `ADMIN_PASSWORD`: Admin panel password
   - `JWT_SECRET`: JWT signing secret
   - `NEXT_PUBLIC_BASE_URL`: Application base URL

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

5. **Build for Production**
   ```bash
   pnpm build
   pnpm start
   ```

## Usage

1. **Access the Application**
   - Homepage: `http://localhost:3000`
   - Admin Panel: `http://localhost:3000/admin`

2. **Login to Admin Panel**
   - Use the password set in `ADMIN_PASSWORD` environment variable (default: "admin123")
   - Check "Remember me" for extended login duration (1 year)

3. **Create Short URLs**
   - Enter target URL in the admin dashboard
   - Optionally specify custom slug
   - Copy and share the generated short URL

4. **View Analytics**
   - Click "Analytics" button for any short URL
   - View click trends over 7 or 30 days
   - See top referrers, device distribution, and geographic data
   - Export data as CSV for external analysis

5. **Access Short URLs**
   - Visit `http://localhost:3000/{slug}` to redirect to target URL
   - Each visit is automatically tracked with analytics data

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout  
- `GET /api/auth/check` - Check authentication status

### Links Management
- `GET /api/links` - Get all short links (requires auth)
- `POST /api/links` - Create new short link (requires auth)
- `GET /api/links/[id]/analytics` - Get link analytics (requires auth)
- `GET /api/links/[id]/export` - Export analytics as CSV (requires auth)

### URL Redirection
- `GET /[slug]` - Redirect to target URL and track click

## Database Schema

### Links Table
- `id`: Unique identifier
- `slug`: Short code for the URL
- `target_url`: Original long URL
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Clicks Table
- `id`: Unique identifier
- `link_id`: Reference to links table
- `timestamp`: Click timestamp
- `referrer`: HTTP referrer header
- `user_agent`: Browser user agent
- `device`: Device type (desktop/mobile)
- `country`: Country code (if available)

## Security Features

- Password-based admin authentication
- JWT tokens with configurable expiration
- HTTP-only cookies with secure settings
- CSRF protection via SameSite cookies
- Input validation and sanitization
- SQL injection prevention via Prisma ORM

## Performance Optimizations

- Redis caching for frequently accessed data
- Database indexing on commonly queried fields
- Async click tracking to avoid blocking redirects
- Static page generation where possible
- Optimized bundle size with tree shaking

## Deployment

The application can be deployed on any platform supporting Node.js:

- **Vercel**: Zero-config deployment with built-in PostgreSQL and Redis
- **Railway**: Simple deployment with database add-ons
- **Docker**: Use the included Dockerfile for containerized deployment
- **Traditional hosting**: Deploy to VPS with PostgreSQL and Redis instances

## License

MIT License - see LICENSE file for details.
