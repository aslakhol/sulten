import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { addDays } from "date-fns";
import { MembershipRole } from "@prisma/client";
import { env } from "../../../env.mjs";

export const householdRouter = createTRPCRouter({
  household: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const household = await ctx.db.household.findUnique({
        where: { id: input.id },
        include: { Members: true },
      });

      return { household };
    }),
  householdsForUser: protectedProcedure.query(async ({ ctx }) => {
    const households = await ctx.db.household.findMany({
      where: { Members: { some: { userId: ctx.auth.userId } } },
    });
    return { households };
  }),
  createHousehold: protectedProcedure
    .input(z.object({ name: z.string(), slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const household = await ctx.db.household.create({
        data: {
          name: input.name,
          slug: input.slug,
          Members: { create: { userId: ctx.auth.userId, role: "ADMIN" } },
        },
        include: { Members: true },
      });
      return { household };
    }),
  updateHousehold: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string(), slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, name, slug } = input;
      const household = await ctx.db.household.update({
        where: { id },
        data: { name, slug },
      });

      return { household };
    }),
  members: protectedProcedure
    .input(z.object({ householdId: z.string() }))
    .query(async ({ ctx, input }) => {
      const members = await ctx.db.membership.findMany({
        where: { householdId: input.householdId },
        include: { user: true },
      });
      return { members };
    }),
  updateMemberRole: protectedProcedure
    .input(
      z.object({
        memberId: z.number(),
        role: z.nativeEnum(MembershipRole),
        householdId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { memberId, role, householdId } = input;

      const memberships = await ctx.db.membership.findMany({
        where: { householdId },
      });

      const admins = memberships.filter((m) => m.role === "ADMIN");
      const isAdmin = !!admins.find((m) => m.id === memberId);
      if (isAdmin && role !== "ADMIN" && admins.length <= 1) {
        throw new Error("There must be at least one admin");
      }

      const member = await ctx.db.membership.update({
        where: { id: memberId },
        data: { role },
      });
      return { member };
    }),
  invites: protectedProcedure
    .input(z.object({ householdId: z.string() }))
    .query(async ({ ctx, input }) => {
      const invites = await ctx.db.invite.findMany({
        where: {
          householdId: input.householdId,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: { household: true },
      });

      return {
        invites: invites.map((invite) => ({
          ...invite,
          link: generateInviteLink(invite.household.slug, invite.id),
        })),
      };
    }),
  createInvite: protectedProcedure
    .input(
      z.object({ householdId: z.string(), duration: z.number().optional() }),
    )
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.invite.create({
        data: {
          householdId: input.householdId,
          expiresAt: addDays(new Date(), input.duration ?? 30),
        },
      });
      return { invite };
    }),
});

const generateInviteLink = (householdSlug: string, inviteId: string) => {
  return `${env.NEXT_PUBLIC_APP_URL}h/${householdSlug}/invite/${inviteId}`;
};
