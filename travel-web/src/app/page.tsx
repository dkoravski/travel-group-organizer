const features = [
  {
    title: "Туристически групи",
    description:
      "Създавайте групи за приятели, семейство или общност и управлявайте членовете на едно място.",
  },
  {
    title: "Планиране на пътувания",
    description:
      "Подредете дати, дестинация, бюджет, капацитет и място на среща без разпилени чатове.",
  },
  {
    title: "Коментари и предпочитания",
    description:
      "Събирайте идеи, въпроси и лични предпочитания за транспорт, настаняване и важни бележки.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-4 pt-8 sm:px-6 sm:pb-6 sm:pt-10 lg:px-8 lg:pb-8 lg:pt-12">
      <section className="max-w-3xl">
        <h1 className="max-w-3xl text-xl font-black tracking-tight text-slate-950 sm:text-2xl lg:text-3xl">
          Планирайте групови приключения с увереност
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Travel Group Organizer събира групи, пътувания, членове, коментари и
          предпочитания в един ясен работен център за малки туристически
          общности.
        </p>
      </section>

      <section aria-labelledby="features-heading">
        <p
          id="features-heading"
          className="text-sm font-bold uppercase tracking-wide text-emerald-700"
        >
          Основни възможности
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/10"
            >
              <div className="mb-3 h-1.5 w-12 rounded-full bg-emerald-500" />
              <h3 className="text-base font-bold text-slate-950">
                {feature.title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
