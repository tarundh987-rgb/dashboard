import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { googleLogin } from "@/redux/features/auth/authSlice";
import Image from "next/image";

export default function GoogleLoginBtn() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return (
    <GoogleLogin
      onSuccess={async (res) => {
        if (!res.credential) {
          toast.error("Google login failed");
          return;
        }

        try {
          await dispatch(googleLogin({ token: res.credential })).unwrap();

          toast.success("Logged in successfully");
          router.push("/");
        } catch {
          toast.error("Google login failed");
        }
      }}
      onError={() => toast.error("Google login failed")}
    />
  );
}
