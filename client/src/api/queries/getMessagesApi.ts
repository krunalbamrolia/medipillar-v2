import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Message } from "../types";

export async function getMessagesApi(): Promise<Message[]> {
  return client.get<Message[]>(ENDPOINTS.messages.base);
}
