import { signToken } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { ApiError } from "@/utils/api-error";
import { apiSuccess } from "@/utils/api-response";
import { withApiHandler } from "@/utils/withApiHandler";
import { NextRequest } from "next/server";

export const POST = withApiHandler(async (req: NextRequest) => {
  await dbConnect();

  const { code } = await req.json();

  if (!code) {
    throw new ApiError(400, "Missing facebook code.");
  }

  const tokenRes = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
      new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
        client_secret: process.env.FACEBOOK_APP_SECRET!,
        redirect_uri: process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI!,
        code,
      }),
  );

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    throw new ApiError(401, "Facebook authentication failed.");
  }

  const profileRes = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${tokenData.access_token}`,
  );

  const fbUser = await profileRes.json();

  if (!fbUser.email) {
    throw new ApiError(401, "Facebook email not found");
  }

  let user = await User.findOne({ email: fbUser.email });

  if (user && user.provider === "credentials") {
    throw new ApiError(409, "This email is registered with email & password.");
  }

  if (!user) {
    const [firstName, ...rest] = fbUser.name.split(" ");

    user = await User.create({
      email: fbUser.email,
      firstName,
      lastName: rest.join(" "),
      image: fbUser.picture?.data?.url,
      provider: "facebook",
      facebookId: fbUser.id,
    });
  }

  const token = signToken({ id: user._id });

  const response = apiSuccess(
    200,
    {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      provider: user.provider,
      image: user.image,
      token,
    },
    "Login successful",
  );

  response.cookies.set("auth_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
});
