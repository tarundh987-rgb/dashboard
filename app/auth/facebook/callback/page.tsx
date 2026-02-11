"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { facebookLogin, setUser } from "@/redux/features/auth/authSlice";
import { toast } from "sonner";

export default function FacebookCallbackPage() {
  const params = useSearchParams();
  const code = params.get("code");
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (code) {
      dispatch(facebookLogin({ code }))
        .unwrap()
        .then((response) => {
          const userData = response.data || response;

          dispatch(setUser(userData));

          toast.success("Logged in successfully");
          router.push("/");
        })
        .catch((err) => {
          toast.error(err?.message || "Facebook login failed");
        });
    }
  }, [code, dispatch, router]);

  return <p>Signing you in…</p>;
}
