import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
import { and, eq, ilike } from "drizzle-orm";
import { useDb } from "~~/server/db";
import { project } from "~~/server/db/schema/event";

const schema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const db = useDb();
  const body = await readValidatedBody(event, schema.parse);

  const [existing] = await db
    .select()
    .from(project)
    .where(and(ilike(project.name, body.name), eq(project.userId, session.user.id)));

  if (existing) {
    if (existing.deletedAt === null) {
      throw createError({
        statusCode: 400,
        statusMessage: "An active project with this name already exists.",
      });
    } else {
      throw createError({
        statusCode: 409,
        statusMessage: "Archived project exists",
        data: { archivedId: existing.id },
      });
    }
  }

  const [created] = await db
    .insert(project)
    .values({
      id: uuidv7(),
      name: body.name,
      color: body.color,
      userId: session.user.id,
    })
    .returning({
      id: project.id,
      name: project.name,
      color: project.color,
      deletedAt: project.deletedAt,
    });

  return created;
});
