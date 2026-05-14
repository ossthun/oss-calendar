import crypto from "crypto";
import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { hashToken } from "../../lib/hashToken";

function randomToken(length = 16) {
  return crypto.randomBytes(length).toString("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  if (req.cookies.admin !== "true") {
    return res.status(401).json({
      error: "Not authorized",
    });
  }

  const { name } = req.body;

  const cleanName = String(name || "").trim();

  if (!cleanName) {
    return res.status(400).json({
      error: "Group name required",
    });
  }

  if (cleanName.length > 80) {
    return res.status(400).json({
      error: "Group name too long",
    });
  }

  const groupToken = randomToken(6);
  const adminToken = randomToken(12);
  const adminTokenHash = hashToken(adminToken);

  const { data, error } = await supabaseAdmin
    .from("groups")
    .insert([
      {
        name: cleanName,
        token: groupToken,
        admin_token_hash: adminTokenHash,
      },
    ])
    .select("id, name, token")
    .single();

  if (error) {
    return res.status(500).json({
      error: error.message,
    });
  }

  return res.status(200).json({
    success: true,
    group: data,
    adminToken,
    adminLink: `/group/${groupToken}?admin=${adminToken}`,
  });
}
