import { supabaseAdmin } from "./supabaseAdmin";

export async function rateLimit({
  key,
  route,
  limit,
  windowSeconds,
}) {
  const since = new Date(
    Date.now() - windowSeconds * 1000
  ).toISOString();

  await supabaseAdmin
    .from("rate_limits")
    .delete()
    .lt("created_at", since);

  const { count, error: countError } =
    await supabaseAdmin
      .from("rate_limits")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("key", key)
      .eq("route", route)
      .gte("created_at", since);

  if (countError) {
    throw countError;
  }

  if (count >= limit) {
    return false;
  }

  const { error: insertError } =
    await supabaseAdmin
      .from("rate_limits")
      .insert([
        {
          key,
          route,
        },
      ]);

  if (insertError) {
    throw insertError;
  }

  return true;
}

export function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]
      ?.split(",")[0]
      ?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}
