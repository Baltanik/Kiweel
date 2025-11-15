import { supabase } from "@/integrations/supabase/client";
import { TOKEN_REWARDS } from "@/lib/constants";

export class TokenService {
  /**
   * Award tokens to a user
   */
  static async awardTokens(
    userId: string,
    amount: number,
    description: string
  ): Promise<number> {
    try {
      // Get current balance
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("kiweel_tokens")
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      const currentBalance = user?.kiweel_tokens || 0;
      const newBalance = currentBalance + amount;

      // Update user balance
      const { error: updateError } = await supabase
        .from("users")
        .update({ kiweel_tokens: newBalance })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Log transaction
      const { error: transactionError } = await supabase
        .from("tokens_transactions")
        .insert({
          user_id: userId,
          transaction_type: "earn",
          amount: amount,
          description: description,
          balance_before: currentBalance,
          balance_after: newBalance,
        });

      if (transactionError) {
        console.error("Failed to log token transaction:", transactionError);
        // Don't throw - balance was updated, just logging failed
      }

      return newBalance;
    } catch (error) {
      console.error("Error awarding tokens:", error);
      throw error;
    }
  }

  /**
   * Spend tokens from a user's balance
   */
  static async spendTokens(
    userId: string,
    amount: number,
    description: string
  ): Promise<number> {
    try {
      // Get current balance
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("kiweel_tokens")
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      const currentBalance = user?.kiweel_tokens || 0;

      if (currentBalance < amount) {
        throw new Error(`Insufficient tokens. Required: ${amount}, Available: ${currentBalance}`);
      }

      const newBalance = currentBalance - amount;

      // Update user balance
      const { error: updateError } = await supabase
        .from("users")
        .update({ kiweel_tokens: newBalance })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Log transaction
      const { error: transactionError } = await supabase
        .from("tokens_transactions")
        .insert({
          user_id: userId,
          transaction_type: "spend",
          amount: -amount,
          description: description,
          balance_before: currentBalance,
          balance_after: newBalance,
        });

      if (transactionError) {
        console.error("Failed to log token transaction:", transactionError);
        // Don't throw - balance was updated, just logging failed
      }

      return newBalance;
    } catch (error) {
      console.error("Error spending tokens:", error);
      throw error;
    }
  }

  /**
   * Get current token balance for a user
   */
  static async getBalance(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("kiweel_tokens")
        .eq("id", userId)
        .single();

      if (error) throw error;

      return data?.kiweel_tokens || 0;
    } catch (error) {
      console.error("Error getting token balance:", error);
      throw error;
    }
  }

  /**
   * Award tokens for a specific action (uses TOKEN_REWARDS from constants)
   */
  static async awardTokensForAction(
    userId: string,
    action: keyof typeof TOKEN_REWARDS
  ): Promise<number> {
    const amount = TOKEN_REWARDS[action];
    if (!amount || amount <= 0) {
      throw new Error(`Invalid action: ${action} or amount is 0`);
    }

    return this.awardTokens(userId, amount, `Reward for ${action}`);
  }

  /**
   * Get transaction history for a user
   */
  static async getTransactionHistory(
    userId: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("tokens_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error getting transaction history:", error);
      throw error;
    }
  }
}


