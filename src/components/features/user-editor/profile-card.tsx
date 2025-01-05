import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TypographyH4 } from "@/components/ui/typography";
import { User } from "@/types/user";
import { useTranslation } from "react-i18next";
import { FaCalendar, FaUserCheck, FaUserMinus, FaUsers, FaUserTimes } from "react-icons/fa";
import { RiVerifiedBadgeFill } from "react-icons/ri";

export default function ProfileCard({ user }: { user: User }) {
  const { t } = useTranslation();

  return (
    <Card className="mt-4">
      <div className="flex flex-col items-start md:flex-row justify-start space-x-4 m-3 md:m-4">
        <Avatar
          className={
            user.profilePictureUrl ? "w-28 h-28 ml-4 mb-2" : "ml-4 mb-2"
          }
        >
          <AvatarImage src={user.profilePictureUrl} />
          <AvatarFallback>
            {user.firstName
              ? user.firstName.charAt(0) + user.lastName.charAt(0)
              : user.name && user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">@{user.username}</h4>
          <TypographyH4 className="text-2xl font-semibold leading-none tracking-tight">
            <div className="flex items-center">
              <span className="mr-2">
                {user.firstName + " " + user.lastName}
              </span>
              {user.isSubscribed && (
                <Badge className="mr-2 capitalize" variant="outline">
                  {user.subscriptionTier}
                </Badge>
              )}
              {user.verified && (
                <RiVerifiedBadgeFill className="h-4 w-4 mr-2" />
              )}
              {user.isBanned && <FaUserTimes className="h-4 w-4 mr-2" />}
              {user.isRestricted && <FaUserMinus className="h-4 w-4 mr-2" />}
            </div>
          </TypographyH4>
          {user.bio && <p className="text-sm">{user.bio}</p>}
          <div className="flex items-center pt-2">
            <FaCalendar className="mr-2 h-4 w-4 opacity-70" />{" "}
            <span className="text-xs text-muted-foreground">
              Joined {new Date(user.createdAt as string).toDateString()}
            </span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <FaUsers className="h-4 w-4 mr-2" />
            {t("message.followers", { count: user.followerCount || 0 })}
            <FaUserCheck className="h-4 w-4 mx-2" />
            {t("message.following", { count: user.followingCount || 0 })}
          </div>
        </div>
      </div>
    </Card>
  );
}
