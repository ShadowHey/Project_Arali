import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || process.env.SERVER_PORT || 3001;
const FROM_EMAIL = process.env.FROM_EMAIL || "Arali <no-reply@arali.ai>";

let cached = null;
function getClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");
  if (!cached) cached = new Resend(apiKey);
  return cached;
}

app.post("/api/send-invoice-email", async (req, res) => {
  const { to, cc, subject, html, pdfBase64, pdfFilename } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: "Missing to, subject, or html" });
  }

  const attachments = pdfBase64
    ? [{ filename: pdfFilename || "invoice.pdf", content: Buffer.from(pdfBase64, "base64") }]
    : undefined;

  try {
    const resend = getClient();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      cc: cc || undefined,
      subject,
      html,
      attachments,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: error.message || "Email send failed" });
    }

    console.log("Email sent:", data?.id);
    res.json({ success: true, emailId: data?.id });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
});

app.get("/api/healthz", (_req, res) => res.json({ ok: true }));

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
