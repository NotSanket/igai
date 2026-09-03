export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-3xl text-center" aria-labelledby="igai-title">
        <p className="mb-4 text-sm font-semibold tracking-[0.32em] text-emerald-700 uppercase">
          Intelligent CSR allocation
        </p>
        <h1
          id="igai-title"
          className="text-6xl font-bold tracking-tight text-slate-950 sm:text-8xl"
        >
          IGAI
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-slate-600 sm:text-2xl">
          Impact-Driven, Geographical Equity,
          <br className="hidden sm:block" /> Allocation &amp; Intelligence
        </p>
        <p className="mt-10 text-base font-medium text-slate-900 sm:text-lg">
          Every rupee. The right project. Greater impact.
        </p>
      </section>
    </main>
  );
}
