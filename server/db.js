const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function getDb() {
  return open({
    filename: "./haett.db",
    driver: sqlite3.Database,
  });
}

async function initDb() {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      partnerType TEXT,
      businessName TEXT,
      phone TEXT,
      website TEXT,
      audienceSize TEXT,
      description TEXT,
      status TEXT DEFAULT 'pending',
      rejectionReason TEXT,
      appliedAt TEXT,
      approvedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS discount_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      applicationId INTEGER,
      code TEXT,
      discountValue INTEGER,
      usedCount INTEGER DEFAULT 0,
      totalDiscount INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      expiryDate TEXT
    );
  `);

  return db;
}

module.exports = { initDb };