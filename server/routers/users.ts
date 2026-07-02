import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ENV } from "../_core/env";

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

  /** Promote or demote a user — only the project owner can do this */
  setRole: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only the project owner (the Manus account that created the project) can change roles
      if (ctx.user.openId !== ENV.ownerOpenId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the project owner can change user roles.",
        });
      }
      const db = await d();
      // Prevent the owner from demoting themselves
      const [target] = await db
        .select({ openId: users.openId })
        .from(users)
        .where(eq(users.id, input.userId));
      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }
      if (target.openId === ENV.ownerOpenId && input.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot demote the project owner.",
        });
      }
      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));
      return { success: true };
    }),
});
