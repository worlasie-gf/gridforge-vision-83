CREATE TABLE public.demand_flex_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  electricity_provider TEXT,
  participant_type TEXT NOT NULL CHECK (participant_type IN ('has_flexibility_today','interested_in_future')),
  customer_type TEXT,
  asset_types TEXT[] NOT NULL DEFAULT '{}',
  existing_program_participation TEXT CHECK (existing_program_participation IN ('yes','no','not_sure')),
  notify_preference TEXT CHECK (notify_preference IN ('yes','no')),
  additional_information TEXT,
  consent_to_contact BOOLEAN NOT NULL DEFAULT false
);

GRANT INSERT ON public.demand_flex_submissions TO anon;
GRANT INSERT ON public.demand_flex_submissions TO authenticated;
GRANT ALL ON public.demand_flex_submissions TO service_role;

ALTER TABLE public.demand_flex_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit the demand flexibility form"
ON public.demand_flex_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);