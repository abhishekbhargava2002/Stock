import bcrypt from "bcryptjs";
import { connectDB } from "./config/db";
import { User } from "./modules/users/user.model";

async function seed() {
  await connectDB();
  const passwordHash = await bcrypt.hash("Admin@123", 10);
  await User.findOneAndUpdate(
    { email: "admin@trivoxatech.com" },
    { name: "Trivoxa Admin", email: "admin@trivoxatech.com", phone: "9999999999", passwordHash, userType: "trivoxa", status: "active" },
    { upsert: true, new: true }
  );
  console.log("✅ Seeded Trivoxa admin: admin@trivoxatech.com / Admin@123");
  process.exit(0);
}

seed();
