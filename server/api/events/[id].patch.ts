import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { useDb } from "~~/server/db";
import { event as eventTable } from "~~/server/db/schema/event";

const schema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  start: z.number().int().min(0).optional(),
  end: z.number().int().min(0).optional(),
  projectId: z.string().uuid().optional(),
  description: z.string().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const db = useDb();
  const id = getRouterParam(event, "id")!;
  const body = await readValidatedBody(event, schema.parse);

  const updates: Record<string, unknown> = {};
  if (body.date !== undefined) updates.date = body.date;
  if (body.start !== undefined) updates.start = body.start;
  if (body.end !== undefined) updates.end = body.end;
  if (body.projectId !== undefined) updates.projectId = body.projectId;
  if (body.description !== undefined) updates.description = body.description;

  if (Object.keys(updates).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No fields to update",
    });
  }

  const [updated] = await db
    .update(eventTable)
    .set(updates)
    .where(and(eq(eventTable.id, id), eq(eventTable.userId, session.user.id)))
    .returning({
      id: eventTable.id,
      date: eventTable.date,
      start: eventTable.start,
      end: eventTable.end,
      projectId: eventTable.projectId,
      description: eventTable.description,
    });

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: "Event not found" });
  }

  return updated;
});
