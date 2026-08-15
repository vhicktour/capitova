import { cn } from "@/lib/cn";

export default function Chip({
  label,
  meta,
  className,
}: {
  label: string;
  meta: string;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "flex flex-col gap-0.5 rounded-lg border border-ink/35 px-3.5 py-2.5 font-mono text-xs tracking-spec sm:flex-row sm:justify-between sm:gap-4.5",
        className,
      )}
    >
      <span>{label}</span>
      <span className="opacity-[0.72]">{meta}</span>
    </li>
  );
}
