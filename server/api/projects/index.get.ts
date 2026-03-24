import { eq } from "drizzle-orm";
import { useDb } from "~~/server/db";
import { project } from "~~/server/db/schema/event";

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const db = useDb();

  const projects = await db
    .select({ id: project.id, name: project.name, color: project.color, deletedAt: project.deletedAt })
    .from(project)
    .where(eq(project.userId, session.user.id));

  return projects;
});
