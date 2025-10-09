import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pg from "pg";
import passport from "passport";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Strategy } from "passport-local";
import bcrypt, { hash } from "bcrypt";
import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;
dotenv.config();

const app = express();
const PORT = process.env.PORT;
const saltRounds = 10;

// Session setup
const isProduction = process.env.NODE_ENV === "production";

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // needed for Neon
});
// db.connect();

const PgSession = connectPgSimple(session);

const initSessionTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
    console.log("✅ Session table ready");
  } catch (err) {
    console.error("Session table error:", err);
  }
};
initSessionTable();

app.set("trust proxy", 1); // CRITICAL: Trust first proxy (Render uses proxies)

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

app.use(
  session({
    store: new PgSession({
      pool: db,
      tableName: "session",
    }),
    name: "connect.sid", // explicit session name
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
      sameSite: isProduction ? "none" : "lax", // "none" for cross-site in production, "lax" for localhost
      secure: isProduction, // true for HTTPS in production, false for HTTP localhost
      httpOnly: false, // temporarily false for cross-origin debugging
      path: "/", // ensure cookie is sent for all paths
      domain: isProduction ? undefined : undefined,
    },
  })
);

// PostgreSQL setup
// const db = new pg.Client({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://college-plum-alpha.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean); // remove any undefined values

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware to track sessions
app.use((req, res, next) => {
  if (req.path !== "/test-users") {
    // avoid spam from test route
    const cookies = req.headers.cookie || "none";
    console.log(
      `📋 ${req.method} ${req.path} | Session: ${
        req.session?.id
      } | Auth: ${req.isAuthenticated()} | User: ${
        req.user?.username
      } | Cookies: ${cookies.substring(0, 80)}...`
    );
  }
  next();
});

// ✅ Passport Strategy (only username and password checked here)
passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE username = $1", [
        username,
      ]);

      if (result.rows.length === 0) {
        return cb(null, false, { message: "Invalid username" }); // ✅ username not found
      }

      const user = result.rows[0];
      // const hash = await bcrypt.hash(password, saltRounds);
      // console.log(hash)
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return cb(null, false, { message: "Invalid password" }); // ✅ password incorrect
      }

      return cb(null, user); // ✅ authenticated
    } catch (err) {
      return cb(err);
    }
  })
);

// Serialize/Deserialize
passport.serializeUser((user, cb) => {
  console.log("🔒 Serializing user:", user.username, "ID:", user.id);
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  console.log("🔓 Deserializing user:", user?.username, "ID:", user?.id);
  cb(null, user);
});

// Login Route
app.post("/login", (req, res, next) => {
  const roleFromClient = req.body.role;

  passport.authenticate("local", (err, user, info) => {
    console.log(info);
    if (err) {
      console.error("Login error:", err);
      return next(err);
    }

    if (!user) {
      console.log("Authentication failed:", info?.message);
      return res
        .status(401)
        .json({ message: info ? info.message : "Invalid credentials" });
    }

    // Role check manually
    if (user.role !== roleFromClient) {
      console.log("Role mismatch:", user.role, "vs", roleFromClient);
      return res.status(403).json({ message: "Role mismatch" });
    }

    req.login(user, (err) => {
      if (err) {
        console.error("❌ Login session error:", err);
        return next(err);
      }
      console.log(
        "✅ Login successful for:",
        user.username,
        "Role:",
        user.role,
        "Session ID:",
        req.session.id
      );
      console.log("🍪 Cookie settings:", req.session.cookie);
      console.log("🍪 Response headers Set-Cookie:", res.get("Set-Cookie"));
      return res.json({ message: "Login successful", user });
    });
  })(req, res, next);
});

//Is authenticated middlware
function isAuthenticated(req, res, next) {
  console.log(
    "🔐 isAuthenticated check:",
    req.isAuthenticated(),
    "Session:",
    req.session?.id,
    "User:",
    req.user?.username,
    "cookies:",
    req.headers.cookie?.substring(0, 50)
  );
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
}
// Is Role valid middleware
function requireRole(role) {
  return (req, res, next) => {
    console.log(
      `🔐 requireRole(${role}) check:`,
      req.isAuthenticated(),
      "User role:",
      req.user?.role,
      "matches:",
      req.user?.role === role
    );
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.role !== role) {
      return res
        .status(403)
        .json({ message: "Forbidden - Insufficient permissions" });
    }
    next();
  };
}

app.get("/auth/check", (req, res) => {
  console.log("🔍 Auth check:", {
    authenticated: req.isAuthenticated(),
    sessionID: req.session?.id,
    user: req.user?.username,
    cookies: req.headers.cookie,
  });

  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } else {
    res.status(401).json({ authenticated: false, message: "Unauthorized" });
  }
});

app.get("/reporter", requireRole("reporter"), (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ message: "Welcome to the reporter route!" });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

