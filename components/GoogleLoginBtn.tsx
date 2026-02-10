import { googleLogin } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function GoogleLoginBtn() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleGoogleLogin = async (res: CredentialResponse) => {
    if (!res.credential) {
      toast.error("Google login failed.");
      return;
    }

    try {
      await dispatch(googleLogin({ token: res.credential })).unwrap();
      toast.success("Logged in successfully.");
      router.push("/");
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? (err as { message: string }).message
          : "Login failed.";

      toast.error(message);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleLogin}
      onError={() => toast.error("Google login failed.")}
    />
  );
}
