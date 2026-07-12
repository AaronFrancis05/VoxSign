import { db } from "../db/index.js";
import { profiles } from "../db/schema.js";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const seed = async () => {
    try {
        await db.delete(profiles);
        console.log("Existing profiles cleared.");
        console.log("Profiles table is ready. Users are managed by Neon Auth.");
        console.log("To create test users, register through the frontend sign-up flow.");
        process.exit(0);
    }
    catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};
seed();
//# sourceMappingURL=seed.js.map