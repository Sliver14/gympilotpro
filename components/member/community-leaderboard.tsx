'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, Flame, User, Medal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaderboardMember {
  id: string
  rank: number
  name: string
  profileImage: string | null
  visits: number
  isCurrentUser: boolean
}

interface CommunityLeaderboardProps {
  leaderboard: LeaderboardMember[]
  currentUserStats: LeaderboardMember & { streak?: number } | null
}

export default function CommunityLeaderboard({ leaderboard, currentUserStats }: CommunityLeaderboardProps) {
  // Helpers for ranking styling
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', icon: Trophy }
      case 2: return { color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/50', icon: Medal }
      case 3: return { color: 'text-amber-700', bg: 'bg-amber-700/10', border: 'border-amber-700/50', icon: Medal }
      default: return { color: 'text-muted-foreground', bg: 'bg-accent', border: 'border-border', icon: null }
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentUserStats && (
          <Card className="bg-gradient-to-br from-card to-accent/20 border-border/50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" /> Your Gym Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-foreground">#{currentUserStats.rank}</span>
                <span className="text-sm font-bold text-muted-foreground mb-1">in the gym</span>
              </div>
              <p className="text-xs font-bold text-muted-foreground mt-2">
                Based on {currentUserStats.visits} visits this month
              </p>
            </CardContent>
          </Card>
        )}

        {currentUserStats && currentUserStats.streak !== undefined && (
          <Card className="bg-gradient-to-br from-card to-orange-500/5 border-border/50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" /> Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-foreground">{currentUserStats.streak}</span>
                <span className="text-sm font-bold text-muted-foreground mb-1">days</span>
              </div>
              <p className="text-xs font-bold text-muted-foreground mt-2">
                {currentUserStats.streak > 0 ? "Keep the momentum going!" : "Start a new streak today!"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="border-border/50 shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border">
          <CardTitle className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-primary" /> Monthly Leaderboard
          </CardTitle>
          <CardDescription>
            The most active members this month. Names are hidden for privacy.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground font-bold text-sm">
                No activity yet this month. Be the first to check in!
              </div>
            ) : (
              leaderboard.map((member) => {
                const style = getRankStyle(member.rank)
                const RankIcon = style.icon

                return (
                  <div 
                    key={member.id} 
                    className={cn(
                      "flex items-center gap-4 p-4 transition-colors hover:bg-muted/50",
                      member.isCurrentUser && "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full font-black text-sm shrink-0 border",
                      style.bg, style.color, style.border
                    )}>
                      {member.rank}
                    </div>

                    <Avatar className="h-10 w-10 border border-border shadow-sm">
                      <AvatarImage src={member.profileImage || undefined} className="object-cover" />
                      <AvatarFallback className="bg-background">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "font-black text-sm truncate",
                          member.isCurrentUser ? "text-primary" : "text-foreground"
                        )}>
                          {member.isCurrentUser ? "You" : member.name}
                        </p>
                        {RankIcon && <RankIcon className={cn("h-3.5 w-3.5", style.color)} />}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <Badge variant="secondary" className="font-bold text-xs bg-background border border-border">
                        {member.visits} <span className="text-muted-foreground ml-1 font-medium">visits</span>
                      </Badge>
                    </div>
                  </div>
                )
              })
            )}

            {/* Show current user at bottom if they aren't in the top 10 */}
            {currentUserStats && currentUserStats.rank > 10 && (
              <div className="flex items-center gap-4 p-4 bg-primary/5 border-t-2 border-primary/20 mt-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full font-black text-sm shrink-0 bg-accent text-muted-foreground border border-border">
                  {currentUserStats.rank}
                </div>

                <Avatar className="h-10 w-10 border border-border shadow-sm">
                  <AvatarImage src={currentUserStats.profileImage || undefined} className="object-cover" />
                  <AvatarFallback className="bg-background">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm truncate text-primary">
                    You
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <Badge variant="secondary" className="font-bold text-xs bg-background border border-border">
                    {currentUserStats.visits} <span className="text-muted-foreground ml-1 font-medium">visits</span>
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
