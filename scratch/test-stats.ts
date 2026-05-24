import dotenv from "dotenv";
dotenv.config();
import { storage } from "../server/storage";

async function test() {
  try {
    console.log("Connecting database...");
    const connected = await storage.connectDatabase();
    console.log("Connected:", connected);

    console.log("Fetching getDashboardStats()...");
    const stats = await storage.getDashboardStats();
    console.log("Dashboard stats:", stats);

    console.log("Fetching first medicine row...");
    const { data, error } = await (storage as any).db().from("medicines").select("*").limit(1);
    if (error) throw error;
    console.log("Medicine keys:", Object.keys(data[0] || {}));
    console.log("Medicine row:", data[0]);

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    process.exit(0);
  }
}

test();
