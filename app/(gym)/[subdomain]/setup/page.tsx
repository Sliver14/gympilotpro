'use client'

import Image from 'next/image'

export default function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-lg border border-border">
        <div className="mb-6 flex flex-col items-center">
          <Image 
            src="/WhatsApp_Image_2026-02-25_at_9.54.33_AM-removebg-preview.png" 
            alt="Klimarx Space Logo" 
            width={80} 
            height={80} 
            className="object-contain"
          />
          <h1 className="text-2xl font-bold mt-2">Klimarx Space Setup</h1>
        </div>
        
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>Welcome! It looks like your system needs configuration.</p>
          
          <div className="bg-muted/50 p-4 rounded border border-border">
            <h2 className="font-semibold text-foreground mb-2">Setup Required:</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Create a <code className="bg-background px-2 py-1 rounded">.env.local</code> file in the project root</li>
              <li>Add your database connection string:
                <pre className="bg-background p-2 mt-1 rounded text-xs overflow-auto">
                  {`DATABASE_URL="postgresql://postgres.wjkczrtmvqxracygnjhg:Txkyt#E8D#L6kcY@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
                  NEXTAUTH_SECRET="your-secret-key"
                  NEXTAUTH_URL="http://localhost:3000"`}
                </pre>
              </li>
              <li>Run <code className="bg-background px-2 py-1 rounded">npx prisma generate</code></li>
              <li>Run <code className="bg-background px-2 py-1 rounded">npx prisma migrate dev --name init</code></li>
              <li>Restart the development server</li>
            </ol>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-blue-900 dark:text-blue-100">
              💡 Need help? See <a href="/SETUP.md" className="underline font-semibold">SETUP.md</a> for detailed instructions.
            </p>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="font-semibold text-foreground mb-2">Features included:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Member signup & management</li>
              <li>QR code check-in system</li>
              <li>Admin dashboard & analytics</li>
              <li>Attendance tracking</li>
              <li>Membership renewal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
