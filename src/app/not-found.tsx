import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-6 text-center text-white">
      <p className="text-sm tracking-[0.2em] text-red-300">404</p>
      <h1 className="mt-3 text-2xl font-semibold">Esta página no existe</h1>
      <Link href="/" className="mt-6 text-sm text-blue-400 underline">
        Volver al inicio
      </Link>
    </div>
  );
}
