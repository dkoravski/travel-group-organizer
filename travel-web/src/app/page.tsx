import Link from "next/link";

const features = [
  {
    title: "Travel Groups",
    description:
      "Създавайте групи за приятели, семейство или общност и управлявайте участниците на едно място.",
  },
  {
    title: "Trip Planning",
    description:
      "Планирайте маршрути, дати, срещи, бюджет и програма за всяко пътуване.",
  },
  {
    title: "Shared Packing Lists",
    description:
      "Поддържайте общи списъци за багаж, за да не липсва нищо важно преди тръгване.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Организирани пътувания без хаос
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Планирайте следващото групово приключение спокойно.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-700">
            Планирайте групови пътувания, канете приятели, управлявайте
            маршрути, всички организирани на едно място.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-md bg-emerald-600 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Вход
            </Link>
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-6 text-base font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              Регистрация
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Предстоящо пътуване
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                Seven Rila Lakes
              </h2>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-md bg-slate-50 p-4">
                <dt className="text-slate-500">Участници</dt>
                <dd className="mt-1 text-xl font-semibold text-slate-950">12</dd>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <dt className="text-slate-500">Бюджет</dt>
                <dd className="mt-1 text-xl font-semibold text-slate-950">
                  75 лв.
                </dd>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <dt className="text-slate-500">Маршрут</dt>
                <dd className="mt-1 text-xl font-semibold text-slate-950">4</dd>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <dt className="text-slate-500">Багаж</dt>
                <dd className="mt-1 text-xl font-semibold text-slate-950">9</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="features-heading">
        <h2
          id="features-heading"
          className="text-2xl font-bold tracking-tight text-slate-950"
        >
          Основни възможности
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-950">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
