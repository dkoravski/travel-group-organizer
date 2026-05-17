import type { CurrentUser } from "@/lib/auth";

type DashboardWelcomeCardProps = {
  user: CurrentUser;
};

export function DashboardWelcomeCard({ user }: DashboardWelcomeCardProps) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section
      aria-labelledby="welcome-heading"
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-800">
          {initials}
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Добре дошли отново
          </p>
          <h2
            id="welcome-heading"
            className="mt-1 text-2xl font-bold tracking-tight text-slate-950"
          >
            {user.name}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{user.email}</p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-700">
            Тук виждате най-важното за вашите групи, предстоящите пътувания и
            бързите действия за организиране на следващото приключение.
          </p>
        </div>
      </div>
    </section>
  );
}
