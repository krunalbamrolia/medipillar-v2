import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Medicine } from "../types";

export interface CreateMedicineParams {
  name: string;
  subname?: string | null;
  description?: string | null;
  companyId: string;
  categoryId: string;
}

export async function createMedicineApi(params: CreateMedicineParams): Promise<Medicine> {
  return client.post<Medicine>(ENDPOINTS.medicines.base, params);
}
