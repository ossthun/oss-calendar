export default function handler(req, res) {
  const { password } = req.body;
console.log("Password entered:", password);
console.log("ADMIN_PASSWORD exists:", !!process.env.ADMIN_PASSWORD);
  if (password === process.env.ADMIN_PASSWORD) {
    res.setHeader(
      "Set-Cookie",
      "admin=true; HttpOnly; Path=/; SameSite=Lax"
    );

    return res.status(200).json({
      success: true,
    });
  }

  return res.status(401).json({
    error: "Wrong password",
  });
}
