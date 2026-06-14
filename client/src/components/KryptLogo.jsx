/**
 * KryptLogo — reusable logo icon component.
 * Renders the dark rounded square with white "k" to match the brand asset.
 * Pass `size` in px (default 32).
 */
export default function KryptLogo({ size = 32 }) {
  return (
    <img
      src="/logo.svg"
      alt="Krypt logo"
      width={size}
      height={size}
      style={{ borderRadius: size * 0.22, display: 'block', flexShrink: 0 }}
    />
  );
}
