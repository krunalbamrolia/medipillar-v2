-- Create a function to check for overlapping campaign dates
CREATE OR REPLACE FUNCTION public.check_active_campaign_overlap()
RETURNS trigger AS $$
BEGIN
  -- A maximum of one campaign can be active at any given time.
  -- This checks if the new or updated campaign overlaps with any existing campaign.
  -- Overlap condition: start_date1 <= end_date2 AND end_date1 >= start_date2
  IF EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id != NEW.id
    AND (
      (NEW.start_date <= end_date AND NEW.end_date >= start_date)
    )
  ) THEN
    RAISE EXCEPTION 'Campaign dates overlap with another campaign. Only one campaign can be active at any given time.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS prevent_overlapping_campaigns_trigger ON public.campaigns;
CREATE TRIGGER prevent_overlapping_campaigns_trigger
BEFORE INSERT OR UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.check_active_campaign_overlap();
