import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ArrowLeft, Megaphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CampaignMediaUploader } from "@/components/CampaignMediaUploader";
import { campaignFormSchema, type CampaignFormValues } from "@/lib/campaignValidator";
import { useAdminCampaign, useCreateCampaign, useUpdateCampaign } from "@/hooks/useCampaigns";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function CampaignForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check if edit mode
  const [matchEdit, paramsEdit] = useRoute("/admin/campaigns/:id/edit");
  const isEdit = matchEdit;
  const campaignId = paramsEdit?.id ?? null;

  const { data: campaign, isLoading: isLoadingCampaign } = useAdminCampaign(campaignId);
  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week
      displayOrder: 0,
      redirectType: "default_products",
      redirectUrl: "",
      media: [],
    },
  });

  useEffect(() => {
    if (isEdit && campaign) {
      form.reset({
        title: campaign.title,
        description: campaign.description ?? "",
        startDate: new Date(campaign.startDate),
        endDate: new Date(campaign.endDate),
        displayOrder: campaign.displayOrder,
        redirectType: campaign.redirectType,
        redirectUrl: campaign.redirectUrl ?? "",
        media: campaign.media,
      });
    }
  }, [isEdit, campaign, form]);

  const onSubmit = async (data: CampaignFormValues) => {
    try {
      if (isEdit && campaignId) {
        await updateMutation.mutateAsync({
          id: campaignId,
          ...data,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
        });
        toast({ title: "Success", description: "Campaign updated successfully" });
      } else {
        await createMutation.mutateAsync({
          ...data,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
        });
        toast({ title: "Success", description: "Campaign created successfully" });
      }
      setLocation("/admin/campaigns");
    } catch (error) {
      toast({ 
        title: "Error", 
        description: `Failed to ${isEdit ? "update" : "create"} campaign`,
        variant: "destructive"
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoadingCampaign) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/campaigns")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AdminPageHeader
          title={isEdit ? "Edit Campaign" : "Create Campaign"}
          description={isEdit ? "Update existing campaign details" : "Create a new promotional campaign"}
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter campaign title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Optional campaign description" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date & Time *</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date & Time *</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order (Priority)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media Content *</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="media"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CampaignMediaUploader 
                        value={field.value} 
                        onChange={field.onChange} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Redirection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="redirectType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action on Click</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an action" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="default_products">Navigate to Products Page</SelectItem>
                        <SelectItem value="custom_link">Custom Link</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("redirectType") === "custom_link" && (
                <FormField
                  control={form.control}
                  name="redirectUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Redirect URL *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. https://example.com/promo or /company/123" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/admin/campaigns")}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update Campaign" : "Create Campaign"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
