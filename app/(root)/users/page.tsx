"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  MoreHorizontal,
  UserPlus,
  Filter,
  Download,
  Mail,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

function getAccessInfo(expiresAt: string) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const daysLeft = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  const label = `${daysLeft} days`;

  let style = {};

  if (daysLeft > 15) {
    style = {
      backgroundColor: "rgba(34, 197, 94, 0.2)",
      color: "rgb(22, 163, 74)",
      borderColor: "rgba(34, 197, 94, 0.3)",
    };
  } else if (daysLeft >= 10) {
    style = {
      backgroundColor: "rgba(249, 115, 22, 0.2)",
      color: "rgb(234, 88, 12)",
      borderColor: "rgba(249, 115, 22, 0.3)",
    };
  } else {
    style = {
      backgroundColor: "rgba(239, 68, 68, 0.2)",
      color: "rgb(220, 38, 38)",
      borderColor: "rgba(239, 68, 68, 0.3)",
    };
  }

  return { label, style };
}

const statusColors: Record<string, string> = {
  Active: "bg-accent/20 text-accent border-accent/30",
  Inactive: "bg-muted text-muted-foreground border-muted",
  Pending: "bg-chart-3/20 text-chart-3 border-chart-3/30",
};

const planColors: Record<string, string> = {
  Free: "bg-muted text-muted-foreground",
  Pro: "bg-primary/20 text-primary",
  Enterprise: "bg-chart-4/20 text-chart-4",
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    plan: "Free",
    accessExpiresAt: "",
  });

  async function loadUsers() {
    setLoading(true);
    const res = await fetch("/api/platform-users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [users, searchQuery]);

  async function createUser() {
    await fetch("/api/platform-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setOpen(false);
    setForm({ name: "", email: "", plan: "Free", accessExpiresAt: "" });
    loadUsers();
  }

  return (
    <>
      <span className="text-md font-semibold mb-2">
        Manage your platform users and access
      </span>

      <Card className="border-border/50 bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Platform users with access expiration
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={() => setOpen(true)}
                className="cursor-pointer"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-0"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Access Left</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredUsers.map((user) => {
                  return (
                    <TableRow key={user._id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {user.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-medium",
                            statusColors[user.status],
                          )}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={planColors[user.plan]}
                        >
                          {user.plan}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {(() => {
                          const accessInfo = getAccessInfo(
                            user.accessExpiresAt,
                          );
                          return (
                            <Badge
                              className="font-medium border"
                              style={accessInfo.style}
                            >
                              {accessInfo.label}
                            </Badge>
                          );
                        })()}
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {!loading && filteredUsers.length === 0 && (
              <p className="text-sm text-muted-foreground p-4 text-center">
                No users found
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Platform User</DialogTitle>
            <DialogDescription>
              Create a new user and define how long they can access the
              platform.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* Expiration */}
            <div className="space-y-2">
              <Label htmlFor="expires">Access expiration</Label>
              <Input
                id="expires"
                type="date"
                value={form.accessExpiresAt}
                onChange={(e) =>
                  setForm({ ...form, accessExpiresAt: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                User access will automatically expire on this date.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
