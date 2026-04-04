"use client";

type Props = {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
};

export default function CategorySidebar({
  categories,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="space-y-2">
      {["ALL", ...categories].map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`w-full text-left px-4 py-2 rounded-lg border transition-all duration-200 ${
            selected === category
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-slate-700 border-slate-200 hover:bg-blue-50"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}