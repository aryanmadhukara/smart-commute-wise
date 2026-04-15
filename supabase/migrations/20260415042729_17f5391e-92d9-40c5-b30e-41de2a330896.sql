
CREATE TABLE public.commute_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_time TIME NOT NULL,
  transport_mode TEXT NOT NULL CHECK (transport_mode IN ('two_wheeler', 'car', 'auto', 'bus')),
  day_of_week TEXT NOT NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_label TEXT NOT NULL CHECK (risk_label IN ('high', 'moderate', 'low')),
  delay_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.commute_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own commute history"
  ON public.commute_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own commute history"
  ON public.commute_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own commute history"
  ON public.commute_history FOR DELETE
  USING (auth.uid() = user_id);
