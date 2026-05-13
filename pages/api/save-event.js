import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { hashToken } from "../../lib/hashToken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, admin, id, title, date } = req.body;

  if (!token || !admin || !title || !date) {
    return res.status(400).json({ error: "Missing data" });
  }

  const { data: group, error: groupError } = await supabaseAdmin
    .from("groups")
    .select("admin_token_hash")
    .eq("token", token)
    .single();

  if (
    groupError ||
    !group ||
    hashToken(admin) !== group.admin_token_hash
  ) {
    return res.status(401).json({ error: "Not authorized" });
  }

  if (id) {
    const { error } = await supabaseAdmin
      .from("events")
      .update({ title, date })
      .eq("id", id)
      .eq("group_token", token);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  }

  const { error } = await supabaseAdmin.from("events").insert([
    {
      group_token: token,
      title,
      date,
      is_holiday: false,
    },
  ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
