import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Message } from "../types";

export interface CreateMessageParams {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}

export async function createMessageApi(params: CreateMessageParams): Promise<Message> {
  return client.post<Message>(ENDPOINTS.messages.base, params);
}
