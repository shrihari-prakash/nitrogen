import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TypographyH4 } from "@/components/ui/typography";
import { User } from "@/types/user";
import { UserCheck, UserMinus, UserX, Users, Verified } from "lucide-react";

export default function ProfileCard({ user }: { user: User }) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <Avatar className={user.profilePictureUrl ? "w-28 h-28" : ""}>
          <AvatarImage src={user.profilePictureUrl} />
          <AvatarFallback>
            {user.firstName
              ? user.firstName.charAt(0) + user.lastName.charAt(0)
              : user.name && user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <CardTitle>
          <TypographyH4>
            <div className="flex items-center">
              <span className="mr-2">
                {user.firstName + " " + user.lastName}
              </span>
              {user.isSubscribed && (
                <Badge className="mr-2 capitalize" variant="outline">
                  {user.subscriptionTier}
                </Badge>
              )}
              {user.verified && <Verified className="h-4 w-4 mr-2" />}
              {user.isBanned && <UserX className="h-4 w-4 mr-2" />}
              {user.isRestricted && <UserMinus className="h-4 w-4 mr-2" />}
            </div>
          </TypographyH4>
          <CardDescription>{user.username}</CardDescription>
        </CardTitle>
        <CardDescription>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            {user.followerCount || 0} followers
            <UserCheck className="h-4 w-4 mx-2" />
            {user.followingCount || 0} following
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
