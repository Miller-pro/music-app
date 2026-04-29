import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign up — AudioVerse Publishers",
  description: "Create your AudioVerse publisher account and start earning in 15 minutes.",
};

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <AuthForm mode="signup" />
    </main>
  );
}
