import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../schema/User.js";
import connectDB from "../lib/db.js";
const seed = async () => {
    try {
        await connectDB();
        // Clear existing users
        await User.deleteMany();
        console.log("Existing users cleared.");
        // Hash passwords
        const hashedPassword = await bcrypt.hash("password123", 12);
        // Create users
        const users = [
            {
                fullName: "Sandra Naikambo",
                email: "sandra@voxsign.com",
                password: hashedPassword,
                phoneNumber: "0771234567",
                gender: "female",
                userType: "student",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sandra",
            },
            {
                fullName: "John Doe",
                email: "john@voxsign.com",
                password: hashedPassword,
                phoneNumber: "0771234568",
                gender: "male",
                userType: "student",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
            },
            {
                fullName: "Sarah Smith",
                email: "sarah@voxsign.com",
                password: hashedPassword,
                phoneNumber: "0771234569",
                gender: "female",
                userType: "educator",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            },
        ];
        await User.insertMany(users);
        console.log("Database seeded successfully with users!");
        process.exit(0);
    }
    catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};
seed();
//# sourceMappingURL=seed.js.map