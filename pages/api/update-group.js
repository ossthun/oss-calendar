import { supabaseAdmin } from "../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (req.cookies.admin !== "true") {
    return res.status(401).json({ error: "Not authorized" });
  }

  const { id, name } = req.body;
  const cleanName = String(name || "").trim();

  if (!id || !cleanName) {
    return res.status(400).json({ error: "Missing data" });
  }

  if (cleanName.length > 80) {
    return res.status(400).json({ error: "Group name too long" });
  }

  const { error } = await supabaseAdmin
    .from("groups")
    .update({ name: cleanName })
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
