interface Props {
  code: string;
  name: string;
  size?: number;
}

export default function FlagImg({ code, name, size = 24 }: Props) {
  return (
    <span
      className={`fi fi-${code} flag-img`}
      title={name}
      style={{ fontSize: size, borderRadius: 2, flexShrink: 0 }}
    />
  );
}
