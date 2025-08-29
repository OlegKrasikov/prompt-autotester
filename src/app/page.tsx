import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen p-6 sm:p-8 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 items-center justify-center min-h-[calc(100vh-6rem)]">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Prompt Autotester</h1>
          <p className="text-lg text-[color:var(--color-muted-foreground)] mb-8">
            Compare prompt versions on conversation scenarios and see the differences in action.
          </p>
          <Link
            href="/testing"
            className="inline-flex items-center px-6 py-3 bg-[color:var(--color-accent)] text-white text-sm font-semibold rounded-xl hover:brightness-95 active:brightness-90 transition"
          >
            Start Testing →
          </Link>
        </div>
      </div>
    </div>
  );
}
