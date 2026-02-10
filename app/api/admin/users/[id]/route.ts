import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { ApiError } from "@/utils/api-error";
import { apiSuccess } from "@/utils/api-response";
import { withApiHandler } from "@/utils/withApiHandler";
import { NextRequest } from "next/server";

export const DELETE = withApiHandler<{ id: string }>(
  async (req: NextRequest, { params }) => {
    await dbConnect();

    const userId = req.headers.get("x-user-id");

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await User.findById(userId);

    if (!user || user.role !== "ADMIN") {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = await params;

    const deleteUser = await User.findById({
      _id: id,
    });

    if (!deleteUser) {
      throw new ApiError(404, "User not found or already deleted.");
    }

    await User.deleteOne({
      _id: deleteUser._id,
    });

    return apiSuccess(200, null, "User deleted successfully.");
  },
);
