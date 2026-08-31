CREATE TABLE public.demand_flex_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code text NOT NULL,
  electricity_provider text,
  respondent_type text,
  resources text[] NOT NULL DEFAULT '{}'::text[],
  current_program_participation text,
  notification_interest text,
  additional_information text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.demand_flex_responses TO anon, authenticated;
GRANT ALL ON public.demand_flex_responses TO service_role;

ALTER TABLE public.demand_flex_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an anonymous response"
ON public.demand_flex_responses
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE TABLE public.demand_flex_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.demand_flex_contacts TO anon, authenticated;
GRANT ALL ON public.demand_flex_contacts TO service_role;

ALTER TABLE public.demand_flex_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact information"
ON public.demand_flex_contacts
FOR INSERT
TO anon, authenticated
WITH CHECK (true);