import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { hashToken } from "../../lib/hashToken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const { token, admin, id, title, date } = req.body;

  if (!token || !title || !date) {
    return res.status(400).json({
      error: "Missing data",
    });
  }

  const cleanTitle = String(title).trim();

  if (!cleanTitle) {
    return res.status(400).json({
      error: "Title required",
    });
  }

  if (cleanTitle.length > 120) {
    return res.status(400).json({
      error: "Title too long",
    });
  }

  const { data: group, error: groupError } =
    await supabaseAdmin
      .from("groups")
      .select("admin_token_hash")
      .eq("token", token)
      .single();

  if (groupError || !group) {
    return res.status(404).json({
      error: "Calendar not found",
    });
  }

  // PUBLIC: anyone with the calendar link may create new events
  if (!id) {
    const { error } = await supabaseAdmin
      .from("events")
      .insert([
        {
          group_token: token,
          title: cleanTitle,
          date,
          is_holiday: false,
        },
      ]);

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
    });
  }

  // ADMIN ONLY: editing existing events
  if (
    !admin ||
    hashToken(admin) !== group.admin_token_hash
  ) {
    return res.status(401).json({
      error: "Not authorized",
    });
  }

  const { error } = await supabaseAdmin
    .from("events")
    .update({
      title: cleanTitle,
      date,
    })
    .eq("id", id)
    .eq("group_token", token);

  if (error) {
    return res.status(500).json({
      error: error.message,
    });
  }

  return res.status(200).json({
    success: true,
  });
}
