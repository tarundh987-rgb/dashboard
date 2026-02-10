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
              <Field className="grid grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  type="button"
                  className="cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Sign up with Apple</span>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Sign up with Google</span>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Sign up with Meta</span>
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Already have an account? <Link href="/sign-in">Sign in</Link>
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
