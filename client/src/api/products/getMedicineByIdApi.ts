import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Medicine } from "../types";

export async function getMedicineByIdApi(id: string): Promise<Medicine> {
  return client.get<Medicine>(ENDPOINTS.medicines.detail(id));
}
