import { rateLimit, getClientIp } from "../../lib/rateLimit";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const ip = getClientIp(req);

  const allowed = await rateLimit({
    key: ip,
    route: "login",
    limit: 10,
    windowSeconds: 900,
  });

  if (!allowed) {
    return res.status(429).json({
      error: "Too many login attempts",
    });
  }

  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    res.setHeader(
      "Set-Cookie",
      "admin=true; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400"
    );

    return res.status(200).json({
      success: true,
    });
  }

  return res.status(401).json({
    error: "Wrong password",
  });
}
