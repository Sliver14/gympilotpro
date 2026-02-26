#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🏋️ Klimarx Space Management System - Initialization\n');

const envPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local...\n');
  
  const exampleEnv = `# Database Configuration
DATABASE_URL="mysql://user:password@localhost:3306/klimarx"

# Authentication Configuration
NEXTAUTH_SECRET="$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
NEXTAUTH_URL="http://localhost:3000"

# Payment Configuration (for future integration)
# PAYSTACK_SECRET_KEY="sk_..."
# PAYSTACK_PUBLIC_KEY="pk_..."
`;
  
  fs.writeFileSync(envPath, exampleEnv);
  console.log('✅ Created .env.local with sample configuration');
  console.log('⚠️  Please update DATABASE_URL with your actual database connection string\n');
} else {
  console.log('✅ .env.local already exists\n');
}

console.log('📦 Next steps:');
console.log('1. Update .env.local with your database credentials');
console.log('2. Run: npx prisma generate');
console.log('3. Run: npx prisma migrate dev --name init');
console.log('4. Run: npm run dev\n');

console.log('📚 For more details, see SETUP.md\n');
