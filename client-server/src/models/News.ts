import mongoose, { Schema, model, models } from "mongoose";

const NewsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    stocks: [{
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    }],

    domain: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      
    },

    signal: {
      type: String,
      required: true,
      enum: ["BUY", "SELL", "HOLD"],
    },

    confidence_score: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },

    rsi: {
      type: Number,
      required: false,
      default: null,
    },

    macd: {
      type: Number,
      required: false,
      default: null,
    },
    reasoning: {
      type: String,
      required: false,
      trim: true,
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
    expiresAt: {
    type: Date,
    default: () =>
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const News = models.News || model("News", NewsSchema);

export default News;