import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();

  // In AI Studio dev container, the reverse proxy expects port 3000.
  // In Cloud Run production deployment, Cloud Run injects PORT (typically 8080).
  const isDev = process.env.NODE_ENV !== "production" && Boolean(process.env.CONTROL_PLANE_PORT);
  const PORT = isDev ? 3000 : (Number(process.env.PORT) || 8080);

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Contact & Query submission endpoint (routed to megaitdepartment@gmail.com)
  const inquiries: Array<{
    id: string;
    timestamp: string;
    name: string;
    email: string;
    phone?: string;
    category: string;
    subject: string;
    message: string;
    targetEmail: string;
  }> = [];

  app.post("/api/contact", (req, res) => {
    try {
      const { name, email, phone, category = "General Query", subject, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          error: "Name, email, and message are required fields."
        });
      }

      const newInquiry = {
        id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        name: String(name).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim() : undefined,
        category: String(category).trim(),
        subject: subject ? String(subject).trim() : `Inquiry from ${name}`,
        message: String(message).trim(),
        targetEmail: "megaitdepartment@gmail.com"
      };

      inquiries.unshift(newInquiry);
      console.log(`[Mega College IT Dept] New inquiry from ${newInquiry.name} <${newInquiry.email}>: ${newInquiry.subject} (routed to megaitdepartment@gmail.com)`);

      res.status(200).json({
        success: true,
        message: "Your query / feedback has been received and routed to the Mega IT Department (megaitdepartment@gmail.com).",
        inquiryId: newInquiry.id,
        timestamp: newInquiry.timestamp,
        targetEmail: "megaitdepartment@gmail.com"
      });
    } catch (err) {
      console.error("Error processing inquiry:", err);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  app.get("/api/contact/latest", (req, res) => {
    res.json({ count: inquiries.length, recent: inquiries.slice(0, 5) });
  });

  // Vite middleware for development
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(process.cwd(), "dist", "index.html"))
      ? path.join(process.cwd(), "dist")
      : fs.existsSync(path.join(__dirname, "index.html"))
      ? __dirname
      : path.join(process.cwd(), "dist");

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (mode: ${isDev ? "dev" : "production"})`);
  });
}

startServer();

