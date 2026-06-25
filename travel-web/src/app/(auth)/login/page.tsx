import Link from "next/link";

import { LoginForm } from "@/components/LoginForm";

type LoginPageProps = {
  searchParams?: Promise<{
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = params?.redirectTo ?? "/dashboard";

  return (
    <section className="mx-auto flex min-h-[calc(100vh-145px)] w-full max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Вход в профила
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Влезте, за да управлявате групите и пътуванията си.
          </p>
        </div>

        <LoginForm redirectTo={redirectTo} />

        <p className="mt-6 text-center text-sm text-slate-600">
          Нямате профил?{" "}
          <Link
            href="/register"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Регистрирайте се
          </Link>
        </p>
      </div>
    </section>
  );
}
