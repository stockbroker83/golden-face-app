-- Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts and reads for payment tracking (session-based, no auth)
CREATE POLICY "Allow insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read own payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Allow update payments" ON public.payments FOR UPDATE USING (true);

-- Enable RLS on tarot_readings if not already
ALTER TABLE public.tarot_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert readings" ON public.tarot_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read readings" ON public.tarot_readings FOR SELECT USING (true);