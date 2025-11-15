-- Create shared_data_access_log table
CREATE TABLE IF NOT EXISTS public.shared_data_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shared_data_id TEXT NOT NULL REFERENCES public.shared_data(id) ON DELETE CASCADE,
    accessed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL DEFAULT 'view',
    accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shared_data_access_log_shared_data_id ON public.shared_data_access_log(shared_data_id);
CREATE INDEX IF NOT EXISTS idx_shared_data_access_log_accessed_by ON public.shared_data_access_log(accessed_by);
CREATE INDEX IF NOT EXISTS idx_shared_data_access_log_accessed_at ON public.shared_data_access_log(accessed_at);

-- Enable RLS
ALTER TABLE public.shared_data_access_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view access logs for shared data they have access to
CREATE POLICY "Users can view access logs for accessible shared data" ON public.shared_data_access_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.shared_data sd
            WHERE sd.id = shared_data_access_log.shared_data_id
            AND (
                sd.client_id = auth.uid() OR 
                sd.professional_id IN (
                    SELECT p.id FROM public.professionals p WHERE p.user_id = auth.uid()
                )
            )
        )
    );

-- Users can insert access logs for shared data they have access to
CREATE POLICY "Users can insert access logs for accessible shared data" ON public.shared_data_access_log
    FOR INSERT WITH CHECK (
        auth.uid() = accessed_by AND
        EXISTS (
            SELECT 1 FROM public.shared_data sd
            WHERE sd.id = shared_data_access_log.shared_data_id
            AND (
                sd.client_id = auth.uid() OR 
                sd.professional_id IN (
                    SELECT p.id FROM public.professionals p WHERE p.user_id = auth.uid()
                )
            )
        )
    );

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_data_access_log;
