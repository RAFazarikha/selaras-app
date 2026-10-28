type Db = { from(t: string): { insert(v: object): PromiseLike<{ error: unknown }> } };

export const rp = (n: number) => "Rp" + Math.round(n).toLocaleString("id-ID");

export async function sendDiscord(url: string, content: string) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content }),
      signal: AbortSignal.timeout(4000), // jangan biarkan fetch menggantung
    });
    if (!res.ok) console.error("discord status", res.status);
  } catch (e) {
    console.error("discord gagal kirim", (e as Error).message);
  }
}

export async function claim(db: Db, period_id: string, kind: string) {
  const { error } = await db.from("notification_log").insert({ period_id, kind });
  return !error;
}
