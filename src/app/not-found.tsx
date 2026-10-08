import { Button } from "@/components/ui/button";
import { Logotype } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[80vh] flex-col items-start justify-center pt-[var(--header-h)]">
      <Logotype className="w-40 text-deu/15" />
      <p className="eyebrow mt-10 text-deu">404</p>
      <h1 className="display mt-4 text-5xl sm:text-7xl">
        Bu sayfa <span className="serif-accent text-deu">kayıp.</span>
      </h1>
      <p className="mt-6 max-w-md text-lg text-ink/70">
        Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir. Aramak için <kbd className="rounded border border-line px-1.5">/</kbd>{" "}
        tuşuna basın.
      </p>
      <div className="mt-10">
        <Button href="/">Ana sayfaya dön</Button>
      </div>
    </section>
  );
}
