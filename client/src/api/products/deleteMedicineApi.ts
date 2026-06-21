import { client } from "../client";
import { ENDPOINTS } from "../endpoints";

export async function deleteMedicineApi(id: string): Promise<void> {
  return client.delete<void>(ENDPOINTS.medicines.detail(id));
}
