import Chip from "./ui/chip";

export default function ChipList({
  items,
}: {
  items: readonly { label: string; meta: string }[];
}) {
  return (
    <ul className="mt-5.5 flex flex-col gap-2.5">
      {items.map((item) => (
        <Chip key={item.label} {...item} />
      ))}
    </ul>
  );
}
