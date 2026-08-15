export default function SpecList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-5 border-l border-ink/30 pl-4 font-mono text-xs leading-[2.05] tracking-spec opacity-80">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
