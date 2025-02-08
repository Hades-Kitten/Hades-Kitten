import { readdir } from "node:fs/promises";
import type { Logger } from "../utils/logging";

interface Migration {
  name: string;
  exec: (logger: Logger, suppressLog?: boolean) => Promise<void>;
}

const migrations: Migration[] = [];

async function fetchMigrations(logger: Logger) {
  const files = await readdir("./src/db", { withFileTypes: true });
  for (const file of files) {
    if (
      file.isDirectory() ||
      !file.name.endsWith(".ts") ||
      file.name.startsWith("_")
    )
      continue;

    const module = await import(`./${file.name}`);
    if (module.default) migrations.push(module.default);
  }
}

async function runMigrations(logger: Logger) {
  logger.info("Running migrations...");
  try {
    await fetchMigrations(logger);

    for (const migration of migrations) {
      logger.info(`Running migration: ${migration.name}`);
      await migration.exec(logger, true);
    }

    logger.info("Migrations complete");
  } catch (error) {
    logger.error("Error running migrations:", error);
  }
}

export default runMigrations;
