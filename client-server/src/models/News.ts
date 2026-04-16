import mongoose, { Schema, model, models } from "mongoose";

const StockAnalysisSchema = new Schema(
  {
    ticker: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    signal: {
      type: String,
      required: true,
      enum: ["BUY", "SELL", "HOLD", "STRONG BUY", "STRONG SELL"],
    },
    confidence_score: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    reasoning: {
      type: String,
      required: false,
      trim: true,
    },
    data: {
      rsi: {
        type: Number,
        default: null,
      },
      macd: {
        type: Number,
        default: null,
      },
      sentiment: {
        type: Number,
        default: null,
      },
    },
  },
  { _id: false }
);

const DomainAnalysisSchema = new Schema(
  {
    domain: {
      type: String,
      required: true,
      trim: true,
    },
    stocks: {
      type: [StockAnalysisSchema],
      default: [],
    },
  },
  { _id: false }
);

const NewsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    // KEEP OLD FIELDS FOR CURRENT UI
    stocks: [
      {
        type: String,
        uppercase: true,
        trim: true,
      },
    ],

    domain: {
      type: String,
      trim: true,
      default: null,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    signal: {
      type: String,
      enum: ["BUY", "SELL", "HOLD", "STRONG BUY", "STRONG SELL"],
      default: null,
    },

    confidence_score: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },

    rsi: {
      type: Number,
      default: null,
    },

    macd: {
      type: Number,
      default: null,
    },

    reasoning: {
      type: String,
      trim: true,
      default: null,
    },

    // NEW NESTED ML STRUCTURE
    analysis: {
      type: [DomainAnalysisSchema],
      default: [],
    },

    source: {
      type: String,
      default: "NewsAPI",
    },

    publishedAt: {
      type: Date,
      required: false,
    },

    sourceUrl: {
      type: String,
      required: false,
    },

    imageUrl: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const News = models.News || model("News", NewsSchema);

export default News;
