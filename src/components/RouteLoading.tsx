import Image from 'next/image';

type RouteLoadingProps = {
  compact?: boolean;
};

export default function RouteLoading({ compact = false }: RouteLoadingProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="relative flex flex-col items-center">
        <div className="absolute h-28 w-28 rounded-full bg-zinc-200/60 blur-2xl animate-[loaderPulse_1.8s_ease-in-out_infinite]" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/25 bg-white/90 shadow-2xl shadow-black/20">
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-700 animate-spin" />
          <Image
            src="/logo.png"
            alt="EMM"
            width={42}
            height={42}
            priority
            className="relative z-10 h-10 w-10 object-contain animate-[logoFloat_1.6s_ease-in-out_infinite]"
          />
        </div>
        {/* <p className="mt-4 text-sm font-semibold tracking-wide text-zinc-700">Loading...</p> */}
      </div>
    </div>
  );
}
