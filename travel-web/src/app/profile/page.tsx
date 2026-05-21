import { redirect } from "next/navigation";

import { UpdateProfileForm } from "@/components/UpdateProfileForm";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { getCurrentUser } from "@/lib/auth";

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/profile");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
          Потребителски профил
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
          Моят профил
        </h1>
      </header>

      <main className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-xl font-black text-emerald-800">
              {getInitials(currentUser.name)}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950">
                {currentUser.name}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {currentUser.email}
              </p>
            </div>
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-slate-500">Име</dt>
              <dd className="mt-1 font-bold text-slate-950">
                {currentUser.name}
              </dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-slate-500">Имейл</dt>
              <dd className="mt-1 font-bold text-slate-950">
                {currentUser.email}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              Редакция на профил
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Можете да актуализирате показваното име, което се използва в
              навигацията и в профилните секции.
            </p>
          </div>

          <UpdateProfileForm currentName={currentUser.name} />

          <div className="mt-10 border-t border-slate-200 pt-10">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                Смяна на парола
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Въведете текущата си парола и изберете нова. След успешна смяна
                можете да продължите да използвате профила си нормално.
              </p>
            </div>

            <ChangePasswordForm />
          </div>
        </section>
      </main>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
