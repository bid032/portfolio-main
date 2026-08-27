import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-[8rem] font-bold text-secondary leading-none">
        4<span className="text-primary">0</span>4
      </h1>
      <p className="text-text-secondary text-lg mt-4 mb-8">
        This page doesn&apos;t exist - yet.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-primary text-background font-semibold text-sm tracking-wide rounded-full hover:bg-primary-dark transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,127,0,0.3)]"
      >
        Back Home
      </Link>
    </div>
  );
}
