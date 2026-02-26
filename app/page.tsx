'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dumbbell, Users, TrendingUp, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Klimarx Space</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Join Now</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b border-border bg-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-5xl font-bold md:text-6xl">
            Welcome to <span className="text-primary">Klimarx Space</span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Transform your fitness journey with state-of-the-art equipment, expert trainers, and a supportive community.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b border-border py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Choose Klimarx?</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <Dumbbell className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">Modern Equipment</h3>
              <p className="text-sm text-muted-foreground">
                Top-of-the-line fitness equipment and facilities to support your goals.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <Users className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">Expert Trainers</h3>
              <p className="text-sm text-muted-foreground">
                Certified professionals ready to guide you through your fitness journey.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <TrendingUp className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">Progress Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your fitness progress with detailed analytics and notes.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <CheckCircle className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">Community</h3>
              <p className="text-sm text-muted-foreground">
                Join a supportive community of fitness enthusiasts and achieve your goals together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Plans Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Membership Plans</h2>
          <p className="mb-12 text-center text-muted-foreground">
            Choose the perfect plan to fit your fitness goals and lifestyle.
          </p>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 text-xl font-bold">Bi-Weekly Pass</h3>
              <p className="mb-4 text-3xl font-bold text-primary">#10,000</p>
              <p className="mb-6 text-sm text-muted-foreground">14 days of unlimited access</p>
              <ul className="mb-6 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Unlimited gym access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>All equipment access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Locker access</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full cursor-pointer">Join Now</Button>
              </Link>
            </div>

                        <div className="rounded-lg border border-primary bg-card p-6 ring-2 ring-primary">
              <div className="mb-2 inline-block rounded bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                POPULAR
              </div>
              <h3 className="mb-2 text-xl font-bold">Monthly Pass</h3>
              <p className="mb-4 text-3xl font-bold text-primary">#20,000</p>
              <p className="mb-6 text-sm text-muted-foreground">1 month of unlimited access</p>
              <ul className="mb-6 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Unlimited gym access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>All equipment access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Locker access</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full cursor-pointer">Join Now</Button>
              </Link>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 text-xl font-bold">Quarterly Pass</h3>
              <p className="mb-4 text-3xl font-bold text-primary">#55,000</p>
              <p className="mb-6 text-sm text-muted-foreground">3 months of unlimited access</p>
              <ul className="mb-6 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Unlimited gym access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>All equipment access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Locker access</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full cursor-pointer">Join Now</Button>
              </Link>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 text-xl font-bold">Semi-Annual Pass</h3>
              <p className="mb-4 text-3xl font-bold text-primary">#110,000</p>
              <p className="mb-6 text-sm text-muted-foreground">6 Months of unlimited access</p>
              <ul className="mb-6 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Unlimited gym access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>All equipment access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Locker access</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full cursor-pointer">Join Now</Button>
              </Link>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 text-xl font-bold">Annual Pass</h3>
              <p className="mb-4 text-3xl font-bold text-primary">#220,000</p>
              <p className="mb-6 text-sm text-muted-foreground">1 year of unlimited access</p>
              <ul className="mb-6 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Unlimited gym access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>All equipment access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Locker access</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full cursor-pointer">Join Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-primary/5 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">Ready to Transform Your Fitness?</h2>
          <p className="mb-6 text-muted-foreground">
            Join Klimarx Space today and start your journey to a healthier, stronger you.
          </p>
          <Link href="/signup">
            <Button size="lg">Sign Up Now</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Klimarx Space. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
