import { and, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { useDb } from "~~/server/db";
import { event as eventTable } from "~~/server/db/schema/event";

const schema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const db = useDb();
  const query = await getValidatedQuery(event, schema.parse);

  const events = await db
    .select({
      id: eventTable.id,
      date: eventTable.date,
      start: eventTable.start,
      end: eventTable.end,
      projectId: eventTable.projectId,
      description: eventTable.description,
    })
    .from(eventTable)
    .where(
      and(
        eq(eventTable.userId, session.user.id),
        gte(eventTable.date, query.startDate),
        lte(eventTable.date, query.endDate),
      ),
    );

  return events;
});
