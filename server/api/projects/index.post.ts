import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
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
