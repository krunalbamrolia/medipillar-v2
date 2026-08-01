import { client } from "../client";
import { ENDPOINTS } from "../endpoints";

export async function deleteCampaignApi(id: string): Promise<void> {
  return client.delete<void>(ENDPOINTS.admin.campaignDetail(id));
}
