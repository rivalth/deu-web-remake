import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <Image
        src="/brand/deu-tr-blue.svg"
        alt="Dokuz Eylül Üniversitesi logosu"
        width={180}
        height={180}
        priority
        className="dark:invert dark:brightness-0"
      />
      <h1 className="text-3xl font-semibold tracking-tight text-deu-blue dark:text-white sm:text-4xl">
        Dokuz Eylül Üniversitesi
      </h1>
      <p className="max-w-xl text-lg text-foreground/70">
        Girişimcilik ve yenilikçilik alanında geleceğe yön veren; eğitim ve
        bilim merkezi bir üniversite olmak.
      </p>
      <span className="rounded-full bg-deu-blue px-4 py-1.5 text-sm font-medium text-white">
        Yeniden tasarım — yapım aşamasında
      </span>
    </main>
  );
}
