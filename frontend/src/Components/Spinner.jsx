export function Spinner({ size = 16, light = false }) {
  const border = light
    ? "border-white/30 border-t-white"
    : "border-gray-400/40 border-t-gray-500";
  return (
    <div
      className={`animate-spin rounded-full border-2 ${border}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}