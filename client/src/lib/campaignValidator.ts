import { z } from "zod";

export const campaignMediaSchema = z.object({
  type: z.enum(["image", "video", "youtube"]),
  url: z.string().url("Must be a valid URL"),
});

export const campaignFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  displayOrder: z.coerce.number().min(0).default(0),
  redirectType: z.enum(["default_products", "custom_link"]),
  redirectUrl: z.string().nullable().optional(),
  media: z.array(campaignMediaSchema).min(1, "At least one media item is required"),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
).refine(
  (data) => {
    if (data.redirectType === "custom_link") {
      return !!data.redirectUrl && data.redirectUrl.length > 0;
    }
    return true;
  },
  {
    message: "URL is required when Redirect Type is Custom Link",
    path: ["redirectUrl"],
  }
);

export type CampaignFormValues = z.infer<typeof campaignFormSchema>;
