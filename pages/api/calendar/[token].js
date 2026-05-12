import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    return res.status(500).json({
      error: "Missing NEXT_PUBLIC_SUPABASE_URL",
    });
  }

  if (!serviceKey) {
    return res.status(500).json({
      error: "Missing SUPABASE_SERVICE_ROLE_KEY",
    });
  }

  const supabaseAdmin = createClient(
    supabaseUrl,
    serviceKey
  );

  const { data, error } = await supabaseAdmin
    .from("groups")
    .select("*")
    .limit(1);

  if (error) {
    return res.status(500).json({
      error: error.message,
      details: error,
    });
  }

  return res.status(200).json({
    success: true,
    data,
  });
}
