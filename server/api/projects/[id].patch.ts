import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { useDb } from "~~/server/db";
import { project } from "~~/server/db/schema/event";

const schema = z.object({
  name: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const db = useDb();
  const id = getRouterParam(event, "id")!;
  const body = await readValidatedBody(event, schema.parse);

  const [updated] = await db
    .update(project)
    .set({ name: body.name })
    .where(and(eq(project.id, id), eq(project.userId, session.user.id)))
    .returning({ id: project.id, name: project.name });

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" });
  }

  return updated;
});
