ALTER TABLE public.trade_products
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'GHS';

UPDATE public.trade_products
SET currency = COALESCE(currency, 'GHS');
