import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Campaign } from "../types";

export async function getCampaignByIdApi(id: string): Promise<Campaign> {
  return client.get<Campaign>(ENDPOINTS.admin.campaignDetail(id));
}
