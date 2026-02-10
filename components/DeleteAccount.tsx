"use client";

import { useDeleteAccountMutation } from "@/redux/features/auth/authApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { clearUser } from "@/redux/features/auth/authSlice";
import { useRouter } from "next/navigation";

export default function DeleteAccount() {
  const [deleteAccountApi, { isLoading }] = useDeleteAccountMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deleteAccountApi().unwrap();
      toast.success("Account deleted successfully.");
      dispatch(clearUser());
      router.push("/");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete account");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "Deleting..." : "Delete Account"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="cursor-pointer"
            variant={"destructive"}
            onClick={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
