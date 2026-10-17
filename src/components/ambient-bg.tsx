export function AmbientBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-5%,#ffffff_0%,#f4f1ea_55%,#ebe6dc_100%)]" />
      <div className="absolute -left-1/4 top-0 h-[45vh] w-[50vw] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.08),transparent_70%)] blur-3xl animate-drift" />
      <div className="absolute -right-1/4 bottom-0 h-[40vh] w-[45vw] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.1),transparent_70%)] blur-3xl animate-drift-slow" />
    </div>
  );
}
