import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "За приложението | Travel Group Organizer",
  description:
    "Информация за Travel Group Organizer и възможностите за планиране на групови пътувания.",
};

const highlights = [
  {
    title: "Групи за пътуване",
    description:
      "Създавайте туристически групи за приятели, семейство или малка общност и управлявайте членовете на едно място.",
  },
  {
    title: "Организация на пътувания",
    description:
      "Планирайте дати, дестинация, бюджет, място на среща и капацитет за всяко групово пътуване.",
  },
  {
    title: "Комуникация и предпочитания",
    description:
      "Членовете могат да се присъединяват, да оставят коментари и да споделят лични предпочитания за транспорт и настаняване.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          За приложението
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Travel Group Organizer помага на групите да планират пътувания без хаос.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700">
          Приложението е създадено за организиране на екскурзии, уикенд
          пътувания и общи приключения между приятели, семейства или малки
          общности. Целта е всички важни детайли да бъдат събрани на едно
          място: групи, членове, пътувания, участници, коментари и лични
          предпочитания.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-slate-200 bg-slate-50 p-5"
            >
              <h2 className="text-lg font-semibold text-slate-950">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold tracking-tight text-slate-950">
            За кого е подходящо
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <li>Приятелски групи, които пътуват често заедно.</li>
            <li>Семейства, които планират общи почивки и уикенди.</li>
            <li>Малки общности, клубове и неформални туристически групи.</li>
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold tracking-tight text-slate-950">
            Роли в приложението
          </h2>
          <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <RoleItem
              role="Член"
              description="Участва в групи, присъединява се към пътувания и добавя коментари."
            />
            <RoleItem
              role="Мениджър"
              description="Създава и управлява пътувания, членове и коментари в групата."
            />
          </dl>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/register"
          className="inline-flex h-11 items-center justify-center rounded-md bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Създай профил
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
        >
          Към началото
        </Link>
      </div>
    </div>
  );
}

function RoleItem({
  role,
  description,
}: {
  role: string;
  description: string;
}) {
  return (
    <div className="rounded-md bg-slate-50 p-4">
      <dt className="font-semibold text-slate-950">{role}</dt>
      <dd className="mt-2 leading-6">{description}</dd>
    </div>
  );
}
