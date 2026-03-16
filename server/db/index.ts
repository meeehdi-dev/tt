import { drizzle } from "drizzle-orm/node-postgres";

let db: ReturnType<typeof drizzle> | undefined = undefined;

export const getDb = () => {
  return drizzle(process.env.DATABASE_URL!);
};

export const useDb = () => {
  if (!db) {
    db = getDb();
  }

  return db;
};
