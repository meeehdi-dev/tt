import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import drizzleConfig from "~~/drizzle.config";

export default defineNitroPlugin(async () => {
  const db = drizzle(process.env.DATABASE_URL!);

  try {
    await migrate(db, { migrationsFolder: drizzleConfig.out! });
    console.info("migrations applied successfully");
  } catch (error) {
    console.error("failed to apply migrations", error);
  } finally {
    await db.$client.end();
  }
});
