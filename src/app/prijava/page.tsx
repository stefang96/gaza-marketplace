import { AuthCard } from "@/features/auth/AuthCard";

export const metadata = { title: "Prijava · Gaža" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <AuthCard mode="login" />
    </div>
  );
}
