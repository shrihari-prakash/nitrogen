import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
        <Avatar>
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
              {user.firstName + " " + user.lastName}
              {user.verified && <Verified className="h-4 w-4 mx-2" />}
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
