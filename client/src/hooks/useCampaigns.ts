import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getActiveCampaignsApi,
  getCampaignsPaginatedApi,
  getCampaignByIdApi,
  createCampaignApi,
  updateCampaignApi,
  deleteCampaignApi,
  duplicateCampaignApi,
  type GetCampaignsPaginatedParams
} from "@/api/campaigns";
import type { Campaign } from "@/api/types";

export function useActiveCampaigns() {
  return useQuery<Campaign[]>({
    queryKey: ["/api/campaigns/active"],
    queryFn: getActiveCampaignsApi,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAdminCampaigns(params: GetCampaignsPaginatedParams) {
  return useQuery({
    queryKey: ["/api/admin/campaigns", params],
    queryFn: () => getCampaignsPaginatedApi(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminCampaign(id: string | null) {
  return useQuery({
    queryKey: ["/api/admin/campaigns", id],
    queryFn: () => id ? getCampaignByIdApi(id) : Promise.reject("No id provided"),
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCampaignApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/active"] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...params }: { id: string } & Parameters<typeof updateCampaignApi>[1]) => updateCampaignApi(id, params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/active"] });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCampaignApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/active"] });
    },
  });
}

export function useDuplicateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: duplicateCampaignApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/active"] });
    },
  });
}
