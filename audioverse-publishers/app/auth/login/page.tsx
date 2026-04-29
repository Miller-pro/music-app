import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Log in — AudioVerse Publishers",
  description: "Log in to your AudioVerse publisher dashboard.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <AuthForm mode="login" />
    </main>
  );
}
