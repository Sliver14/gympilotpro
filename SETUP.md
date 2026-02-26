# Klimarx Space Management System - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Configure Environment Variables
Create a `.env.local` file with your database configuration:

```bash
DATABASE_URL="mysql://user:password@localhost:3306/klimarx"
NEXTAUTH_SECRET="your-secret-key-generate-one"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Initialize Prisma
```bash
# Generate Prisma Client
npx prisma generate

# Create the database schema (requires a running MySQL instance)
npx prisma migrate dev --name init

# Seed initial membership packages
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
# or
pnpm dev
```

Open http://localhost:3000 in your browser.

## Database Setup

### Using Local MySQL
1. Install MySQL locally
2. Create a database: `CREATE DATABASE klimarx;`
3. Update DATABASE_URL in `.env.local`

### Using Neon (PostgreSQL)
1. Create a Neon project at https://neon.tech
2. Update DATABASE_URL to your Neon connection string
3. Update `prisma/schema.prisma`: change `provider = "mysql"` to `provider = "postgresql"`

### Using PlanetScale
1. Create a PlanetScale database
2. Use the connection string as DATABASE_URL
3. Keep MySQL as the provider in `prisma/schema.prisma`

## Features

- **Member Signup**: 4-step registration process with membership selection
- **Member Dashboard**: Profile, QR code, attendance tracking, progress notes
- **Admin Dashboard**: Real-time analytics, member management, revenue tracking
- **Check-in System**: QR code scanning and manual email search
- **Membership Renewal**: Payment integration ready
- **Role-Based Access**: Admin, Secretary, Trainer, Member roles

## Authentication

The system uses JWT-based authentication with secure HTTP-only cookies:
- Passwords are hashed with bcrypt
- Sessions are stored in the database
- Token expiry: 7 days

## Development

### Project Structure
- `/app` - Next.js pages and API routes
- `/components` - React components (UI and features)
- `/lib` - Utility functions (auth, Prisma client, etc.)
- `/hooks` - Custom React hooks
- `/prisma` - Database schema and migrations

### Available Scripts
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run prisma:generate # Generate Prisma Client
npm run prisma:migrate  # Run database migrations
npm run prisma:seed   # Seed initial data
```

## Deployment

### Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel Settings
4. Deploy

### Self-hosted
1. Build the project: `npm run build`
2. Set environment variables
3. Start with: `npm run start`

## Troubleshooting

### "FATAL ERROR during initialization"
- Ensure `.env.local` is set with valid DATABASE_URL
- Run `npx prisma generate`
- Check that your database is running and accessible

### Database Connection Error
- Verify DATABASE_URL is correct
- Check database credentials
- Ensure the database exists
- For MySQL: `mysql -u user -p -h localhost`

### Prisma Migration Issues
- Reset database: `npx prisma migrate reset`
- Delete `.prisma` folder in node_modules and run `npx prisma generate`

## License
MIT
