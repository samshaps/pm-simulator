import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    "Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

const dbDir = path.resolve(process.cwd(), "pm-simulator-db");

const ticketFiles = [
  "tickets-self-serve.json",
  "tickets-enterprise.json",
  "tickets-tech-debt.json",
  "tickets-ux-infra.json",
  "tickets-sales-monetization-moonshot.json"
];

const readJson = async (filePath) => {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
};

const ticketRows = [];
for (const file of ticketFiles) {
  const tickets = await readJson(path.join(dbDir, file));
  if (!Array.isArray(tickets)) {
    throw new Error(`${file} must contain a JSON array.`);
  }
  for (const ticket of tickets) {
    ticketRows.push({
      id: ticket.id,
      category: ticket.category,
      payload: ticket
    });
  }
}

const eventsJson = await readJson(path.join(dbDir, "events-and-alerts.json"));
const eventRows = [];
for (const [group, entries] of Object.entries(eventsJson)) {
  if (!Array.isArray(entries)) continue;
  for (const entry of entries) {
    const id = entry.id || `${group}_${eventRows.length}`;
    eventRows.push({
      id,
      payload: { ...entry, group }
    });
  }
}

const narrativeJson = await readJson(
  path.join(dbDir, "narrative-templates.json")
);
const narrativeRows = [];
for (const [group, entries] of Object.entries(narrativeJson)) {
  if (!Array.isArray(entries)) continue;
  for (const entry of entries) {
    const id = entry.id || `${group}_${narrativeRows.length}`;
    narrativeRows.push({
      id,
      payload: { ...entry, group }
    });
  }
}

const upsertAll = async (table, rows) => {
  if (rows.length === 0) return;
  const { error } = await supabase.from(table).upsert(rows, {
    onConflict: "id"
  });
  if (error) {
    throw new Error(`${table} upsert failed: ${error.message}`);
  }
};

await upsertAll("ticket_templates", ticketRows);
await upsertAll("event_catalog", eventRows);
await upsertAll("narrative_templates", narrativeRows);

console.log(`Seed complete:`);
console.log(`- ticket_templates: ${ticketRows.length}`);
console.log(`- event_catalog: ${eventRows.length}`);
console.log(`- narrative_templates: ${narrativeRows.length}`);
