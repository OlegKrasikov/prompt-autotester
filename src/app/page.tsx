import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen p-6 font-sans sm:p-8 md:p-10">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-4xl flex-col items-center justify-center gap-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Prompt Autotester</h1>
          <p className="mb-8 text-lg text-[color:var(--color-muted-foreground)]">
            Compare prompt versions on conversation scenarios and see the differences in action.
          </p>
          <Link
            href="/testing"
            className="inline-flex items-center rounded-xl bg-[color:var(--color-accent)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95 active:brightness-90"
          >
            Start Testing →
          </Link>
        </div>
      </div>
    </div>
  );
}
