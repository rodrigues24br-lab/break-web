export function AmbientBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,#1a2e14_0%,#0b0d0a_55%,#070806_100%)]" />
      <div className="absolute -left-1/4 top-1/4 h-[50vh] w-[50vw] rounded-full bg-[radial-gradient(circle,rgba(184,242,58,0.12),transparent_70%)] blur-3xl animate-drift" />
      <div className="absolute -right-1/4 bottom-0 h-[45vh] w-[45vw] rounded-full bg-[radial-gradient(circle,rgba(90,160,80,0.1),transparent_70%)] blur-3xl animate-drift-slow" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
