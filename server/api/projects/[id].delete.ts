import { and, eq } from "drizzle-orm";
import { useDb } from "~~/server/db";
import { project } from "~~/server/db/schema/event";

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const db = useDb();
  const id = getRouterParam(event, "id")!;

  const [deleted] = await db
    .delete(project)
    .where(and(eq(project.id, id), eq(project.userId, session.user.id)))
    .returning({ id: project.id });

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" });
  }

  return { success: true };
});
