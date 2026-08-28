import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // In-memory cloud sync store (persists during container runtime)
  let cloudReportsStore: any[] = [];

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      restaurant: "مطعم يحيى البيك",
      system: "نظام ملخص الجرد والمصاريف وإغلاق الكاش",
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/reports", (req, res) => {
    res.json({ reports: cloudReportsStore });
  });

  app.post("/api/reports", (req, res) => {
    const report = req.body;
    if (!report || !report.date) {
      return res.status(400).json({ error: "بيانات التقرير غير صالحة" });
    }
    const idx = cloudReportsStore.findIndex(
      (r) => r.id === report.id || r.date === report.date
    );
    if (idx >= 0) {
      cloudReportsStore[idx] = report;
    } else {
      cloudReportsStore.unshift(report);
    }
    res.json({
      success: true,
      message: "تم حفظ التقرير سحابياً بنجاح",
      totalSaved: cloudReportsStore.length
    });
  });

  app.post("/api/sync", (req, res) => {
    const { clientReports } = req.body;
    if (Array.isArray(clientReports)) {
      const map = new Map();
      cloudReportsStore.forEach((r) => map.set(r.id || r.date, r));
      clientReports.forEach((r) => map.set(r.id || r.date, r));
      cloudReportsStore = Array.from(map.values()).sort((a, b) =>
        b.date > a.date ? 1 : -1
      );
    }
    res.json({
      success: true,
      message: "تمت المزامنة السحابية بنجاح",
      reports: cloudReportsStore
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
