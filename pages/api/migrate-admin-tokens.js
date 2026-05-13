import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { hashToken } from "../../lib/hashToken";

export default async function handler(req, res) {
  const secret = req.query.secret;

  if (secret !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Not authorized" });
  }

  const { data: groups, error } = await supabaseAdmin
    .from("groups")
    .select("id, admin_token")
    .not("admin_token", "is", null);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  let updated = 0;

  for (const group of groups) {
    const hash = hashToken(group.admin_token);

    const { error: updateError } = await supabaseAdmin
      .from("groups")
      .update({ admin_token_hash: hash })
      .eq("id", group.id);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    updated++;
  }

  return res.status(200).json({
    success: true,
    updated,
  });
}
