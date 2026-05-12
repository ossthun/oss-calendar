import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  const { token } = req.query;

  const country =
    req.headers["x-vercel-ip-country"];

  if (country !== "CH") {
    return res.status(403).json({
      error: "Access only from Switzerland",
    });
  }

  const { data, error } = await supabaseAdmin
    .from("events")
    .select("*")
    .eq("group_token", token)
    .order("date");

  if (error) {
    return res.status(500).json({
      error: "Database error",
    });
  }

  res.status(200).json(data);
}
