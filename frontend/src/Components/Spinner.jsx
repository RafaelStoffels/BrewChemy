export function Spinner({ size = 16, light = false }) {
  const ring =
    light
      ? "border-white/30 border-t-white"
      : "border-gray-400/40 border-t-gray-500";

  const px = typeof size === "number" ? `${size}px` : size;

  return (
    <span
      className={[
        // forma e layout
        "inline-block box-border rounded-full align-middle",
        // borda do “anel”
        "border-2 border-solid border-r-transparent", // <- evita depender do preflight
        ring,
        // animação
        "animate-spin",
      ].join(" ")}
      style={{ width: px, height: px }}
      aria-hidden="true"
      role="status"
    />
  );
}