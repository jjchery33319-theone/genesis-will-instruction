import { adminProcedure, router } from "../_core/trpc";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";

async function d() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

export const usersRouter = router({
  /** List all registered users — admin only */
  list: adminProcedure.query(async () => {
    const db = await d();
    const rows = await db
      .select({
        id: users.id,
        openId: users.openId,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .orderBy(users.id);
    return rows;
  }),

  /** Promote or demote a user — any admin can do this */
  setRole: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await d();
      const [target] = await db
        .select({ openId: users.openId })
        .from(users)
        .where(eq(users.id, input.userId));
      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }
      // Prevent admins from demoting themselves
      if (target.openId === ctx.user.openId && input.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot demote yourself.",
        });
      }
      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));
      return { success: true };
    }),
});