app.post("/report-issue", async (req, res) => {
  let user_id = req.user.id;
  console.log(req.user);
  const { floor, room, device, description, priority, createdAt } = req.body;
  try {
    let result = await db.query(
      "INSERT INTO issues(user_id,floor,room,device,description,priority,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [user_id, floor, room, device, description, priority, createdAt]
    );
    res.status(200).json({
      success: true,
      message: "Issue reported successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Message: "error submitting report" });
  }
});

app.get("/myissues", async (req, res) => {
  let user_id = req.user.id;
  try {
    let result = await db.query(
      `SELECT  floor, room, device, description, priority, status, 
  created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' AS created_at FROM issues WHERE user_id = $1 ORDER BY created_at`,
      [user_id]
    );
    console.log(result.rows);
    res.status(200).json({
      success: true,
      issues: result.rows,
    });
  } catch (err) {
    res.status(500).json({ Message: "error submitting report" });
  }
});

app.get("/dashboard", async (req, res) => {
  let user_id = req.user.id;
  let user_role = req.user.role;
  try {
    let result = await db.query(
      `SELECT id,floor, room, device, description, priority, status, 
    created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' AS created_at FROM issues WHERE user_id = $1 ORDER BY created_at DESC `,
      [user_id]
    );
    console.log(result.rows);
    res.status(200).json({
      success: true,
      issues: result.rows,
    });
  } catch (err) {
    res.status(500).json({ Message: "error submitting report" });
  }
});

app.get("/maintainer", requireRole("maintainer"), (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ message: "Welcome to the maintainer route!" });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Get all issues assigned to the logged-in maintainer
app.get("/issues", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
         issues.id,
         issues.user_id,
         users.role,
         users.username,
         issues.floor,
         issues.room,
         issues.device,
         issues.description,
         issues.priority,
         issues.status,
         issues.remark,
         issues.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' AS created_at
       FROM issues
       JOIN users ON issues.user_id = users.id
       ORDER BY issues.created_at DESC`
    );
    res.status(200).json({ success: true, issues: result.rows });
  } catch (err) {
    console.error("Error fetching issues:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all issues assigned to the currently logged-in maintainer
app.get("/assigned-issues", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, floor, room, device, description, priority, status, 
      created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' AS created_at 
       FROM issues 
       ORDER BY created_at DESC`
    );
    res.status(200).json({ issues: result.rows });
  } catch (err) {
    console.error("Error fetching assigned issues:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /issues/:id
app.patch("/issues/:id", async (req, res) => {
  const issueId = req.params.id;
  const { status, remark } = req.body;

  try {
    await db.query(
      `UPDATE issues 
       SET status = $1, remark = $2 
       WHERE id = $3`,
      [status, remark, issueId]
    );

    res
      .status(200)
      .json({ success: true, message: "Issue updated successfully" });
  } catch (err) {
    console.error("Error updating issue:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.get("/admin", requireRole("admin"), (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ message: "Welcome to the admin route!" });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});
// routes/admin.js
app.get("/stats", async (req, res) => {
  try {
    const totalUsers = await db.query("SELECT COUNT(*) FROM users");
    const totalIssues = await db.query("SELECT COUNT(*) FROM issues");
    const pending = await db.query(
      "SELECT COUNT(*) FROM issues WHERE status = 'pending'"
    );
    const resolved = await db.query(
      "SELECT COUNT(*) FROM issues WHERE status = 'resolved'"
    );

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalIssues: parseInt(totalIssues.rows[0].count),
      pendingIssues: parseInt(pending.rows[0].count),
      resolvedIssues: parseInt(resolved.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: "Error getting stats" });
  }
});

// routes/users.js
app.get("/users", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM users");
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
app.patch("/users/:id", async (req, res) => {
  const { username, email, role } = req.body;
  try {
    await db.query(
      "UPDATE users SET username = $1, email = $2, role = $3 WHERE id = $4",
      [username, email, role, req.params.id]
    );
    res.json({ message: "User updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});
app.post("/users", async (req, res) => {
  const { username, email, password, phone, role } = req.body;
  const hash = await bcrypt.hash(password, saltRounds);
  try {
    await db.query(
      "INSERT INTO users (username, email, password, phone,role) VALUES ($1, $2, $3, $4,$5)",
      [username, email, hash, phone, role]
    );
    res.json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add user" });
  }
});
app.delete("/users/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id = $1", [req.params.id]);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Route to fetch user profile
app.get("/profile", isAuthenticated, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      `SELECT username, email, phone, role,
       joined_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' AS joined_at FROM users WHERE id = $1`,
      [userId]
    );
    const user = result.rows[0];
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/contact", async (req, res) => {
  let { name, email, message } = req.body;
  try {
    // Insert the contact form data into the database
    const result = await db.query(
      "INSERT INTO contact (name, email, message) VALUES ($1, $2, $3) RETURNING *",
      [name, email, message]
    );

    // Send success response
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Error saving contact form:", error);

    res.status(500).json({ message: "Failed submitting form " });
  }
});
app.post("/logout", (req, res, next) => {
  console.log("👋 Logout request from:", req.user?.username);
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error(" Session destroy error:", err);
      }
      // res.clearCookie("connect.sid");
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: false,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      });
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
});

// Test route to check users
app.get("/test-users", async (req, res) => {
  try {
    const result = await db.query("SELECT username, role FROM users LIMIT 5");
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`🔍 Debug: Test users at http://localhost:${PORT}/test-users`);
  console.log(`🌍 Environment: ${isProduction ? "PRODUCTION" : "DEVELOPMENT"}`);
  console.log(`🍪 Secure cookies: ${isProduction}`);
  console.log(`🔒 SameSite: ${isProduction ? "none" : "lax"}`);
});
