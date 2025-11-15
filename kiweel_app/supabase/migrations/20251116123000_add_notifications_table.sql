-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'booking', 'plan', 'token', 'mission')),
    read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = false;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- System can insert notifications for any user
CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info',
    p_action_url TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        action_url,
        metadata
    ) VALUES (
        p_user_id,
        p_title,
        p_message,
        p_type,
        p_action_url,
        p_metadata
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update booking completion trigger to include notifications
CREATE OR REPLACE FUNCTION award_tokens_on_booking_completion()
RETURNS TRIGGER AS $$
DECLARE
    token_amount INTEGER := 50; -- 50 tokens for completing a booking
    current_balance INTEGER;
    new_balance INTEGER;
    notification_id UUID;
BEGIN
    -- Check if booking status changed to 'completed'
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
        -- Get current token balance
        SELECT kiweel_tokens INTO current_balance 
        FROM public.users 
        WHERE id = NEW.client_id;
        
        -- Calculate new balance
        new_balance := COALESCE(current_balance, 0) + token_amount;
        
        -- Update user's token balance
        UPDATE public.users 
        SET kiweel_tokens = new_balance,
            updated_at = NOW()
        WHERE id = NEW.client_id;
        
        -- Log the transaction
        INSERT INTO public.tokens_transactions (
            user_id,
            amount,
            transaction_type,
            description,
            created_at
        ) VALUES (
            NEW.client_id,
            token_amount,
            'earn',
            'Appuntamento completato',
            NOW()
        );
        
        -- Create notification
        SELECT create_notification(
            NEW.client_id,
            'Appuntamento Completato',
            'Hai completato il tuo appuntamento e guadagnato ' || token_amount || ' tokens! 🎉',
            'success',
            '/missions',
            jsonb_build_object('tokens_awarded', token_amount, 'booking_id', NEW.id)
        ) INTO notification_id;
        
        -- Log progress tracking entry
        INSERT INTO public.progress_tracking (
            user_id,
            notes,
            created_at
        ) VALUES (
            NEW.client_id,
            'Appuntamento completato con successo',
            NOW()
        );
        
        -- Log the token award
        RAISE NOTICE 'Awarded % tokens to user % for completing booking %, notification %', 
                     token_amount, NEW.client_id, NEW.id, notification_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update post creation trigger to include notifications
CREATE OR REPLACE FUNCTION award_tokens_on_post_creation()
RETURNS TRIGGER AS $$
DECLARE
    token_amount INTEGER := 10; -- 10 tokens for creating a post
    current_balance INTEGER;
    new_balance INTEGER;
    professional_user_id UUID;
    notification_id UUID;
BEGIN
    -- Get professional's user_id
    SELECT user_id INTO professional_user_id
    FROM public.professionals
    WHERE id = NEW.pro_id;
    
    IF professional_user_id IS NOT NULL THEN
        -- Get current token balance
        SELECT kiweel_tokens INTO current_balance 
        FROM public.users 
        WHERE id = professional_user_id;
        
        -- Calculate new balance
        new_balance := COALESCE(current_balance, 0) + token_amount;
        
        -- Update user's token balance
        UPDATE public.users 
        SET kiweel_tokens = new_balance,
            updated_at = NOW()
        WHERE id = professional_user_id;
        
        -- Log the transaction
        INSERT INTO public.tokens_transactions (
            user_id,
            amount,
            transaction_type,
            description,
            created_at
        ) VALUES (
            professional_user_id,
            token_amount,
            'earn',
            'Post pubblicato',
            NOW()
        );
        
        -- Create notification
        SELECT create_notification(
            professional_user_id,
            'Post Pubblicato',
            'Hai pubblicato un nuovo post e guadagnato ' || token_amount || ' tokens!',
            'success',
            '/feed',
            jsonb_build_object('tokens_awarded', token_amount, 'post_id', NEW.id)
        ) INTO notification_id;
        
        RAISE NOTICE 'Awarded % tokens to professional % for creating post %, notification %', 
                     token_amount, professional_user_id, NEW.id, notification_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
