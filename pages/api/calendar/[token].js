import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { data, error } =
      await supabaseAdmin
        .from("groups")
        .select("*")
        .limit(1);

    if (error) {
      return res.status(500).json({
        step: "supabase query",
        error,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      step: "catch",
      message: err.message,
    });
  }
}
