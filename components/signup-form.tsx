"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import DobPicker from "./DobPicker";
import { useState } from "react";
import { calculateAge } from "@/utils/ageCalculator";
import { Textarea } from "./ui/textarea";
import { useRegisterMutation } from "@/redux/features/auth/authApi";
import { registerSchema } from "@/verification/auth.verification";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { SerializedError } from "@reduxjs/toolkit";
import GoogleLoginBtn from "./GoogleLoginBtn";
import GitHubLoginBtn from "./GitHubLoginBtn";

type SignupFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  dob?: Date;
};

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "status" in error;
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [registerApi, { isLoading }] = useRegisterMutation();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();

  const [formData, setFormData] = useState<SignupFormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    dob: undefined,
  });

  const age = formData.dob ? calculateAge(formData.dob) : "";

  const zodPayload = {
    email: formData.email,
    password: formData.password,
    confirmPassword: formData.confirmPassword,
    firstName: formData.firstName,
    lastName: formData.lastName,
    address: formData.address,
    dateOfBirth: formData.dob ? formData.dob.toISOString().split("T")[0] : "",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse(zodPayload);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }
    const validatedData = result.data;

    try {
      await registerApi(validatedData).unwrap();
      toast.success("User registered successfully.");
      router.push("/sign-in");
    } catch (err: unknown) {
      let message = "Registration failed.";

      if (isFetchBaseQueryError(err)) {
        message = (err.data as any)?.message || "Registration failed.";
      } else if (typeof err === "object" && err && "message" in err) {
        message = (err as SerializedError).message ?? message;
      }

      toast.error(message);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDobChange = (date?: Date) => {
    setFormData((prev) => ({
      ...prev,
      dob: date,
    }));
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <Link href={"/"} className="text-2xl font-bold">
                  Redux Auth
                </Link>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email below to create your account
                </p>
              </div>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                    <Input
                      id="first-name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      type="text"
                      required
                      placeholder="Alex"
                    />
                    <FieldDescription>
                      {errors.firstName && (
                        <p className="text-destructive text-xs mt-1">
                          {errors.firstName[0]}
                        </p>
                      )}
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                    <Input
                      id="last-name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      type="text"
                      required
                      placeholder="Morgan"
                    />
                    <FieldDescription>
                      {errors.lastName && (
                        <p className="text-destructive text-xs mt-1">
                          {errors.lastName[0]}
                        </p>
                      )}
                    </FieldDescription>
                  </Field>
                </Field>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="m@example.com"
                  required
                />
                <FieldDescription>
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.email[0]}
                    </p>
                  )}
                </FieldDescription>
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="********"
                    />
                    <FieldDescription>
                      {errors.password && (
                        <p className="text-destructive text-xs mt-1">
                          {errors.password[0]}
                        </p>
                      )}
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="********"
                    />
                    <FieldDescription>
                      {errors.confirmPassword && (
                        <p className="text-destructive text-xs mt-1">
                          {errors.confirmPassword[0]}
                        </p>
                      )}
                    </FieldDescription>
                  </Field>
                </Field>
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <DobPicker value={formData.dob} onChange={handleDobChange} />
                  {errors.dateOfBirth && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.dateOfBirth[0]}
                    </p>
                  )}
                  <Field>
                    <FieldLabel htmlFor="age">Age</FieldLabel>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      readOnly
                      disabled
                      placeholder="Age"
                    />
                  </Field>
                </Field>
              </Field>
              <Field>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Enter your address"
                />
                <FieldDescription>
                  {errors.address && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.address[0]}
                    </p>
                  )}
                </FieldDescription>
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  {isLoading ? "Creating..." : "Create Account"}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <div className="flex flex-col gap-3">
                <GoogleLoginBtn />
                <GitHubLoginBtn />
              </div>
              <FieldDescription className="text-center">
                Already have an account?{" "}
                <Link href="/auth/sign-in">Sign in</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/auth.png"
              alt="Image"
              height={900}
              width={900}
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <Link href="#">Terms of Service</Link> and{" "}
        <Link href="#">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  );
}
