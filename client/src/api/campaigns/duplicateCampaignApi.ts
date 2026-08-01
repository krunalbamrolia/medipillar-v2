import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Campaign } from "../types";

export async function duplicateCampaignApi(id: string): Promise<Campaign> {
  return client.post<Campaign>(ENDPOINTS.admin.campaignDuplicate(id));
}
