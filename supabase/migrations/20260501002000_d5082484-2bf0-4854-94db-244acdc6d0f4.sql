ALTER TABLE public.content_blocks 
ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';

CREATE INDEX IF NOT EXISTS idx_content_blocks_page_source 
ON public.content_blocks(page_id, source);