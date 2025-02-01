import { z } from "zod";

const envSchema = z.object({
  TOKEN: z.string(),
  CLIENT_ID: z.string(),
  DATE_CHANNEL_ID: z.string(),
});

function validateEnv() {
  const env = envSchema.safeParse(process.env);
  if (env.success) return env.data;

  console.error("invalid environment variables");
  for (const err of env.error.errors)
    console.log(`  ${err.message}: ${err.path}`);
  process.exit(1);
}

export default { data: validateEnv() };
