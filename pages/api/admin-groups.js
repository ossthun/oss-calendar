import { supabaseAdmin } from "../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.cookies.admin !== "true") {
    return res.status(401).json({
      error: "Not authorized",
    });
  }

  const { data, error } = await supabaseAdmin
    .from("groups")
    .select("id, name, token")
    .order("name");

  if (error) {
    return res.status(500).json({
      error: error.message,
    });
  }

  return res.status(200).json({
    groups: data || [],
  });
}
