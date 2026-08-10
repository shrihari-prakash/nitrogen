import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { User } from "@/types/user";
import { useTranslation } from "react-i18next";
import { Calendar, UserCheck, Users, UserX, UserMinus, BadgeCheck, Coins } from "lucide-react";

export default function ProfileCard({ user }: { user: User }) {
  const { t } = useTranslation();

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || user.name || user.username;
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.username.charAt(0).toUpperCase();

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    : null;

  return (
    <Card className="mt-4 overflow-hidden border border-border/60 bg-card shadow-sm rounded-2xl">
      {/* Subtle neutral banner */}
      <div className="h-16 w-full bg-muted/40 border-b border-border/30" />

      <div className="px-5 pb-5 pt-0 -mt-8 flex flex-col md:flex-row items-start gap-4">
        {/* Profile Avatar */}
        <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-background bg-card shadow-md shrink-0 relative z-10">
          {user.profilePictureUrl && (
            <AvatarImage src={user.profilePictureUrl} alt={fullName} className="object-cover bg-card" />
          )}
          <AvatarFallback className="bg-muted text-muted-foreground text-xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* User Information Details */}
        <div className="flex-1 space-y-2.5 min-w-0 pt-2 md:pt-8 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-foreground truncate">
                  {fullName}
                </h3>
                {user.verified && (
                  <span title="Verified Account">
                    <BadgeCheck className="h-5 w-5 text-primary shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-muted-foreground font-mono">
                @{user.username}
              </p>
            </div>

            {/* Badges container */}
            <div className="flex flex-wrap items-center gap-1.5">
              {user.isSubscribed && user.subscriptionTier && (
                <Badge variant="secondary" className="capitalize font-medium px-2.5 py-0.5 text-xs">
                  {user.subscriptionTier}
                </Badge>
              )}
              {user.isBanned && (
                <Badge variant="destructive" className="flex items-center gap-1 px-2.5 py-0.5 text-xs">
                  <UserX className="h-3 w-3" /> Banned
                </Badge>
              )}
              {user.isRestricted && (
                <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground border-border px-2.5 py-0.5 text-xs">
                  <UserMinus className="h-3 w-3" /> Restricted
                </Badge>
              )}
            </div>
          </div>

          {/* Bio text */}
          {user.bio && (
            <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-2.5 rounded-xl border border-border/30 italic">
              "{user.bio}"
            </p>
          )}

          {/* User metadata row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border/30">
            {joinDate && (
              <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 opacity-60" />
                <span>Joined {joinDate}</span>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap font-medium">
              <div className="flex items-center gap-1 bg-muted/40 px-2.5 py-1 rounded-lg border border-border/50">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-semibold text-foreground">{(user.followerCount || 0).toLocaleString()}</span>
                <span className="text-muted-foreground font-normal">{t("label.followers")}</span>
              </div>
              <div className="flex items-center gap-1 bg-muted/40 px-2.5 py-1 rounded-lg border border-border/50">
                <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-semibold text-foreground">{(user.followingCount || 0).toLocaleString()}</span>
                <span className="text-muted-foreground font-normal">{t("label.following")}</span>
              </div>
              <div className="flex items-center gap-1 bg-pink-500/10 text-pink-600 dark:text-pink-400 px-2.5 py-1 rounded-lg border border-pink-500/20 font-mono">
                <Coins className="h-3.5 w-3.5 text-pink-500" />
                <span className="font-bold text-foreground">{(user.credits || 0).toLocaleString()}</span>
                <span className="font-normal opacity-80">{t("label.credits")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
