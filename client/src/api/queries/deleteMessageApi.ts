import { client } from "../client";
import { ENDPOINTS } from "../endpoints";

export async function deleteMessageApi(id: string): Promise<void> {
  return client.delete<void>(ENDPOINTS.messages.detail(id));
}
