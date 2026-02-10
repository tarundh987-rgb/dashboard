"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { facebookLogin } from "@/redux/features/auth/authSlice";

export default function FacebookCallbackPage() {
  const params = useSearchParams();
  const code = params.get("code");
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (code) {
      dispatch(facebookLogin({ code })).then(() => {
        router.push("/");
      });
    }
  }, [code]);

  return null;
}
