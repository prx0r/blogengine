import Link from "next/link";
import AudioStudio from "@/components/AudioStudio";

export default function AudioPage() {
  return (
    <div className="flex flex-col flex-1 mx-auto w-full max-w-[960px] px-4 py-8">
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Home
        </Link>
      </nav>

      <h1 className="text-2xl font-bold mb-1">Audio Studio</h1>
      <p className="text-sm text-zinc-500 mb-8">
        Test TTS voices, apply effects, and save presets for essay generation
      </p>

      <AudioStudio />
    </div>
  );
}
