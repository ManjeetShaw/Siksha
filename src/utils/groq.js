// Single shared Groq client. Previously this exact function was copy-pasted
// into both flashcardController.js and routes/aiRoutes.js — a fix to one
// wasn't applied to the other. Now there is one place to fix.

const DEFAULT_MODEL = "llama-3.1-8b-instant";
const FALLBACK_MODEL = "llama-3.3-70b-versatile";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGroq(prompt, model) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.error?.message || JSON.stringify(data?.error) || "Groq request failed");
    err.status = res.status;
    throw err;
  }
  return data.choices[0].message.content;
}

// Retries once on 429 (rate limited) with a short backoff, then falls back
// to a different model if the primary model keeps failing.
export const groq = async (prompt, { model = DEFAULT_MODEL, retries = 1 } = {}) => {
  try {
    return await callGroq(prompt, model);
  } catch (err) {
    if (err.status === 429 && retries > 0) {
      await sleep(1500);
      return groq(prompt, { model, retries: retries - 1 });
    }
    if (model !== FALLBACK_MODEL) {
      try {
        return await callGroq(prompt, FALLBACK_MODEL);
      } catch {
        // fall through to throwing the original error below
      }
    }
    throw err;
  }
};

export default groq;
