ALTER TABLE public.influencers
  ADD COLUMN IF NOT EXISTS target_videos_month integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS agreement_start date,
  ADD COLUMN IF NOT EXISTS agreement_end date;