"use client";

import { useEffect, useState } from "react";
import { useMeQuery } from "@/redux/features/auth/authApi";
import { useAppDispatch } from "@/redux/hooks";
import { setUser, clearUser } from "@/redux/features/auth/authSlice";

export default function AuthInitializer() {
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isSuccess, isError } = useMeQuery(undefined, {
    skip: !mounted,
  });

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setUser(data.data));
    }
    if (isError) {
      dispatch(clearUser());
    }
  }, [isSuccess, isError, data, dispatch]);

  return null;
}
