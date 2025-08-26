# Short Link Tracker

A comprehensive URL shortening service built with Next.js 15, featuring URL shortening, click tracking, and comprehensive data analytics.

## Features

- **URL Shortening**: Convert long URLs into short, shareable links
- **Custom Short Codes**: Option to create custom short codes
- **Advanced Link Management**: Add titles, tags, expiration dates, and click limits
- **Table Sorting**: Sort links by various criteria (date, clicks, tags, etc.)
- **Click Tracking**: Detailed click data tracking and analytics
- **Analytics Dashboard**: View click trends, sources, device types, and geographical data (country detection is optional)
- **QR Code Generation**: Generate customizable QR codes with logo upload support
- **CSV Export**: Export analytics data for external analysis
- **Custom 404 Pages**: Customize 404 page content and branding
- **Admin Authentication**: Secure admin panel with "Remember Me" functionality
- **Settings Management**: Centralized personalization configuration
- **Modern Interface**: Built with shadcn/ui components and Tailwind CSS (Traditional Chinese)

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for performance optimization
- **UI**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts for data visualization
- **QR Codes**: qr-code-styling with high customization support
- **Authentication**: JWT with secure HTTP-only cookies
- **File Upload**: Custom image processing for logos
- **Geolocation**: MaxMind GeoLite2 for accurate country detection

## Quick Start

### 🚀 One-Click Deploy (Recommended)

