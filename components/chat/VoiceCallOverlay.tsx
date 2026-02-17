"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  endCall,
  acceptCall,
  toggleMute,
} from "@/redux/features/chat/callSlice";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useSocket } from "@/components/SocketProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, X } from "lucide-react";
import { Card } from "@/components/ui/card";

export function VoiceCallOverlay() {
  const dispatch = useAppDispatch();
  const { socket } = useSocket();
  const { status, partner, isMuted, errorMessage } = useAppSelector(
    (state) => state.call,
  );
  const currentUser = useAppSelector((state) => state.auth.user);
  const { remoteAudioRef, cleanup } = useWebRTC();

  console.log("[VoiceCallOverlay] Rendering. Status:", status);

  if (status === "idle") return null;

  console.log(
    "[VoiceCallOverlay] Showing UI for status:",
    status,
    "Partner:",
    partner,
  );

  const handleEndCall = () => {
    if (socket && partner?.id) {
      socket.emit("call:end", { to: partner.id });
    }
    cleanup();
    dispatch(endCall());
  };

  const handleAcceptCall = () => {
    if (socket && partner?.id) {
      socket.emit("call:accept", {
        callerId: partner.id,
        receiverInfo: {
          name: currentUser?.firstName || currentUser?.email || "User",
          image: currentUser?.image,
        },
      });
      dispatch(acceptCall());
    }
  };

  const handleRejectCall = () => {
    if (socket && partner?.id) {
      socket.emit("call:reject", { callerId: partner.id });
    }
    dispatch(endCall());
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <audio ref={remoteAudioRef} autoPlay />

      <Card className="w-full max-w-sm p-8 flex flex-col items-center gap-6 shadow-2xl bg-card/95 border-primary/20">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-primary/10">
            <AvatarImage src={partner?.image} alt={partner?.name} />
            <AvatarFallback className="text-2xl bg-primary/5 text-primary">
              {partner?.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {status === "calling" && (
            <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-20" />
          )}
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold tracking-tight">{partner?.name}</h3>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
            {status === "calling"
              ? "Calling..."
              : status === "receiving"
                ? "Incoming Call"
                : status === "ongoing"
                  ? "On Call"
                  : errorMessage || "Ended"}
          </p>
        </div>

        <div className="flex items-center gap-4 mt-4">
          {status === "receiving" ? (
            <>
              <Button
                onClick={handleAcceptCall}
                size="lg"
                className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20"
              >
                <Phone className="h-6 w-6" />
              </Button>
              <Button
                onClick={handleRejectCall}
                variant="destructive"
                size="lg"
                className="rounded-full h-14 w-14 shadow-lg shadow-destructive/20"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => dispatch(toggleMute())}
                variant="outline"
                size="icon"
                className={`rounded-full h-12 w-12 ${isMuted ? "bg-destructive/10 text-destructive border-destructive/20" : ""}`}
              >
                {isMuted ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>

              <Button
                onClick={handleEndCall}
                variant="destructive"
                size="lg"
                className="rounded-full h-14 w-14 shadow-lg shadow-destructive/20"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {errorMessage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(endCall())}
            className="mt-4 text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </Button>
        )}
      </Card>
    </div>
  );
}
