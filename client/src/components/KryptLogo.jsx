
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
