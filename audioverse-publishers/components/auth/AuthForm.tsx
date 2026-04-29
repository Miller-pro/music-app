"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  signupSchema,
  type LoginInput,
  type SignupInput,
} from "@/lib/validations/auth";
import { signIn, signUp } from "@/app/auth/actions";
import { RECAPTCHA_STUB_TOKEN } from "@/lib/utils/recaptcha";
import { FormInput } from "./FormInput";
import { PasswordStrength } from "./PasswordStrength";
import { GoogleButton } from "./GoogleButton";

type Mode = "signup" | "login";

export function AuthForm({ mode }: { mode: Mode }) {
  return mode === "signup" ? <SignupFormBody /> : <LoginFormBody />;
}

// ---------------------------------------------------------------------------
// Signup
// ---------------------------------------------------------------------------
function SignupFormBody() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "", termsAccepted: false as unknown as true },
  });

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const passwordValue = watch("password") ?? "";

  const onSubmit = (data: SignupInput) => {
    setFormError(null);
    start(async () => {
      // TODO(recaptcha): Execute real grecaptcha.execute() here once
      // NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set. For now we send a stub
      // token that the server treats as "skip" and stores score 0.9.
      const recaptchaToken = RECAPTCHA_STUB_TOKEN;
      const result = await signUp({ ...data, recaptchaToken });
      if (result.ok) {
        router.push(result.next);
        router.refresh();
      } else if (result.field && result.field !== "form") {
        setError(result.field, { message: result.error });
      } else {
        setFormError(result.error);
      }
    });
  };

  const { ref: emailRhfRef, ...emailReg } = register("email");

  return (
    <Shell
      title="Create your publisher account"
      subtitle="Start monetizing your app or site in about 15 minutes."
    >
      <GoogleButton nextPath="/onboarding" label="Sign up with Google" />
      <Divider />
      <form
        onSubmit={handleSubmit(onSubmit)}
        onChange={() => formError && setFormError(null)}
        className="space-y-4"
        noValidate
      >
        <FormInput
          {...emailReg}
          ref={(el) => {
            emailRhfRef(el);
            emailRef.current = el;
          }}
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
        />
        <div>
          <FormInput
            {...register("password")}
            type="password"
            label="Password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            onChange={(e) => {
              register("password").onChange(e);
              clearErrors("password");
            }}
          />
          {passwordValue ? <PasswordStrength password={passwordValue} /> : null}
        </div>

        <label className="flex items-start gap-3 text-sm text-white/70">
          <input
            type="checkbox"
            {...register("termsAccepted")}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-bg-elevated text-primary focus:ring-primary/60"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.termsAccepted?.message ? (
          <p className="-mt-2 text-sm text-status-suspended">{errors.termsAccepted.message}</p>
        ) : null}

        {formError ? (
          <div
            role="alert"
            className="rounded-lg border border-status-suspended/40 bg-status-suspended/10 px-3.5 py-2.5 text-sm text-status-suspended"
          >
            {formError}
          </div>
        ) : null}

        <button type="submit" className="av-btn-primary w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-white/60">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
      <p className="mt-4 text-center text-xs text-white/30">
        Protected by reCAPTCHA (stub in Phase 1)
      </p>
    </Shell>
  );
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
function LoginFormBody() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const onSubmit = (data: LoginInput) => {
    setFormError(null);
    start(async () => {
      const result = await signIn(data);
      if (result.ok) {
        router.push(result.next);
        router.refresh();
      } else if (result.field === "email" || result.field === "password") {
        setError(result.field, { message: result.error });
      } else {
        setFormError(result.error);
      }
    });
  };

  const { ref: emailRhfRef, ...emailReg } = register("email");

  return (
    <Shell title="Welcome back" subtitle="Log in to your publisher dashboard.">
      <GoogleButton nextPath="/dashboard" label="Continue with Google" />
      <Divider />
      <form
        onSubmit={handleSubmit(onSubmit)}
        onChange={() => formError && setFormError(null)}
        className="space-y-4"
        noValidate
      >
        <FormInput
          {...emailReg}
          ref={(el) => {
            emailRhfRef(el);
            emailRef.current = el;
          }}
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
        />
        <FormInput
          {...register("password")}
          type="password"
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-white/70">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="h-4 w-4 rounded border-white/20 bg-bg-elevated text-primary focus:ring-primary/60"
            />
            Remember me
          </label>
          <Link href="/auth/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        {formError ? (
          <div
            role="alert"
            className="rounded-lg border border-status-suspended/40 bg-status-suspended/10 px-3.5 py-2.5 text-sm text-status-suspended"
          >
            {formError}
          </div>
        ) : null}

        <button type="submit" className="av-btn-primary w-full" disabled={pending}>
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-white/60">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </Shell>
  );
}

// ---------------------------------------------------------------------------
// Shared shell
// ---------------------------------------------------------------------------
function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-block">
          <span className="text-lg font-bold tracking-tight text-white">
            Audio<span className="text-primary">Verse</span>
          </span>
        </Link>
      </div>
      <div className="av-card">
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-white/60">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-wider text-white/30">
      <div className="h-px flex-1 bg-white/10" />
      or
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}
