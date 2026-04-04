import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendNewsToML(newsData: any[]) {
  try {
    const mlPayload = newsData.map((item) => ({
      date: item.date,
      source: item.source,
      title: item.title,
      description: item.description,
    }));

    console.log("Sending to ML:", mlPayload.length);

    const response = await axios.post(
      ML_SERVICE_URL,
      mlPayload
    );

    return response.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(
      "ML API ERROR:",
      error?.response?.data || error.message
    );
    throw error;
  }
}