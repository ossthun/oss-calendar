import { hashToken } from "../../../lib/hashToken";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  const { token } = req.query;

  const country = req.headers["x-vercel-ip-country"];

  if (country !== "CH") {
    return res.status(403).json({
      error: "Only accessible from Switzerland",
    });
  }

  const { data: group, error: groupError } =
    await supabaseAdmin
      .from("groups")
      .select("name, admin_token_hash")
      .eq("token", token)
      .single();

  if (groupError || !group) {
    return res.status(404).json({
      error: "Calendar not found",
    });
  }

  const { data: events, error: eventsError } =
    await supabaseAdmin
      .from("events")
      .select("*")
      .eq("group_token", token)
      .order("date");

  if (eventsError) {
    return res.status(500).json({
      error: "Could not load events",
    });
  }

  return res.status(200).json({
    groupName: group.name,
    isAdmin:
      group.admin_token &&
      req.query.admin && hashToken(admin) === group.admin_token_hash,
    events: events || [],
  });
}
