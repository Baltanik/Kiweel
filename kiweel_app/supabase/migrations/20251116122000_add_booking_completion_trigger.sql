-- Function to award tokens when booking is completed
CREATE OR REPLACE FUNCTION award_tokens_on_booking_completion()
RETURNS TRIGGER AS $$
DECLARE
    token_amount INTEGER := 50; -- 50 tokens for completing a booking
    current_balance INTEGER;
    new_balance INTEGER;
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
        RAISE NOTICE 'Awarded % tokens to user % for completing booking %', 
                     token_amount, NEW.client_id, NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_award_tokens_on_booking_completion ON public.bookings;
CREATE TRIGGER trigger_award_tokens_on_booking_completion
    AFTER UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION award_tokens_on_booking_completion();

-- Also award tokens to professionals when they create posts
CREATE OR REPLACE FUNCTION award_tokens_on_post_creation()
RETURNS TRIGGER AS $$
DECLARE
    token_amount INTEGER := 10; -- 10 tokens for creating a post
    current_balance INTEGER;
    new_balance INTEGER;
    professional_user_id UUID;
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
        
        RAISE NOTICE 'Awarded % tokens to professional % for creating post %', 
                     token_amount, professional_user_id, NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for professional posts
DROP TRIGGER IF EXISTS trigger_award_tokens_on_post_creation ON public.professional_posts;
CREATE TRIGGER trigger_award_tokens_on_post_creation
    AFTER INSERT ON public.professional_posts
    FOR EACH ROW
    EXECUTE FUNCTION award_tokens_on_post_creation();
