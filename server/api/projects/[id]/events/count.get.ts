import { and, count, eq } from "drizzle-orm";
import { useDb } from "~~/server/db";
import { event as eventTable } from "~~/server/db/schema/event";

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const db = useDb();
  const id = getRouterParam(event, "id")!;

  const [result] = await db
    .select({ count: count() })
    .from(eventTable)
    .where(and(eq(eventTable.projectId, id), eq(eventTable.userId, session.user.id)));

  return { count: result?.count ?? 0 };
});