[![Deploy on Zeabur](https://zeabur.com/button.svg)](https://goto.ray-realms.com/short-link-zeabur)

Click the button above to deploy using Zeabur template with automatic PostgreSQL and Redis setup!

---

### 🏗️ Self-Deploy

#### 📋 Prerequisites
- Node.js 18+ 
- pnpm package manager
- PostgreSQL database
- Redis cache service

#### 🔧 Deployment Steps

1. **Download and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd short-link-tracker
   pnpm install
   ```

2. **Configure Environment Variables**
   
   Copy environment template:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and set the following variables:

   | Environment Variable | Description | Example Value |
   |---------------------|-------------|---------------|
   | `DATABASE_URL` | **Required** PostgreSQL connection string | `postgresql://user:pass@localhost:5432/shortlink` |
   | `REDIS_URL` | **Required** Redis connection string | `redis://localhost:6379` |
   | `ADMIN_PASSWORD` | **Required** Admin password | `your_secure_password` |
   | `JWT_SECRET` | **Required** JWT signing key (recommended 32+ characters) | `your-super-secret-jwt-key-here` |
   | `MAXMIND_LICENSE_KEY` | **Optional** MaxMind geolocation license key for identifying visitor countries by IP | `your_maxmind_key` |

   > 💡 **MaxMind Note**: This service uses MaxMind's free GeoLite2 database to convert visitor IP addresses to country information, allowing you to see geographical distribution in analytics reports. MaxMind is completely free - if you don't need visitor country data, you can leave this blank.

3. **Build the Application**
   ```bash
   pnpm build
   ```

4. **Start Production Server**
   ```bash
   pnpm start
   ```
   
   🎉 **Deployment Complete!** Your short link service is now live

#### 🌍 Geolocation Setup (Optional)

> 💡 **Note**: This feature is completely optional and doesn't affect normal application operation

To display visitor country information in analytics:

1. **Get MaxMind Free License Key**
   - Go to https://www.maxmind.com/en/geolite2/signup and register for a free account
   - Generate a license key in the dashboard
   - Add the key to your `.env` file: `MAXMIND_LICENSE_KEY=your_license_key`

2. **Update Geolocation Database**
   ```bash
   # Use convenience script to update
   pnpm update-geoip
   ```

**When geolocation is not configured**:
- ✅ Application works normally
- 📍 Country field shows "Unknown"
- 💬 Setup instructions displayed in console on first query

---

### 🛠️ Development Environment Setup

For local development, follow these steps:

```bash
# Start Prisma development environment (automatically sets up PostgreSQL)
npx prisma dev

# Apply database migrations
npx prisma migrate dev --name init

# Start development server
pnpm dev
```

Development environment will run at http://localhost:3000

## Usage

### 🔗 Application Entry Points
- **Homepage**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000/admin`

### 👤 Admin Panel Login
- Use the `ADMIN_PASSWORD` set in your `.env` file (default: "admin123")
- Check "Remember Me" to extend login duration (1 year)

### ✨ Creating Short URLs
1. Enter target URL in admin dashboard
2. Optional settings:
   - 🏷️ Custom short code
   - 📝 Title and tags
   - ⏰ Expiration date
   - 🔢 Click limit
3. Generate customizable QR codes
4. Copy and share the generated short URL

### 📊 Link Management
- **Sorting**: Sort by title, tags, clicks, creation date, last click, or expiration
- **Quick Toggle**: Click table headers to toggle ascending/descending order
- **Status Indicators**: View complete link information and status indicators

### 📈 Analytics Data
- Click the "Analytics" button for any short URL
- View 7-day or 30-day click trends
- Check popular sources, device distribution, and geographical data
- Country data (requires GeoIP setup, otherwise shows "Unknown")
- Export CSV for external analysis

### ⚙️ Custom Settings
- Upload logos for QR codes and 404 pages
- Set default QR code style preferences
- Personalize 404 page content and appearance

### 🎯 Short URL Usage
- Visit `http://localhost:3000/{short-code}` to redirect to target URL
- Each visit automatically tracks and records analytics data

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/check` - Check authentication status

### Link Management
- `GET /api/links` - Get all short links with sorting support (requires auth)
- `POST /api/links` - Create new short link with advanced options (requires auth)
- `GET /api/links/[id]/analytics` - Get link analytics data (requires auth)
- `GET /api/links/[id]/export` - Export analytics data as CSV (requires auth)

### Settings Management
- `GET /api/settings` - Get admin settings (requires auth)
- `PUT /api/settings` - Update settings (requires auth)
- `GET /api/settings/public` - Get public settings for 404 pages

### URL Redirection
- `GET /[slug]` - Redirect to target URL and track clicks

## Database Schema

### Links Table
- `id`: Unique identifier
- `slug`: URL short code
- `target_url`: Original long URL
- `title`: Optional description title
- `tag`: Group/category tag
- `expires_at`: Optional expiration date
- `click_limit`: Optional maximum click limit
- `last_click_at`: Last click timestamp
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Clicks Table
- `id`: Unique identifier
- `link_id`: Links table reference
- `timestamp`: Click timestamp
- `referrer`: HTTP referrer header
- `user_agent`: Browser user agent
- `device`: Device type (desktop/mobile/tablet, etc.)
- `country`: ISO 3166-1 country code (if GeoIP is configured)

### Settings Table
- `id`: Unique identifier
- `logo_url`: Uploaded logo image URL
- `default_qr_style`: Default QR code style (square/rounded/dots)
- `custom_404_title`: Custom 404 page title
- `custom_404_description`: Custom 404 page description
- `custom_404_button_text`: Custom 404 page button text
- `custom_404_button_url`: Custom 404 page button URL
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Security Features

- 🔐 Password-based admin authentication
- 🎫 Configurable expiration JWT tokens
- 🍪 HTTP-only secure cookie settings
- 🛡️ SameSite Cookie CSRF protection
- ✅ Input validation and sanitization
- 💉 Prisma ORM SQL injection protection

## Performance Optimizations

- ⚡ Redis caching for frequently accessed data
- 🔍 Database indexes on commonly queried fields
- 🔄 Asynchronous click tracking to avoid redirect blocking
- 📄 Static page generation where possible
- 📦 Tree shaking for optimized bundle size

## Deployment Options

This application can be deployed on any platform that supports Node.js:

- **Vercel**: Zero-configuration deployment with built-in PostgreSQL and Redis
- **Railway**: Easy deployment with database add-ons
- **Docker**: Containerized deployment using included Dockerfile
- **Traditional Hosting**: Deploy to VPS with PostgreSQL and Redis instances

## Support & Issues

If you encounter any issues or have suggestions, feel free to join our Discord community for discussion:

[![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/fH8BxMWaYb)

## License

MIT License - see LICENSE file for details.