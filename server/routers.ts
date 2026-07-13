import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { SignJWT } from "jose";
import * as db from "./db";
import { willInstructionsRouter } from "./routers/willInstructions";
import { lpaRouter } from "./routers/lpa";
import { mattersRouter } from "./routers/matters";
import { usersRouter } from "./routers/users";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    login: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
          throw new Error("ADMIN_PASSWORD environment variable is not configured on the server.");
        }
        if (input.password !== adminPassword) {
          throw new Error("Incorrect password.");
        }

        // Upsert a local admin user
        const openId = "local-admin";
        await db.upsertUser({
          openId,
          name: "Admin",
          role: "admin",
          loginMethod: "password",
          lastSignedIn: new Date(),
        });

        // Sign a JWT session token
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "genesis-default-secret");
        const token = await new SignJWT({ openId, appId: "local", name: "Admin" })
          .setProtectedHeader({ alg: "HS256", typ: "JWT" })
          .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
          .sign(secret);

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return { success: true } as const;
      }),
  }),
  will: willInstructionsRouter,
  lpa: lpaRouter,
  matters: mattersRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
