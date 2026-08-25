import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { createClient } from "@supabase/supabase-js";

// Load environment variables if present
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://genogaejxepnwaqmwoho.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY || "";

const dbPath = process.argv[2] || "./players.db";

if (!fs.existsSync(dbPath)) {
  console.error(`❌ File not found: ${dbPath}`);
  console.log("Usage: npx tsx scripts/migrate_players_to_supabase.ts <path-to-players.db>");
  process.exit(1);
}

if (!SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_SERVICE_ROLE or VITE_SUPABASE_ANON_KEY environment variable.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
  console.log(`📂 Reading SQLite database: ${dbPath}`);
  const db = new Database(dbPath, { readonly: true });

  const totalPlayers = db.prepare("SELECT count(*) as count FROM players").get() as { count: number };
  console.log(`📊 Found ${totalPlayers.count} players in SQLite database.`);

  if (totalPlayers.count === 0) {
    console.log("⚠️ No players to migrate.");
    return;
  }

  const batchSize = 200;
  let offset = 0;
  let successCount = 0;

  while (offset < totalPlayers.count) {
    const rows = db.prepare(`SELECT * FROM players LIMIT ? OFFSET ?`).all(batchSize, offset) as any[];

    const formattedRows = rows.map((p) => ({
      serial: String(p.serial),
      name: p.name || "Player",
      avatar: p.avatar || "",
      gender: p.gender || "boy",
      selected_frame: p.selected_frame || "",
      fingerprint: p.fingerprint || "",
      email: p.email || "",
      secret_token: p.secret_token || "",
      xp: Number(p.xp) || 0,
      wins: Number(p.wins) || 0,
      likes: Number(p.likes) || 0,
      tokens: Number(p.tokens) || 100,
      keys: Number(p.keys) || 5,
      streak: Number(p.streak) || 0,
      created_at: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("players").upsert(formattedRows, {
      onConflict: "serial",
      ignoreDuplicates: false,
    });

    if (error) {
      console.error(`❌ Error migrating batch at offset ${offset}:`, error.message);
    } else {
      successCount += rows.length;
      console.log(`✅ Migrated ${successCount} / ${totalPlayers.count} players (${Math.round((successCount / totalPlayers.count) * 100)}%)`);
    }

    offset += batchSize;
  }

  console.log(`\n🎉 Migration completed successfully! Total migrated: ${successCount} players.`);
}

migrate().catch(console.error);
