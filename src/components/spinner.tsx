export function Spinner({ dark = true }: { dark?: boolean }) {
  return (
    <div
      className={`flex min-h-screen flex-1 items-center justify-center ${dark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div
        className={`h-12 w-12 animate-spin rounded-full border-b-2 ${dark ? "border-white" : "border-black"}`}
      />
    </div>
  );
}
