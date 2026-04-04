export async function translateToHindi(text: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi`
    );
    const data = await res.json();
    return data.responseData?.translatedText ?? text;
  } catch {
    return text; // fallback to original if fails
  }
}