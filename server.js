const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
let databaseReady = false;
let databaseErrorMessage = null;

let databaseUrl = process.env.DATABASE_URL || "";

try {
  const parsedDatabaseUrl = new URL(databaseUrl);
  // Keep SSL behavior controlled by Node `ssl` object below.
  parsedDatabaseUrl.searchParams.delete("sslmode");
  parsedDatabaseUrl.searchParams.delete("sslcert");
  parsedDatabaseUrl.searchParams.delete("sslkey");
  parsedDatabaseUrl.searchParams.delete("sslrootcert");
  databaseUrl = parsedDatabaseUrl.toString();
} catch (_error) {
  // If parsing fails, use raw value and let `pg` handle it.
}

const pool = hasDatabaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    })
  : null;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const defaultProperties = [
  {
    id: 1,
    title: "Villa Rose Horizon",
    city: "Cannes",
    country: "France",
    price: 280,
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    rating: 4.9,
    image: "https://picsum.photos/seed/villa-rose/900/600",
    description: "Bright villa with terrace, pool and chic ambiance.",
    amenities: ["Pool", "Wi-Fi", "Air conditioning", "Parking", "Sea view"],
    owner_name: "RoseBooking Collection",
    owner_email: "owner.cannes@rosebooking.fr"
  },
  {
    id: 2,
    title: "Maison Palmier Evasion",
    city: "Nice",
    country: "France",
    price: 190,
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    rating: 4.7,
    image: "https://picsum.photos/seed/palmier-evasion/900/600",
    description: "Elegant house close to the center, perfect for a family stay.",
    amenities: ["Balcony", "Equipped kitchen", "Wi-Fi", "Television"],
    owner_name: "RoseBooking Collection",
    owner_email: "owner.nice@rosebooking.fr"
  },
  {
    id: 3,
    title: "Loft Sunset Prestige",
    city: "Marseille",
    country: "France",
    price: 220,
    guests: 5,
    bedrooms: 2,
    bathrooms: 2,
    rating: 4.8,
    image: "https://picsum.photos/seed/sunset-prestige/900/600",
    description: "Modern and premium loft with large living space.",
    amenities: ["Terrace", "Wi-Fi", "City view", "Coffee machine"],
    owner_name: "RoseBooking Collection",
    owner_email: "owner.marseille@rosebooking.fr"
  },
  {
    id: 4,
    title: "Domaine Riviera Chic",
    city: "Saint-Tropez",
    country: "France",
    price: 420,
    guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    rating: 5,
    image: "https://picsum.photos/seed/riviera-chic/900/600",
    description: "Spacious and refined estate for an exclusive experience.",
    amenities: ["Pool", "Garden", "Parking", "Wi-Fi", "Open view"],
    owner_name: "RoseBooking Collection",
    owner_email: "owner.riviera@rosebooking.fr"
  }
];

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function generateToken(user) {
  return jwt.sign(sanitizeUser(user), JWT_SECRET, { expiresIn: "7d" });
}

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function ownerRequired(req, res, next) {
  if (!req.user || req.user.role !== "owner") {
    return res.status(403).json({ message: "Owner role required" });
  }

  return next();
}

function databaseRequired(_req, res, next) {
  if (!databaseReady) {
    return res.status(503).json({
      message: "Database unavailable",
      databaseReady: false,
      error: databaseErrorMessage
    });
  }

  return next();
}

function mapProperty(row) {
  return {
    id: Number(row.id),
    title: row.title,
    city: row.city,
    country: row.country,
    price: Number(row.price),
    guests: Number(row.guests),
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
    rating: Number(row.rating),
    image: row.image,
    description: row.description,
    amenities: row.amenities || [],
    ownerName: row.owner_name,
    ownerEmail: row.owner_email
  };
}

function mapBooking(row) {
  return {
    id: Number(row.id),
    propertyId: Number(row.property_id),
    propertyTitle: row.property_title,
    city: row.city,
    country: row.country,
    image: row.image,
    pricePerNight: Number(row.price_per_night),
    checkin: row.checkin,
    checkout: row.checkout,
    travellers: Number(row.travellers),
    nights: Number(row.nights),
    total: Number(row.total),
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    createdAt: row.created_at
  };
}

