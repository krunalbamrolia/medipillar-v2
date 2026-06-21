import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { User } from "../types";

export async function getMeApi(): Promise<User | null> {
  try {
    return await client.get<User>(ENDPOINTS.auth.me);
  } catch (error) {
    return null;
  }
}
