import { supabaseAdmin } from "../../lib/supabaseAdmin";

export default async function handler(req, res) {
  const admin =
    req.cookies.admin;

  if (admin !== "true") {
    return res.status(401).end();
  }

  const { id } = req.body;

  const { error } = await supabaseAdmin
    .from("events")
    .delete()
    .eq("id", id);

  if (error) {
    return res.status(500).json(error);
  }

  res.status(200).json({
    success: true,
  });
}
