export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          client_id: string
          created_at: string
          id: string
          notes: string | null
          price: number
          pro_id: string
          service_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          client_id: string
          created_at?: string
          id?: string
          notes?: string | null
          price: number
          pro_id: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          client_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          price?: number
          pro_id?: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_plans: {
        Row: {
          client_id: string
          created_at: string | null
          description: string | null
          dietitian_id: string
          end_date: string | null
          id: string
          macros_target: Json | null
          meals_per_day: number | null
          name: string
          plan_json: Json | null
          shared_with_professionals: string[] | null
          start_date: string | null
          status: Database["public"]["Enums"]["plan_status"] | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          description?: string | null
          dietitian_id: string
          end_date?: string | null
          id?: string
          macros_target?: Json | null
          meals_per_day?: number | null
          name: string
          plan_json?: Json | null
          shared_with_professionals?: string[] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["plan_status"] | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          description?: string | null
          dietitian_id?: string
          end_date?: string | null
          id?: string
          macros_target?: Json | null
          meals_per_day?: number | null
          name?: string
          plan_json?: Json | null
          shared_with_professionals?: string[] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["plan_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diet_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diet_plans_dietitian_id_fkey"
            columns: ["dietitian_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string | null
          current_progress: number | null
          description: string | null
          expires_at: string | null
          id: string
          mission_type: Database["public"]["Enums"]["mission_type"]
          status: Database["public"]["Enums"]["mission_status"] | null
          target_value: number
          title: string
          token_reward: number | null
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          description?: string | null
          expires_at?: string | null
          id?: string
          mission_type: Database["public"]["Enums"]["mission_type"]
          status?: Database["public"]["Enums"]["mission_status"] | null
          target_value: number
          title: string
          token_reward?: number | null
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          description?: string | null
          expires_at?: string | null
          id?: string
          mission_type?: Database["public"]["Enums"]["mission_type"]
          status?: Database["public"]["Enums"]["mission_status"] | null
          target_value?: number
          title?: string
          token_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          pro_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          pro_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          pro_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_images_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      post_interactions: {
        Row: {
          comment_text: string | null
          created_at: string
          id: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          post_id: string
          user_id: string
        }
        Insert: {
          comment_text?: string | null
          created_at?: string
          id?: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          post_id: string
          user_id: string
        }
        Update: {
          comment_text?: string | null
          created_at?: string
          id?: string
          interaction_type?: Database["public"]["Enums"]["interaction_type"]
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "professional_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string
          engagement_score: number | null
          id: string
          image_url: string | null
          likes_count: number | null
          post_category: string | null
          post_type: Database["public"]["Enums"]["post_type"] | null
          pro_id: string
          updated_at: string
          visibility: string | null
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          engagement_score?: number | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          post_category?: string | null
          post_type?: Database["public"]["Enums"]["post_type"] | null
          pro_id: string
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          engagement_score?: number | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          post_category?: string | null
          post_type?: Database["public"]["Enums"]["post_type"] | null
          pro_id?: string
          updated_at?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_posts_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          address: string | null
          availability_json: Json | null
          bio: string | null
          cap: string
          certifications: string[] | null
          city: string
          created_at: string
          featured: boolean | null
          health_focus: string[] | null
          hero_image_url: string | null
          id: string
          latitude: number | null
          longitude: number | null
          profession_type: Database["public"]["Enums"]["professional_category"]
          rating: number | null
          specializations: string[] | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          title: string
          total_reviews: number | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          address?: string | null
          availability_json?: Json | null
          bio?: string | null
          cap: string
          certifications?: string[] | null
          city: string
          created_at?: string
          featured?: boolean | null
          health_focus?: string[] | null
          hero_image_url?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          profession_type: Database["public"]["Enums"]["professional_category"]
          rating?: number | null
          specializations?: string[] | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          title: string
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          address?: string | null
          availability_json?: Json | null
          bio?: string | null
          cap?: string
          certifications?: string[] | null
          city?: string
          created_at?: string
          featured?: boolean | null
          health_focus?: string[] | null
          hero_image_url?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          profession_type?: Database["public"]["Enums"]["professional_category"]
          rating?: number | null
          specializations?: string[] | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          title?: string
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_tracking: {
        Row: {
          client_id: string
          created_at: string | null
          energy_level: number | null
          id: string
          measurements: Json | null
          mood: string | null
          notes: string | null
          tracking_date: string
          weight: number | null
          workout_completed: boolean | null
          workout_type: string | null
          workout_duration: number | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          energy_level?: number | null
          id?: string
          measurements?: Json | null
          mood?: string | null
          notes?: string | null
          tracking_date?: string
          weight?: number | null
          workout_completed?: boolean | null
          workout_type?: string | null
          workout_duration?: number | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          energy_level?: number | null
          id?: string
          measurements?: Json | null
          mood?: string | null
          notes?: string | null
          tracking_date?: string
          weight?: number | null
          workout_completed?: boolean | null
          workout_type?: string | null
          workout_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_tracking_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string | null
          client_id: string
          comment: string | null
          created_at: string
          id: string
          pro_id: string
          rating: number
        }
        Insert: {
          booking_id?: string | null
          client_id: string
          comment?: string | null
          created_at?: string
          id?: string
          pro_id: string
          rating: number
        }
        Update: {
          booking_id?: string | null
          client_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          pro_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          name: string
          price: number
          pro_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          name: string
          price: number
          pro_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          name?: string
          price?: number
          pro_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_data: {
        Row: {
          access_log: Json | null
          category: string | null
          client_id: string
          content: Json
          created_at: string | null
          data_type: Database["public"]["Enums"]["shared_data_type"]
          file_urls: string[] | null
          id: string
          professional_id: string
          shared_at: string | null
          updated_at: string | null
          visibility:
            | Database["public"]["Enums"]["shared_data_visibility"]
            | null
        }
        Insert: {
          access_log?: Json | null
          category?: string | null
          client_id: string
          content?: Json
          created_at?: string | null
          data_type: Database["public"]["Enums"]["shared_data_type"]
          file_urls?: string[] | null
          id?: string
          professional_id: string
          shared_at?: string | null
          updated_at?: string | null
          visibility?:
            | Database["public"]["Enums"]["shared_data_visibility"]
            | null
        }
        Update: {
          access_log?: Json | null
          category?: string | null
          client_id?: string
          content?: Json
          created_at?: string | null
          data_type?: Database["public"]["Enums"]["shared_data_type"]
          file_urls?: string[] | null
          id?: string
          professional_id?: string
          shared_at?: string | null
          updated_at?: string | null
          visibility?:
            | Database["public"]["Enums"]["shared_data_visibility"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_data_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_data_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          pro_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          pro_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          pro_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: true
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens_transactions: {
        Row: {
          amount: number
          balance_after: number | null
          balance_before: number | null
          created_at: string | null
          description: string | null
          id: string
          related_entity_id: string | null
          transaction_type: Database["public"]["Enums"]["token_transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          related_entity_id?: string | null
          transaction_type: Database["public"]["Enums"]["token_transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          related_entity_id?: string | null
          transaction_type?: Database["public"]["Enums"]["token_transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tokens_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          allergies: string[] | null
          avatar_url: string | null
          created_at: string
          current_professionals: string[] | null
          email: string
          fitness_level: string | null
          health_goals: string[] | null
          id: string
          kiweel_tokens: number | null
          latitude: number | null
          location_updated_at: string | null
          longitude: number | null
          medical_conditions: string[] | null
          name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at: string
        }
        Insert: {
          allergies?: string[] | null
          avatar_url?: string | null
          created_at?: string
          current_professionals?: string[] | null
          email: string
          fitness_level?: string | null
          health_goals?: string[] | null
          id: string
          kiweel_tokens?: number | null
          latitude?: number | null
          location_updated_at?: string | null
          longitude?: number | null
          medical_conditions?: string[] | null
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
        }
        Update: {
          allergies?: string[] | null
          avatar_url?: string | null
          created_at?: string
          current_professionals?: string[] | null
          email?: string
          fitness_level?: string | null
          health_goals?: string[] | null
          id?: string
          kiweel_tokens?: number | null
          latitude?: number | null
          location_updated_at?: string | null
          longitude?: number | null
          medical_conditions?: string[] | null
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_data_access_log: {
        Row: {
          accessed_at: string | null
          id: string
          shared_data_id: string
          user_id: string
        }
        Insert: {
          accessed_at?: string | null
          id?: string
          shared_data_id: string
          user_id: string
        }
        Update: {
          accessed_at?: string | null
          id?: string
          shared_data_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_data_access_log_shared_data_id_fkey"
            columns: ["shared_data_id"]
            isOneToOne: false
            referencedRelation: "shared_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_data_access_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_meals: {
        Row: {
          calories: number | null
          carbs: number | null
          completed: boolean | null
          created_at: string | null
          date: string
          fat: number | null
          id: string
          ingredients: string[] | null
          instructions: string | null
          name: string
          protein: number | null
          time: string
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          completed?: boolean | null
          created_at?: string | null
          date: string
          fat?: number | null
          id?: string
          ingredients?: string[] | null
          instructions?: string | null
          name: string
          protein?: number | null
          time: string
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          completed?: boolean | null
          created_at?: string | null
          date?: string
          fat?: number | null
          id?: string
          ingredients?: string[] | null
          instructions?: string | null
          name?: string
          protein?: number | null
          time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_meals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          client_id: string
          created_at: string | null
          description: string | null
          duration_days: number | null
          end_date: string | null
          exercises_json: Json | null
          id: string
          name: string
          program_type:
            | Database["public"]["Enums"]["workout_program_type"]
            | null
          shared_with_professionals: string[] | null
          start_date: string | null
          status: Database["public"]["Enums"]["plan_status"] | null
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          end_date?: string | null
          exercises_json?: Json | null
          id?: string
          name: string
          program_type?:
            | Database["public"]["Enums"]["workout_program_type"]
            | null
          shared_with_professionals?: string[] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["plan_status"] | null
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          end_date?: string | null
          exercises_json?: Json | null
          id?: string
          name?: string
          program_type?:
            | Database["public"]["Enums"]["workout_program_type"]
            | null
          shared_with_professionals?: string[] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["plan_status"] | null
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plans_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "client" | "pro"
      booking_status: "pending" | "confirmed" | "completed" | "cancelled"
      interaction_type: "like" | "share" | "comment"
      mission_status: "active" | "completed" | "expired" | "failed"
      mission_type: "daily" | "weekly" | "milestone"
      plan_status: "draft" | "active" | "completed" | "archived"
      post_type: "work_showcase" | "tip" | "offer" | "announcement"
      professional_category:
        | "PT"
        | "Dietitian"
        | "Osteopath"
        | "Physiotherapist"
        | "Coach"
      shared_data_type:
        | "diet_plan"
        | "workout_plan"
        | "diagnosis"
        | "progress"
        | "prescription"
      shared_data_visibility: "private" | "shared"
      subscription_status: "active" | "cancelled" | "expired"
      subscription_tier: "free" | "pro" | "business" | "premium"
      token_transaction_type: "earn" | "spend" | "purchase" | "gift"
      user_role: "client" | "pro"
      workout_program_type: "strength" | "cardio" | "flexibility" | "mixed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DefaultSchema["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DefaultSchema["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "client", "pro"],
      booking_status: ["pending", "confirmed", "completed", "cancelled"],
      interaction_type: ["like", "share", "comment"],
      mission_status: ["active", "completed", "expired", "failed"],
      mission_type: ["daily", "weekly", "milestone"],
      plan_status: ["draft", "active", "completed", "archived"],
      post_type: ["work_showcase", "tip", "offer", "announcement"],
      professional_category: [
        "PT",
        "Dietitian",
        "Osteopath",
        "Physiotherapist",
        "Coach",
      ],
      shared_data_type: [
        "diet_plan",
        "workout_plan",
        "diagnosis",
        "progress",
        "prescription",
      ],
      shared_data_visibility: ["private", "shared"],
      subscription_status: ["active", "cancelled", "expired"],
      subscription_tier: ["free", "pro", "business", "premium"],
      token_transaction_type: ["earn", "spend", "purchase", "gift"],
      user_role: ["client", "pro"],
      workout_program_type: ["strength", "cardio", "flexibility", "mixed"],
    },
  },
} as const
