"use client";

import * as React from "react";
import InviteNotificationBadge from "@/components/chat/InviteNotificationBadge";
import PendingInvitesDialog from "@/components/chat/PendingInvitesDialog";
import { useSocket } from "@/components/SocketProvider";
import axios from "axios";

export default function InviteNotifications() {
  const [invitesDialogOpen, setInvitesDialogOpen] = React.useState(false);
  const [inviteCount, setInviteCount] = React.useState(0);
  const { socket } = useSocket();

  React.useEffect(() => {
    fetchPendingCount();

    if (socket) {
      socket.on("invite:received", () => {
        setInviteCount((prev) => prev + 1);
      });
    }

    return () => {
      if (socket) {
        socket.off("invite:received");
      }
    };
  }, [socket]);

  const fetchPendingCount = async () => {
    try {
      const res = await axios.get(
        "/api/invitations?type=received&status=pending",
      );
      setInviteCount(res.data.data.length);
    } catch (error) {
      console.error("Error fetching pending invitations:", error);
    }
  };

  const handleInviteAccepted = () => {
    fetchPendingCount();
  };

  return (
    <>
      <InviteNotificationBadge
        count={inviteCount}
        onClick={() => setInvitesDialogOpen(true)}
      />
      <PendingInvitesDialog
        open={invitesDialogOpen}
        onOpenChange={setInvitesDialogOpen}
        onInviteAccepted={handleInviteAccepted}
      />
    </>
  );
}
