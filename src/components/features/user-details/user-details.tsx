import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLocation } from "wouter";

const UserDetails = function () {
  const [, setLocation] = useLocation();

  const onOpenChange = (state: boolean) => {
    console.log(state);
    setLocation("/users");
  };
  return (
    <>
      <Sheet defaultOpen={true} onOpenChange={onOpenChange}>
        <SheetContent className="w-full ">
          <SheetHeader>
            <SheetTitle>Edit user</SheetTitle>
            <SheetDescription>
              Make changes to the profile here. Click save when you're done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                defaultValue="@peduarte"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                First Name
              </Label>
              <Input
                id="firstName"
                defaultValue="Pedro"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Last Name
              </Label>
              <Input
                id="lastName"
                defaultValue="Duarte"
                className="col-span-3"
              />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Save changes</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default UserDetails;
