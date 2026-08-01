import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Campaign } from "../types";

export type UpdateCampaignParams = Partial<Omit<Campaign, "id" | "createdAt" | "updatedAt" | "status">>;

export async function updateCampaignApi(id: string, params: UpdateCampaignParams): Promise<Campaign> {
  return client.patch<Campaign>(ENDPOINTS.admin.campaignDetail(id), params);
}
