import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
import { useDb } from "~~/server/db";
import { event as eventTable } from "~~/server/db/schema/event";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start: z.number().int().min(0),
  end: z.number().int().min(0),
  projectId: z.uuid(),
  description: z.string().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const db = useDb();
  const body = await readValidatedBody(event, schema.parse);

  const [created] = await db
    .insert(eventTable)
    .values({
      id: uuidv7(),
      date: body.date,
      start: body.start,
      end: body.end,
      projectId: body.projectId,
      description: body.description ?? null,
      userId: session.user.id,
    })
    .returning({
      id: eventTable.id,
      date: eventTable.date,
      start: eventTable.start,
      end: eventTable.end,
      projectId: eventTable.projectId,
      description: eventTable.description,
    });

  return created;
});