async function bootstrapDatabase() {
  if (!pool) {
    throw new Error("DATABASE_URL is missing");
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('traveler', 'owner')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS properties (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      price NUMERIC(10,2) NOT NULL,
      guests INT NOT NULL,
      bedrooms INT NOT NULL,
      bathrooms INT NOT NULL,
      rating NUMERIC(3,2) NOT NULL DEFAULT 5,
      image TEXT NOT NULL,
      description TEXT NOT NULL,
      amenities TEXT[] NOT NULL DEFAULT '{}',
      owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      owner_name TEXT NOT NULL,
      owner_email TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id BIGSERIAL PRIMARY KEY,
      property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      property_title TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      image TEXT NOT NULL,
      price_per_night NUMERIC(10,2) NOT NULL,
      checkin DATE NOT NULL,
      checkout DATE NOT NULL,
      travellers INT NOT NULL,
      nights INT NOT NULL,
      total NUMERIC(10,2) NOT NULL,
      customer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      owner_email TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  const countResult = await pool.query("SELECT COUNT(*)::INT AS count FROM properties;");

  if (countResult.rows[0].count === 0) {
    for (const item of defaultProperties) {
      await pool.query(
        `
          INSERT INTO properties (
            id, title, city, country, price, guests, bedrooms, bathrooms,
            rating, image, description, amenities, owner_name, owner_email
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14
          );
        `,
        [
          item.id,
          item.title,
          item.city,
          item.country,
          item.price,
          item.guests,
          item.bedrooms,
          item.bathrooms,
          item.rating,
          item.image,
          item.description,
          item.amenities,
          item.owner_name,
          item.owner_email
        ]
      );
    }
  }
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "rosebooking-api",
    databaseReady,
    databaseError: databaseErrorMessage
  });
});

app.post("/api/auth/register", databaseRequired, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["traveler", "owner"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await pool.query("SELECT id FROM users WHERE email = $1;", [normalizedEmail]);

    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const inserted = await pool.query(
      `
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role;
      `,
      [String(name).trim(), normalizedEmail, passwordHash, role]
    );

    const user = inserted.rows[0];
    const token = generateToken(user);

    return res.status(201).json({ user: sanitizeUser(user), token });
  } catch (_error) {
    return res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/api/auth/login", databaseRequired, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const result = await pool.query(
      "SELECT id, name, email, role, password_hash FROM users WHERE email = $1;",
      [normalizedEmail]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    return res.json({ user: sanitizeUser(user), token });
  } catch (_error) {
    return res.status(500).json({ message: "Login failed" });
  }
});

app.get("/api/me", authRequired, databaseRequired, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, role FROM users WHERE id = $1;", [req.user.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user: sanitizeUser(result.rows[0]) });
  } catch (_error) {
    return res.status(500).json({ message: "Could not load profile" });
  }
});

app.get("/api/properties", databaseRequired, async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM properties ORDER BY id ASC;");
    return res.json(result.rows.map(mapProperty));
  } catch (_error) {
    return res.status(500).json({ message: "Could not load properties" });
  }
});

app.get("/api/properties/:id", databaseRequired, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM properties WHERE id = $1;", [Number(req.params.id)]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    return res.json(mapProperty(result.rows[0]));
  } catch (_error) {
    return res.status(500).json({ message: "Could not load property" });
  }
});

