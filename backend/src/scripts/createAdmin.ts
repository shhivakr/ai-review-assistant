import dotenv from "dotenv";
import mongoose from "mongoose";
import { AdminModel } from "../models/Admin.js";
import { hashPassword } from "../utils/password.js";

dotenv.config();

async function createAdmin() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined");
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env");
  }

  await mongoose.connect(mongoUri);

  const normalizedEmail = email.trim().toLowerCase();

  const existingAdmin = await AdminModel.findOne({
    email: normalizedEmail,
  });

  if (existingAdmin) {
    console.log("Admin already exists.");
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await hashPassword(password);

  await AdminModel.create({
    email: normalizedEmail,
    passwordHash,
    role: "admin",
  });

  console.log(`Admin created: ${normalizedEmail}`);

  await mongoose.disconnect();
}

createAdmin().catch(async (error) => {
  console.error("Failed to create admin:", error);
  await mongoose.disconnect();
  process.exit(1);
});
