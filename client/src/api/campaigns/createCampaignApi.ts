import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Campaign } from "../types";

export type CreateCampaignParams = Omit<Campaign, "id" | "createdAt" | "updatedAt" | "status">;

export async function createCampaignApi(params: CreateCampaignParams): Promise<Campaign> {
  return client.post<Campaign>(ENDPOINTS.admin.campaigns, params);
}
