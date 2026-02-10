"use client";

import { SocialButton } from "./SocialButton";
import { Facebook } from "lucide-react";

export default function FacebookLoginBtn() {
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!;

  const loginWithFacebook = () => {
    const redirectUri = "http://localhost:3000/auth/facebook/callback";

    const url =
      "https://www.facebook.com/v18.0/dialog/oauth?" +
      new URLSearchParams({
        client_id: appId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "email,public_profile",
      });

    window.location.href = url;
  };

  return (
    <SocialButton
      onClick={loginWithFacebook}
      icon={<Facebook className="h-5 w-5" />}
    >
      Continue with Facebook
    </SocialButton>
  );
}
