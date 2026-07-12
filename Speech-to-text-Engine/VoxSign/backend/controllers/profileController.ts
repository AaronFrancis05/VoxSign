import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { profiles } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    const profile = result[0] || null;

    res.json({ profile });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const upsertProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { phoneNumber, gender, userType, avatar } = req.body;

    const existing = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

    if (existing.length > 0) {
      const updated = await db.update(profiles)
        .set({
          phoneNumber: phoneNumber ?? existing[0]!.phoneNumber,
          gender: gender ?? existing[0]!.gender,
          userType: userType ?? existing[0]!.userType,
          avatar: avatar ?? existing[0]!.avatar,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, userId))
        .returning();

      return res.json({ profile: updated[0] });
    }

    const created = await db.insert(profiles).values({
      userId,
      phoneNumber: phoneNumber || null,
      gender: gender || null,
      userType: userType || "student",
      avatar: avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${userId}`,
    }).returning();

    res.status(201).json({ profile: created[0] });
  } catch (error) {
    console.error("Upsert profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
