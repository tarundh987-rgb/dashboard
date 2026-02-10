"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { githubLogin } from "@/redux/features/auth/authSlice";
import { toast } from "sonner";

export default function GitHubCallback() {
  const params = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const code = params.get("code");

    if (!code) {
      toast.error("GitHub login failed");
      return;
    }

    dispatch(githubLogin({ code }))
      .unwrap()
      .then(() => {
        toast.success("Logged in successfully");
        router.push("/");
      })
      .catch((err) => {
        toast.error(err?.message || "GitHub login failed");
      });
  }, []);

  return <p>Signing you in…</p>;
}
