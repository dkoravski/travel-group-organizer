import Link from "next/link";

import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-145px)] w-full max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Създаване на профил
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Регистрирайте се, за да започнете да планирате групови пътувания.
          </p>
        </div>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-slate-600">
          Вече имате профил?{" "}
          <Link
            href="/login"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Влезте
          </Link>
        </p>
      </div>
    </section>
  );
}
