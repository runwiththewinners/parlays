const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL!;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

export async function redisGet(key: string): Promise<any> {
  const url = UPSTASH_URL + "/get/" + key;
  const res = await fetch(url, {
    headers: { Authorization: "Bearer " + UPSTASH_TOKEN },
    cache: "no-store",
  });
  const data = await res.json();
  if (!data.result) return null;
  try {
    let parsed = JSON.parse(data.result);
    // Handle double-stringified data from earlier bug
    if (typeof parsed === "string") {
      try { parsed = JSON.parse(parsed); } catch {}
    }
    return parsed;
  } catch {
    return data.result;
  }
}

export async function redisSet(key: string, value: any): Promise<void> {
  const url = UPSTASH_URL + "/set/" + key;
  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + UPSTASH_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
    cache: "no-store",
  });
}
