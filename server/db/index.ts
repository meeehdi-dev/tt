import type { H3Event } from "h3";

import { drizzle } from "drizzle-orm/node-postgres";

let db: ReturnType<typeof drizzle> | undefined = undefined;

export const useDb = (event: H3Event) => {
  if (!db) {
    const config = useRuntimeConfig(event);
    db = drizzle(config.database.url);
  }

  return db;
};

export const getDb = () => {
  return drizzle(process.env.DATABASE_URL!);
};
