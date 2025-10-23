// Simple health check API for Vercel serverless
export default function handler(req, res) {
  res.status(200).json({ message: "Healthy!" });
}