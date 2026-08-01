import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Campaign } from "../types";

export async function getActiveCampaignsApi(): Promise<Campaign[]> {
  return client.get<Campaign[]>(ENDPOINTS.campaigns.active);
}
