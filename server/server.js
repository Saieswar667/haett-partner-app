const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { initDb } = require("./db");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

let db;

function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }

  next();
}

app.get("/", (req, res) => {
  res.send("Haett Partner API running");
});
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await db.get(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.run(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, hashedPassword, "user"]
  );

  res.json({ message: "Account created successfully" });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

app.get("/api/partner/me", auth, async (req, res) => {
  const application = await db.get(
    "SELECT * FROM applications WHERE userId = ? ORDER BY id DESC LIMIT 1",
    [req.user.id]
  );

  if (!application) {
    return res.json({
      user: req.user,
      application: null,
      codes: [],
    });
  }

  const codes = await db.all(
    "SELECT * FROM discount_codes WHERE applicationId = ?",
    [application.id]
  );

  res.json({
    user: req.user,
    application,
    codes,
  });
});

app.post("/api/applications", auth, async (req, res) => {
  const {
    partnerType,
    businessName,
    phone,
    website,
    audienceSize,
    description,
  } = req.body;

  if (!partnerType || !businessName) {
    return res.status(400).json({
      message: "Partner type and business name are required",
    });
  }

  if (description && description.length > 500) {
    return res.status(400).json({
      message: "Description must be under 500 characters",
    });
  }

  await db.run(
    `INSERT INTO applications
    (userId, partnerType, businessName, phone, website, audienceSize, description, status, appliedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.id,
      partnerType,
      businessName,
      phone || "",
      website || "",
      audienceSize || "",
      description || "",
      "pending",
      new Date().toISOString(),
    ]
  );

  res.json({
    message: "Application submitted successfully",
  });
});

app.get("/api/admin/applications", auth, adminOnly, async (req, res) => {
  const { status } = req.query;

  let query = `
    SELECT applications.*, users.name, users.email
    FROM applications
    JOIN users ON applications.userId = users.id
  `;

  const params = [];

  if (status && status !== "all") {
    query += " WHERE applications.status = ?";
    params.push(status);
  }

  query += " ORDER BY applications.id DESC";

  const applications = await db.all(query, params);

  const pending = await db.get(
    "SELECT COUNT(*) as count FROM applications WHERE status = 'pending'"
  );
  const approved = await db.get(
    "SELECT COUNT(*) as count FROM applications WHERE status = 'approved'"
  );
  const rejected = await db.get(
    "SELECT COUNT(*) as count FROM applications WHERE status = 'rejected'"
  );
  const all = await db.get("SELECT COUNT(*) as count FROM applications");

  for (const item of applications) {
    item.codes = await db.all(
      "SELECT * FROM discount_codes WHERE applicationId = ?",
      [item.id]
    );
  }

  res.json({
    applications,
    counts: {
      pending: pending.count,
      approved: approved.count,
      rejected: rejected.count,
      all: all.count,
    },
  });
});

app.patch("/api/admin/applications/:id/approve", auth, adminOnly, async (req, res) => {
  const id = req.params.id;

  await db.run(
    "UPDATE applications SET status = 'approved', approvedAt = ? WHERE id = ?",
    [new Date().toISOString(), id]
  );

  const code = "HAETT" + Math.floor(1000 + Math.random() * 9000);

  await db.run(
    `INSERT INTO discount_codes
    (applicationId, code, discountValue, usedCount, totalDiscount, active, expiryDate)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, code, 20, 0, 0, 1, "2026-12-31"]
  );

  res.json({
    message: "Application approved and discount code created",
    code,
  });
});

app.patch("/api/admin/applications/:id/reject", auth, adminOnly, async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      message: "Rejection reason is required",
    });
  }

  await db.run(
    "UPDATE applications SET status = 'rejected', rejectionReason = ? WHERE id = ?",
    [reason, req.params.id]
  );

  res.json({
    message: "Application rejected",
  });
});

app.patch("/api/admin/codes/:id/toggle", auth, adminOnly, async (req, res) => {
  const code = await db.get(
    "SELECT * FROM discount_codes WHERE id = ?",
    [req.params.id]
  );

  if (!code) {
    return res.status(404).json({
      message: "Code not found",
    });
  }

  const newStatus = code.active ? 0 : 1;

  await db.run(
    "UPDATE discount_codes SET active = ? WHERE id = ?",
    [newStatus, req.params.id]
  );

  res.json({
    message: "Code status updated",
  });
});

const PORT = process.env.PORT || 5000;

initDb().then((database) => {
  db = database;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});