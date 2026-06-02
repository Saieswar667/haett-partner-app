const bcrypt = require("bcryptjs");
const { initDb } = require("./db");

async function seed() {
  const db = await initDb();

  await db.run("DELETE FROM discount_codes");
  await db.run("DELETE FROM applications");
  await db.run("DELETE FROM users");

  const password = await bcrypt.hash("password123", 10);

  // Admin
  await db.run(
    "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
    ["Admin User", "admin@haett.com", password, "admin"]
  );

  // Normal User
  await db.run(
    "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
    ["Normal User", "user@haett.com", password, "user"]
  );

  // Pending User
  await db.run(
    "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
    ["Pending User", "pending@haett.com", password, "user"]
  );

  // Rejected User
  await db.run(
    "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
    ["Rejected User", "rejected@haett.com", password, "user"]
  );

  // Approved User
  await db.run(
    "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
    ["Approved User", "approved@haett.com", password, "user"]
  );

  // Pending Application
  await db.run(
    `INSERT INTO applications
    (userId,partnerType,businessName,status,appliedAt)
    VALUES (?,?,?,?,?)`,
    [
      3,
      "Influencer",
      "FitLife India",
      "pending",
      new Date().toISOString(),
    ]
  );

  // Rejected Application
  await db.run(
    `INSERT INTO applications
    (userId,partnerType,businessName,status,rejectionReason,appliedAt)
    VALUES (?,?,?,?,?,?)`,
    [
      4,
      "Gym",
      "Power Gym",
      "rejected",
      "Audience details were not clear.",
      new Date().toISOString(),
    ]
  );

  // Approved Application
  await db.run(
    `INSERT INTO applications
    (userId,partnerType,businessName,status,appliedAt,approvedAt)
    VALUES (?,?,?,?,?,?)`,
    [
      5,
      "Affiliate",
      "Healthy Deals",
      "approved",
      new Date().toISOString(),
      new Date().toISOString(),
    ]
  );

  // Discount Code
  await db.run(
    `INSERT INTO discount_codes
    (applicationId,code,discountValue,usedCount,totalDiscount,active,expiryDate)
    VALUES (?,?,?,?,?,?,?)`,
    [
      3,
      "HAETT20",
      20,
      15,
      3000,
      1,
      "2026-12-31",
    ]
  );

  console.log("Database seeded successfully");
}

seed();