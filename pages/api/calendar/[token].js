export default async function handler(req, res) {
  return res.status(200).json({
    success: true,
    token: req.query.token,
    country:
      req.headers["x-vercel-ip-country"] || null,
  });
}
