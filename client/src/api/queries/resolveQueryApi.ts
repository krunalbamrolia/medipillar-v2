import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Query } from "../types";

export async function resolveQueryApi(id: string, resolved: boolean): Promise<Query> {
  return client.patch<Query>(ENDPOINTS.admin.resolveQuery(id), { resolved });
}