app.post("/api/properties", authRequired, databaseRequired, ownerRequired, async (req, res) => {
  try {
    const {
      title,
      city,
      country,
      price,
      guests,
      bedrooms,
      bathrooms,
      image,
      description,
      amenities
    } = req.body;

    if (!title || !city || !country || !price || !guests || !bedrooms || !bathrooms || !image || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const inserted = await pool.query(
      `
        INSERT INTO properties (
          title, city, country, price, guests, bedrooms, bathrooms,
          rating, image, description, amenities, owner_id, owner_name, owner_email
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          5, $8, $9, $10, $11, $12, $13
        )
        RETURNING *;
      `,
      [
        String(title).trim(),
        String(city).trim(),
        String(country).trim(),
        Number(price),
        Number(guests),
        Number(bedrooms),
        Number(bathrooms),
        String(image).trim(),
        String(description).trim(),
        Array.isArray(amenities) ? amenities : [],
        req.user.id,
        req.user.name,
        req.user.email
      ]
    );

    return res.status(201).json(mapProperty(inserted.rows[0]));
  } catch (_error) {
    return res.status(500).json({ message: "Could not create property" });
  }
});

app.delete("/api/properties/:id", authRequired, databaseRequired, ownerRequired, async (req, res) => {
  try {
    const propertyId = Number(req.params.id);

    const result = await pool.query(
      "DELETE FROM properties WHERE id = $1 AND owner_email = $2 RETURNING id;",
      [propertyId, req.user.email]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Property not found or forbidden" });
    }

    return res.json({ ok: true });
  } catch (_error) {
    return res.status(500).json({ message: "Could not delete property" });
  }
});

app.post("/api/bookings", authRequired, databaseRequired, async (req, res) => {
  try {
    const { propertyId, checkin, checkout, travellers } = req.body;

    if (!propertyId || !checkin || !checkout || !travellers) {
      return res.status(400).json({ message: "Missing booking data" });
    }

    const propertyResult = await pool.query("SELECT * FROM properties WHERE id = $1;", [Number(propertyId)]);

    if (propertyResult.rowCount === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    const property = propertyResult.rows[0];
    const start = new Date(checkin);
    const end = new Date(checkout);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return res.status(400).json({ message: "Checkout must be after checkin" });
    }

    const total = Number(property.price) * nights;

    const inserted = await pool.query(
      `
        INSERT INTO bookings (
          property_id, property_title, city, country, image, price_per_night,
          checkin, checkout, travellers, nights, total,
          customer_id, customer_name, customer_email,
          owner_name, owner_email
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14,
          $15, $16
        )
        RETURNING *;
      `,
      [
        property.id,
        property.title,
        property.city,
        property.country,
        property.image,
        Number(property.price),
        checkin,
        checkout,
        Number(travellers),
        nights,
        total,
        req.user.id,
        req.user.name,
        req.user.email,
        property.owner_name,
        property.owner_email
      ]
    );

    return res.status(201).json(mapBooking(inserted.rows[0]));
  } catch (_error) {
    return res.status(500).json({ message: "Could not create booking" });
  }
});

app.get("/api/bookings/mine", authRequired, databaseRequired, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM bookings WHERE customer_email = $1 ORDER BY created_at DESC;",
      [req.user.email]
    );
    return res.json(result.rows.map(mapBooking));
  } catch (_error) {
    return res.status(500).json({ message: "Could not load your bookings" });
  }
});

app.get("/api/bookings/incoming", authRequired, databaseRequired, ownerRequired, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM bookings WHERE owner_email = $1 ORDER BY created_at DESC;",
      [req.user.email]
    );
    return res.json(result.rows.map(mapBooking));
  } catch (_error) {
    return res.status(500).json({ message: "Could not load incoming bookings" });
  }
});

app.delete("/api/bookings/:id", authRequired, databaseRequired, async (req, res) => {
  try {
    const bookingId = Number(req.params.id);

    const result = await pool.query(
      "DELETE FROM bookings WHERE id = $1 AND customer_email = $2 RETURNING id;",
      [bookingId, req.user.email]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Booking not found or forbidden" });
    }

    return res.json({ ok: true });
  } catch (_error) {
    return res.status(500).json({ message: "Could not cancel booking" });
  }
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

bootstrapDatabase()
  .then(() => {
    databaseReady = true;
    databaseErrorMessage = null;
    console.log("Database initialized successfully");
  })
  .catch((error) => {
    databaseReady = false;
    databaseErrorMessage = error.message;
    console.error("Failed to initialize database", error);
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`RoseBooking API running on port ${PORT}`);
    });
  });
