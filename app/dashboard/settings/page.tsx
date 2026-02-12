"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Check,
  AlertTriangle,
  Settings,
} from "lucide-react";
import Profile from "@/components/Profile";
import UpdatePassword from "@/components/UpdatePassword";
import DeleteAccount from "@/components/DeleteAccount";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <>
      <span className="text-md font-semibold mb-2">
        Manage your account preferences and configurations.
      </span>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 flex-wrap h-auto p-1">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Profile />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border/50 bg-card opacity-0 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-foreground">
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  title: "Email Notifications",
                  description:
                    "Receive email updates about your account activity",
                  checked: emailNotifications,
                  onChange: setEmailNotifications,
                },
                {
                  title: "Push Notifications",
                  description: "Get push notifications on your devices",
                  checked: pushNotifications,
                  onChange: setPushNotifications,
                },
                {
                  title: "Marketing Emails",
                  description:
                    "Receive emails about new features and promotions",
                  checked: marketingEmails,
                  onChange: setMarketingEmails,
                },
                {
                  title: "Security Alerts",
                  description: "Get notified about security-related activities",
                  checked: securityAlerts,
                  onChange: setSecurityAlerts,
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between py-3 opacity-0 animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Switch
                    checked={item.checked}
                    onCheckedChange={item.onChange}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-border/50 bg-card opacity-0 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-foreground">
                Security Settings
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your account security and authentication methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <UpdatePassword />

              <Separator className="bg-border" />

              {/* Two-Factor Auth */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
              </div>

              <Separator className="bg-border" />

              {/* Active Sessions */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Active Sessions</h3>
                {[
                  {
                    device: "MacBook Pro",
                    location: "San Francisco, CA",
                    current: true,
                  },
                  {
                    device: "iPhone 14 Pro",
                    location: "San Francisco, CA",
                    current: false,
                  },
                  {
                    device: "Windows PC",
                    location: "New York, NY",
                    current: false,
                  },
                ].map((session, index) => (
                  <div
                    key={session.device}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 opacity-0 animate-slide-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">
                          {session.device}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {session.location}
                        </p>
                      </div>
                    </div>
                    {session.current ? (
                      <Badge className="bg-accent/20 text-accent">
                        Current
                      </Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="border-border/50 bg-card opacity-0 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-foreground">Current Plan</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-foreground">
                        Pro Plan
                      </h3>
                      <Badge className="bg-primary/20 text-primary">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      $29/month, billed monthly
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="text-muted-foreground bg-transparent cursor-pointer"
                  >
                    Change Plan
                  </Button>
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Users", value: "10", max: "25" },
                    { label: "Storage", value: "45GB", max: "100GB" },
                    { label: "API Calls", value: "8.2K", max: "50K" },
                    { label: "Projects", value: "12", max: "Unlimited" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-sm text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {item.value}{" "}
                        <span className="text-sm text-muted-foreground font-normal">
                          / {item.max}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Payment Method</h3>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-16 rounded bg-linear-to-r from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm">
                      VISA
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        •••• •••• •••• 4242
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires 12/2026
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground cursor-pointer"
                  >
                    Edit
                  </Button>
                </div>
              </div>

              {/* Billing History */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Billing History</h3>
                {[
                  { date: "Jan 1, 2024", amount: "$29.00", status: "Paid" },
                  { date: "Dec 1, 2023", amount: "$29.00", status: "Paid" },
                  { date: "Nov 1, 2023", amount: "$29.00", status: "Paid" },
                ].map((invoice, index) => (
                  <div
                    key={invoice.date}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors opacity-0 animate-slide-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-accent" />
                      <div>
                        <p className="font-medium text-foreground">
                          {invoice.date}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Pro Plan - Monthly
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {invoice.amount}
                      </p>
                      <Badge
                        variant="secondary"
                        className="bg-accent/20 text-accent"
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card
            className="border-destructive/30 bg-destructive/5 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </div>
              <CardDescription className="text-destructive/80">
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <DeleteAccount />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
