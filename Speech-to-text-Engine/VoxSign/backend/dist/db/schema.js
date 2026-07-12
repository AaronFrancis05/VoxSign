import { pgTable, text, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const userTypeEnum = pgEnum("user_type", ["student", "educator"]);
export const profiles = pgTable("profiles", {
    userId: text("user_id").primaryKey(),
    phoneNumber: varchar("phone_number", { length: 32 }),
    gender: genderEnum("gender"),
    userType: userTypeEnum("user_type").notNull().default("student"),
    avatar: text("avatar"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
//# sourceMappingURL=schema.js.map