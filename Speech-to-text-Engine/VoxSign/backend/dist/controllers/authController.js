import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../schema/User.js";
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
export const register = async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, gender, userType } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        // Create new user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            phoneNumber,
            gender,
            userType,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`,
        });
        await newUser.save();
        // Generate token
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "1h" });
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                userType: newUser.userType,
                avatar: newUser.avatar,
            },
        });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // Generate token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                userType: user.userType,
                avatar: user.avatar,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
//# sourceMappingURL=authController.js.map