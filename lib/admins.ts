import "server-only";
import bcrypt from "bcryptjs";
import { Admin, type AdminDoc } from "@/models/Admin";
import { connectDB } from "./db";

// Compared against when the username does not exist, so a failed login takes
// the same time whether or not the account exists.
let dummyHash: Promise<string> | null = null;
const getDummyHash = () => (dummyHash ??= bcrypt.hash("not-a-real-password-placeholder", 12));

export async function verifyCredentials(username: string, password: string): Promise<AdminDoc | null> {
  await connectDB();
  const admin = await Admin.findOne({ username: username.trim().toLowerCase() }).lean();
  const ok = await bcrypt.compare(password, admin?.passwordHash ?? (await getDummyHash()));
  return admin && ok && admin.role === "admin" ? admin : null;
}

export async function recordLogin(adminId: string): Promise<void> {
  await Admin.updateOne({ _id: adminId }, { $set: { lastLoginAt: new Date() } });
}

/** Invalidates every session issued so far (logout). */
export async function revokeSessions(adminId: string): Promise<void> {
  await connectDB();
  await Admin.updateOne({ _id: adminId }, { $inc: { tokenVersion: 1 } });
}
