import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Medicine } from "../types";

export interface UpdateMedicineParams {
  name?: string;
  subname?: string | null;
  description?: string | null;
  companyId?: string;
  categoryId?: string;
}

export async function updateMedicineApi(id: string, params: UpdateMedicineParams): Promise<Medicine> {
  return client.patch<Medicine>(ENDPOINTS.medicines.detail(id), params);
}
