import { and, eq, ilike, ne } from "drizzle-orm";
import { z } from "zod";
import { useDb } from "~~/server/db";
import { project } from "~~/server/db/schema/event";

const schema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
  deletedAt: z.null().optional(),
});

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const db = useDb();
  const id = getRouterParam(event, "id")!;
  const body = await readValidatedBody(event, schema.parse);

  // Check for conflicts with other projects
  const [conflict] = await db
    .select()
    .from(project)
    .where(and(ilike(project.name, body.name), eq(project.userId, session.user.id), ne(project.id, id)));

  if (conflict) {
    if (conflict.deletedAt === null) {
      throw createError({
        statusCode: 400,
        statusMessage: "An active project with this name already exists.",
      });
    } else {
      throw createError({
        statusCode: 409,
        statusMessage: "Archived project exists",
        data: { archivedId: conflict.id },
      });
    }
  }

  const [updated] = await db
    .update(project)
    .set({
      name: body.name,
      color: body.color,
      deletedAt: body.deletedAt,
    })
    .where(and(eq(project.id, id), eq(project.userId, session.user.id)))
    .returning({
      id: project.id,
      name: project.name,
      color: project.color,
      deletedAt: project.deletedAt,
    });

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" });
  }

  return updated;
});
