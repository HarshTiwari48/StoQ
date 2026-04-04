import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type NewsCardProps = {
  title: string;
  source: string;
  signal: "BUY" | "SELL" | "HOLD";
  confidence: number;
  stocks: string[];
  imageUrl?: string;
};

export default function NewsCard({
  title,
  source,
  signal,
  confidence,
  stocks,
  imageUrl,
}: NewsCardProps) {
  const signalStyle =
    signal === "BUY"
      ? "bg-green-100 text-green-700"
      : signal === "SELL"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <Card className="rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 p-4">
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-28 h-24 overflow-hidden rounded-lg bg-slate-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
              No Image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <h2 className="text-base font-semibold text-slate-800 line-clamp-2">
            {title}
          </h2>

          <p className="text-sm text-slate-500">{source}</p>

          <div className="flex items-center gap-3">
            <Badge className={signalStyle}>
              {signal}
            </Badge>

            <span className="text-sm font-medium text-slate-600">
              {(confidence * 100).toFixed(0)}%
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {stocks.map((stock) => (
              <span
                key={stock}
                className="px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-700"
              >
                {stock}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}