import { supabaseAdmin } from "../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, admin, id } = req.body;

  if (!token || !admin || !id) {
    return res.status(400).json({ error: "Missing data" });
  }

  const { data: group, error: groupError } = await supabaseAdmin
    .from("groups")
    .select("admin_token")
    .eq("token", token)
    .single();

  if (groupError || !group || admin !== group.admin_token) {
    return res.status(401).json({ error: "Not authorized" });
  }

  const { error } = await supabaseAdmin
    .from("events")
    .delete()
    .eq("id", id)
    .eq("group_token", token);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
