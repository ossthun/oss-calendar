import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { hashToken } from "../../lib/hashToken";

const MAX_TITLE_LENGTH = 80;
const MAX_EVENTS_PER_GROUP_PER_DAY = 8;

function isValidDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

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

  if (!isValidDate(date)) {
    return res.status(400).json({
      error: "Invalid date",
    });
  }

  const cleanTitle = String(title).trim();

  if (!cleanTitle) {
    return res.status(400).json({
      error: "Title required",
    });
  }

  if (cleanTitle.length > MAX_TITLE_LENGTH) {
    return res.status(400).json({
      error: "Title too long",
    });
  }

  const { data: group, error: groupError } = await supabaseAdmin
    .from("groups")
    .select("admin_token_hash")
    .eq("token", token)
    .single();

  if (groupError || !group) {
    return res.status(404).json({
      error: "Calendar not found",
    });
  }

  const isAdmin =
    !!admin && hashToken(admin) === group.admin_token_hash;

  // ADMIN ONLY: editing existing events
  if (id) {
    if (!isAdmin) {
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

  // PUBLIC ANTI-SPAM: limit number of events per calendar per day
  const { count, error: countError } = await supabaseAdmin
    .from("events")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("group_token", token)
    .eq("date", date)
    .eq("is_holiday", false);

  if (countError) {
    return res.status(500).json({
      error: countError.message,
    });
  }

  if (!isAdmin && count >= MAX_EVENTS_PER_GROUP_PER_DAY) {
    return res.status(429).json({
      error: "Too many events for this date",
    });
  }

  // PUBLIC ANTI-SPAM: prevent exact duplicate event on same date
  const { data: duplicates, error: duplicateError } = await supabaseAdmin
    .from("events")
    .select("id")
    .eq("group_token", token)
    .eq("date", date)
    .eq("title", cleanTitle)
    .limit(1);

  if (duplicateError) {
    return res.status(500).json({
      error: duplicateError.message,
    });
  }

  if (!isAdmin && duplicates.length > 0) {
    return res.status(409).json({
      error: "Duplicate event",
    });
  }

  const { error } = await supabaseAdmin.from("events").insert([
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
