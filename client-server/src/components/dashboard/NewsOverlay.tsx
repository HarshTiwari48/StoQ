"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type NewsOverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: any;
};

export default function NewsOverlay({
  open,
  onOpenChange,
  article,
}: NewsOverlayProps) {
  if (!article) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="!w-[95vw] !max-w-[1400px] rounded-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold leading-8">
            {article.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid grid-cols-12 gap-6">
  {/* LEFT SIDE */}
  <div className="col-span-7 space-y-5">
    {(article.imageUrl || article.image_url) && (
      <img
        src={
          article.imageUrl ||
          article.image_url
        }
        alt={article.title}
        className="w-full h-80 object-cover rounded-lg"
      />
    )}

    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500">
        {article.source}
      </p>

      {(article.sourceUrl ||
        article.source_url) && (
        <a
          href={
            article.sourceUrl ||
            article.source_url
          }
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Read Full Article →
        </a>
      )}
    </div>

    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-slate-700 leading-8">
        {article.description}
      </p>
    </div>

    {/* Reasoning */}
    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
      <p className="text-sm font-medium text-slate-500 mb-2">
        AI Reasoning
      </p>

      <p className="text-slate-700 leading-7 whitespace-pre-line">
        {article.reasoning ||
          "No reasoning available"}
      </p>
    </div>
  </div>

  {/* RIGHT SIDE */}
  {/* RIGHT SIDE */}
<div className="col-span-5 space-y-4">
  <div>
    <p className="text-sm text-slate-500 mb-3">
      Stock-wise AI Analysis
    </p>

    <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
      {article.analysis?.flatMap(
        (domain: any) =>
          domain.stocks?.map(
            (stock: any) => (
              <div
                key={stock.ticker}
                className="rounded-lg border border-slate-200 p-4 bg-white shadow-sm"
              >
                {/* top row */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-lg">
                      {stock.ticker}
                    </p>
                    <p className="text-xs text-slate-500">
                      {domain.domain}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Badge>
                      {stock.signal}
                    </Badge>

                    <Badge variant="outline">
                      {(
                        stock.confidence_score *
                        100
                      ).toFixed(0)}
                      %
                    </Badge>
                  </div>
                </div>

                {/* metrics */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="rounded-md border p-2">
                    <p className="text-xs text-slate-500">
                      RSI
                    </p>
                    <p className="font-medium">
                      {stock.data?.rsi ??
                        "--"}
                    </p>
                  </div>

                  <div className="rounded-md border p-2">
                    <p className="text-xs text-slate-500">
                      MACD
                    </p>
                    <p className="font-medium">
                      {stock.data?.macd ??
                        "--"}
                    </p>
                  </div>

                  <div className="rounded-md border p-2">
                    <p className="text-xs text-slate-500">
                      Sentiment
                    </p>
                    <p className="font-medium">
                      {stock.data?.sentiment ??
                        "--"}
                    </p>
                  </div>
                </div>

                {/* reasoning */}
                <div className="rounded-md bg-blue-50 border border-blue-100 p-3">
                  <p className="text-xs text-slate-500 mb-1">
                    AI Reasoning
                  </p>

                  <p className="text-sm text-slate-700 leading-6">
                    {stock.reasoning}
                  </p>
                </div>
              </div>
            )
          )
      )}
    </div>
  </div>
</div>
</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}