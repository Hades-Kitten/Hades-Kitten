import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Collection } from "discord.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function crawlDirectory<T>(
  directory: string,
  processFile: (fileUrl: string) => Promise<T | undefined>,
): Promise<T[]> {
  const items: T[] = [];

  async function crawl(dir: string) {
    const files = await readdir(dir, { withFileTypes: true });
    for (const file of files) {
      const path = join(dir, file.name);
      if (file.isDirectory()) {
        await crawl(path);
      } else if (file.name.endsWith(".ts")) {
        const fileUrl = `file://${path}`;
        const item = await processFile(fileUrl);
        if (item) items.push(item);
      }
    }
  }

  await crawl(directory);
  return items;
}

export function getHandlerPath(handlerName: string): string {
  return join(__dirname, "..", handlerName);
}
