import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";

async function loadProjectId() {
  if (process.env.SUPABASE_PROJECT_ID) {
    return process.env.SUPABASE_PROJECT_ID;
  }

  for (const fileName of [".env.local", ".env"]) {
    try {
      const contents = await readFile(resolve(fileName), "utf8");
      const line = contents
        .split(/\r?\n/)
        .find((entry) => entry.startsWith("SUPABASE_PROJECT_ID="));

      if (line) {
        return line.slice("SUPABASE_PROJECT_ID=".length).trim();
      }
    } catch {
      // Ignore missing env files and keep looking.
    }
  }

  return null;
}

const projectId = await loadProjectId();

if (!projectId) {
  console.error(
    "SUPABASE_PROJECT_ID is required to generate types. Add it to your shell env, .env.local, or .env."
  );
  process.exit(1);
}

const outputPath = resolve("types", "supabase.ts");
await mkdir(dirname(outputPath), { recursive: true });

const child =
  process.platform === "win32"
    ? spawn(
        "cmd.exe",
        [
          "/c",
          "npx",
          "supabase",
          "gen",
          "types",
          "typescript",
          "--project-id",
          projectId,
          "--schema",
          "public"
        ],
        {
          env: process.env
        }
      )
    : spawn(
        "npx",
        [
          "supabase",
          "gen",
          "types",
          "typescript",
          "--project-id",
          projectId,
          "--schema",
          "public"
        ],
        {
          env: process.env
        }
      );

let stdout = "";
let stderr = "";

child.stdout.on("data", (chunk) => {
  stdout += chunk.toString();
});

child.stderr.on("data", (chunk) => {
  stderr += chunk.toString();
});

const exitCode = await new Promise((resolveExitCode, reject) => {
  child.on("error", reject);
  child.on("close", resolveExitCode);
});

if (exitCode !== 0) {
  if (stderr.trim()) {
    console.error(stderr.trim());
  }
  process.exit(exitCode ?? 1);
}

await writeFile(outputPath, stdout, "utf8");
console.log(`Supabase types written to ${outputPath}`);
