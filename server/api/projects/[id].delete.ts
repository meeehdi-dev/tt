import { and, count, eq } from "drizzle-orm";
import { useDb } from "~~/server/db";
import { event, project } from "~~/server/db/schema/event";

export default defineEventHandler(async (eventRequest) => {
  const session = await requireAuth(eventRequest);
  const db = useDb();
  const id = getRouterParam(eventRequest, "id")!;

  // 1. Check if the project has linked events
  const [eventsCountResult] = await db
    .select({ count: count() })
    .from(event)
    .where(and(eq(event.projectId, id), eq(event.userId, session.user.id)));

  const hasEvents = (eventsCountResult?.count ?? 0) > 0;

  if (hasEvents) {
    // Soft delete
    const [updated] = await db
      .update(project)
      .set({ deletedAt: new Date() })
      .where(and(eq(project.id, id), eq(project.userId, session.user.id)))
      .returning({ id: project.id });

    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: "Project not found" });
    }
    return { success: true, softDeleted: true };
  } else {
    // Hard delete
    const [deleted] = await db
      .delete(project)
      .where(and(eq(project.id, id), eq(project.userId, session.user.id)))
      .returning({ id: project.id });

    if (!deleted) {
      throw createError({ statusCode: 404, statusMessage: "Project not found" });
    }
    return { success: true, softDeleted: false };
  }
});
