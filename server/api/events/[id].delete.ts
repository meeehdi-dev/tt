import { and, eq } from "drizzle-orm";
import { useDb } from "~~/server/db";
import { event as eventTable } from "~~/server/db/schema/event";

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const db = useDb();
  const id = getRouterParam(event, "id")!;

  const [deleted] = await db
    .delete(eventTable)
    .where(and(eq(eventTable.id, id), eq(eventTable.userId, session.user.id)))
    .returning({ id: eventTable.id });

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: "Event not found" });
  }

  return { success: true };
});
