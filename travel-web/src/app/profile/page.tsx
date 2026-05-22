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
    <div className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      <header className="mb-4">
        <h1 className="text-2xl font-black tracking-tight text-slate-950">
          Моят профил
        </h1>
      </header>

      <main className="grid min-w-0 gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm shadow-slate-900/5">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-black text-emerald-800">
              {getInitials(currentUser.name)}
            </div>
            <div className="min-w-0">
              <h2 className="break-words text-lg font-black text-slate-950">
                {currentUser.name}
              </h2>
              <p className="mt-1 break-all text-sm text-slate-600">
                {currentUser.email}
              </p>
            </div>
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="min-w-0 rounded-xl bg-slate-50 p-3">
              <dt className="text-slate-500">Име</dt>
              <dd className="mt-1 break-words font-bold text-slate-950">
                {currentUser.name}
              </dd>
            </div>
            <div className="min-w-0 rounded-xl bg-slate-50 p-3">
              <dt className="text-slate-500">Имейл</dt>
              <dd className="mt-1 break-all font-bold text-slate-950">
                {currentUser.email}
              </dd>
            </div>
          </dl>
        </section>

        <section className="grid min-w-0 gap-5 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm shadow-slate-900/5 xl:grid-cols-2">
          <div className="min-w-0">
            <h2 className="text-lg font-black tracking-tight text-slate-950">
              Редакция на името
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Можете да актуализирате показваното име, което се използва в
              навигацията и в профилните секции.
            </p>
            <UpdateProfileForm currentName={currentUser.name} />
          </div>

          <div className="min-w-0 border-t border-slate-200 pt-5 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-950">
                Смяна на парола
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-600">
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
