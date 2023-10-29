import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetClose, SheetFooter } from "@/components/ui/sheet";
import { TypographyH4 } from "@/components/ui/typography";
import { User } from "@/types/user";
import { Copy, Save, XCircle } from "lucide-react";

export default function BasicInfoEditor({ user }: { user: User }) {
  return (
    <div className="grid gap-4 py-4">
      <TypographyH4>Basic Info</TypographyH4>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="_id" className="text-right">
          User ID
        </Label>
        <div className="flex col-span-3">
          <Input id="_id" defaultValue={user._id} disabled className="flex-1" />
          <Button className="ml-2" variant="ghost">
            <Copy className="w-4 h-4 " />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Username
        </Label>
        <Input
          id="username"
          defaultValue={user.username}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="firstName" className="text-right">
          First Name
        </Label>
        <Input
          id="firstName"
          defaultValue={user.firstName}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          htmlFor="middleName"
          defaultValue={user.middleName}
          className="text-right"
        >
          Middle Name
        </Label>
        <Input id="middleName" defaultValue="" className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="lastName" className="text-right">
          Last Name
        </Label>
        <Input
          id="lastName"
          defaultValue={user.lastName}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="email" className="text-right">
          Email
        </Label>
        <Input id="email" defaultValue={user.email} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="password" className="text-right">
          Password
        </Label>
        <Input id="password" type="password" className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="organization" className="text-right">
          Organization
        </Label>
        <Input
          id="organization"
          defaultValue={user.organization}
          className="col-span-3"
        />
      </div>
      <SheetFooter className="flex-col">
        <Button type="submit" className="mb-3">
          <Save className="h-4 w-4 mr-2" /> Save changes
        </Button>
        <SheetClose asChild>
          <Button type="submit" variant="outline">
            <XCircle className="h-4 w-4 mr-2" /> Close
          </Button>
        </SheetClose>
      </SheetFooter>
    </div>
  );
}
