import { supabaseAdmin } from "../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (req.cookies.admin !== "true") {
    return res.status(401).json({ error: "Not authorized" });
  }

  const { id, token } = req.body;

  if (!id || !token) {
    return res.status(400).json({ error: "Missing data" });
  }

  const { error: eventError } = await supabaseAdmin
    .from("events")
    .delete()
    .eq("group_token", token);

  if (eventError) {
    return res.status(500).json({ error: eventError.message });
  }

  const { error: groupError } = await supabaseAdmin
    .from("groups")
    .delete()
    .eq("id", id)
    .eq("token", token);

  if (groupError) {
    return res.status(500).json({ error: groupError.message });
  }

  return res.status(200).json({ success: true });
}
