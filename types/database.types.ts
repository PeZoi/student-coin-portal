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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_prompt_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_tokens: number
          prompt_code: string
          system_prompt: string
          temperature: number
          template_name: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number
          prompt_code: string
          system_prompt: string
          temperature?: number
          template_name: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number
          prompt_code?: string
          system_prompt?: string
          temperature?: number
          template_name?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompt_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_prompt_templates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_submission_errors: {
        Row: {
          correction_text: string
          created_at: string | null
          error_type: string
          explanation: string | null
          id: string
          line_number: number | null
          severity: string
          student_text: string
          submission_id: string
        }
        Insert: {
          correction_text: string
          created_at?: string | null
          error_type: string
          explanation?: string | null
          id?: string
          line_number?: number | null
          severity: string
          student_text: string
          submission_id: string
        }
        Update: {
          correction_text?: string
          created_at?: string | null
          error_type?: string
          explanation?: string | null
          id?: string
          line_number?: number | null
          severity?: string
          student_text?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_submission_errors_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "homework_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          description: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          role: string
          user_agent: string | null
          user_id: string | null
          user_name_snapshot: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          role: string
          user_agent?: string | null
          user_id?: string | null
          user_name_snapshot: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          role?: string
          user_agent?: string | null
          user_id?: string | null
          user_name_snapshot?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_logs: {
        Row: {
          auth_action: string
          created_at: string | null
          device_type: string | null
          failure_reason: string | null
          id: string
          ip_address: string
          location: string | null
          phone_zalo: string
          role: string
          status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          auth_action?: string
          created_at?: string | null
          device_type?: string | null
          failure_reason?: string | null
          id?: string
          ip_address: string
          location?: string | null
          phone_zalo: string
          role?: string
          status: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          auth_action?: string
          created_at?: string | null
          device_type?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: string
          location?: string | null
          phone_zalo?: string
          role?: string
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auth_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          class_name: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          is_deleted: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          class_name: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          is_deleted?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          class_name?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          is_deleted?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_classes_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_classes_deleted_by"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_classes_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string | null
          description: string
          id: string
          reference_id: string | null
          reference_type: string
          tx_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string | null
          description: string
          id?: string
          reference_id?: string | null
          reference_type: string
          tx_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          description?: string
          id?: string
          reference_id?: string | null
          reference_type?: string
          tx_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coin_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      homework_submissions: {
        Row: {
          ai_raw_response: Json | null
          ai_score: number | null
          ai_suggested_coins: number
          approval_status: string
          cancelled_at: string | null
          correct_count: number | null
          created_at: string | null
          final_coins: number | null
          id: string
          is_late: boolean
          is_media_purged: boolean
          media_purged_at: string | null
          mission_id: string | null
          proof_image_urls: Json
          readable: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          student_id: string
          submission_type: string
          teacher_feedback: string | null
          total_questions: number | null
          unreadable_reason: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ai_raw_response?: Json | null
          ai_score?: number | null
          ai_suggested_coins?: number
          approval_status?: string
          cancelled_at?: string | null
          correct_count?: number | null
          created_at?: string | null
          final_coins?: number | null
          id?: string
          is_late?: boolean
          is_media_purged?: boolean
          media_purged_at?: string | null
          mission_id?: string | null
          proof_image_urls: Json
          readable?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          student_id: string
          submission_type: string
          teacher_feedback?: string | null
          total_questions?: number | null
          unreadable_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ai_raw_response?: Json | null
          ai_score?: number | null
          ai_suggested_coins?: number
          approval_status?: string
          cancelled_at?: string | null
          correct_count?: number | null
          created_at?: string | null
          final_coins?: number | null
          id?: string
          is_late?: boolean
          is_media_purged?: boolean
          media_purged_at?: string | null
          mission_id?: string | null
          proof_image_urls?: Json
          readable?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          student_id?: string
          submission_type?: string
          teacher_feedback?: string | null
          total_questions?: number | null
          unreadable_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homework_submissions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_submissions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_classes: {
        Row: {
          class_id: string
          mission_id: string
        }
        Insert: {
          class_id: string
          mission_id: string
        }
        Update: {
          class_id?: string
          mission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_classes_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          created_at: string | null
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          description: string
          due_at: string
          icon_type: string | null
          id: string
          is_active: boolean | null
          is_deleted: boolean
          max_reward_coins: number
          min_reward_coins: number
          submission_type: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          description: string
          due_at: string
          icon_type?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean
          max_reward_coins: number
          min_reward_coins?: number
          submission_type?: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string
          due_at?: string
          icon_type?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean
          max_reward_coins?: number
          min_reward_coins?: number
          submission_type?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_class_reports: {
        Row: {
          class_id: string
          email_sent_status: string
          excel_file_url: string
          generated_at: string | null
          id: string
          month: number
          sent_to_email: string
          teacher_id: string
          updated_at: string | null
          updated_by: string | null
          year: number
        }
        Insert: {
          class_id: string
          email_sent_status?: string
          excel_file_url: string
          generated_at?: string | null
          id?: string
          month: number
          sent_to_email: string
          teacher_id: string
          updated_at?: string | null
          updated_by?: string | null
          year: number
        }
        Update: {
          class_id?: string
          email_sent_status?: string
          excel_file_url?: string
          generated_at?: string | null
          id?: string
          month?: number
          sent_to_email?: string
          teacher_id?: string
          updated_at?: string | null
          updated_by?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_class_reports_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_class_reports_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_class_reports_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_exchange_requests: {
        Row: {
          amount_vnd: number
          choice_type: string
          coins_to_exchange: number
          created_at: string | null
          hold_tx_id: string | null
          id: string
          month: number
          processed_at: string | null
          processed_by: string | null
          shopee_note: string | null
          shopee_product_url: string | null
          status: string
          student_id: string
          updated_at: string | null
          updated_by: string | null
          year: number
        }
        Insert: {
          amount_vnd?: number
          choice_type: string
          coins_to_exchange?: number
          created_at?: string | null
          hold_tx_id?: string | null
          id?: string
          month: number
          processed_at?: string | null
          processed_by?: string | null
          shopee_note?: string | null
          shopee_product_url?: string | null
          status?: string
          student_id: string
          updated_at?: string | null
          updated_by?: string | null
          year: number
        }
        Update: {
          amount_vnd?: number
          choice_type?: string
          coins_to_exchange?: number
          created_at?: string | null
          hold_tx_id?: string | null
          id?: string
          month?: number
          processed_at?: string | null
          processed_by?: string | null
          shopee_note?: string | null
          shopee_product_url?: string | null
          status?: string
          student_id?: string
          updated_at?: string | null
          updated_by?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_exchange_requests_hold_tx"
            columns: ["hold_tx_id"]
            isOneToOne: false
            referencedRelation: "coin_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_exchange_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_exchange_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_exchange_requests_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_leaderboard: {
        Row: {
          bonus_progress_coins: number
          bonus_rank_coins: number
          class_id: string
          closed_at: string | null
          growth_percent: number | null
          id: string
          is_rewarded: boolean | null
          month: number
          monthly_earned_coins: number
          rank_coins: number | null
          rank_progress: number | null
          student_id: string
          updated_at: string | null
          updated_by: string | null
          year: number
        }
        Insert: {
          bonus_progress_coins?: number
          bonus_rank_coins?: number
          class_id: string
          closed_at?: string | null
          growth_percent?: number | null
          id?: string
          is_rewarded?: boolean | null
          month: number
          monthly_earned_coins?: number
          rank_coins?: number | null
          rank_progress?: number | null
          student_id: string
          updated_at?: string | null
          updated_by?: string | null
          year: number
        }
        Update: {
          bonus_progress_coins?: number
          bonus_rank_coins?: number
          class_id?: string
          closed_at?: string | null
          growth_percent?: number | null
          id?: string
          is_rewarded?: boolean | null
          month?: number
          monthly_earned_coins?: number
          rank_coins?: number | null
          rank_progress?: number | null
          student_id?: string
          updated_at?: string | null
          updated_by?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_leaderboard_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_leaderboard_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_leaderboard_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          icon_type: string | null
          id: string
          is_read: boolean | null
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          icon_type?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          icon_type?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          is_public: boolean
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          is_public?: boolean
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          is_public?: boolean
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          class_id: string | null
          created_at: string | null
          current_coins: number
          deleted_at: string | null
          deleted_by: string | null
          email: string | null
          failed_login_attempts: number | null
          free_spins: number
          full_name: string
          has_completed_onboarding: boolean | null
          id: string
          is_active: boolean | null
          is_deleted: boolean
          locked_until: string | null
          password: string | null
          phone_zalo: string | null
          pin_number: string | null
          role: string
          total_earned_coins: number
          updated_at: string | null
          updated_by: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          class_id?: string | null
          created_at?: string | null
          current_coins?: number
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          failed_login_attempts?: number | null
          free_spins?: number
          full_name: string
          has_completed_onboarding?: boolean | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean
          locked_until?: string | null
          password?: string | null
          phone_zalo?: string | null
          pin_number?: string | null
          role?: string
          total_earned_coins?: number
          updated_at?: string | null
          updated_by?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          class_id?: string | null
          created_at?: string | null
          current_coins?: number
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          failed_login_attempts?: number | null
          free_spins?: number
          full_name?: string
          has_completed_onboarding?: boolean | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean
          locked_until?: string | null
          password?: string | null
          phone_zalo?: string | null
          pin_number?: string | null
          role?: string
          total_earned_coins?: number
          updated_at?: string | null
          updated_by?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wheel_prizes: {
        Row: {
          created_at: string | null
          created_by: string | null
          icon_name: string
          id: string
          is_active: boolean | null
          label: string
          prize_type: string
          probability_weight: number
          reward_coins: number
          reward_free_spins: number
          short_label: string
          slot_order: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          icon_name: string
          id: string
          is_active?: boolean | null
          label: string
          prize_type: string
          probability_weight?: number
          reward_coins?: number
          reward_free_spins?: number
          short_label: string
          slot_order: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          icon_name?: string
          id?: string
          is_active?: boolean | null
          label?: string
          prize_type?: string
          probability_weight?: number
          reward_coins?: number
          reward_free_spins?: number
          short_label?: string
          slot_order?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wheel_prizes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wheel_prizes_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wheel_spins: {
        Row: {
          created_at: string | null
          id: string
          is_free_spin: boolean | null
          prize_id: string
          prize_label_snapshot: string
          reward_coins: number
          reward_free_spins: number
          spin_cost: number
          student_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_free_spin?: boolean | null
          prize_id: string
          prize_label_snapshot: string
          reward_coins?: number
          reward_free_spins?: number
          spin_cost: number
          student_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_free_spin?: boolean | null
          prize_id?: string
          prize_label_snapshot?: string
          reward_coins?: number
          reward_free_spins?: number
          spin_cost?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wheel_spins_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "wheel_prizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wheel_spins_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      audit_user_coin_balance: {
        Args: { target_user_id: string }
        Returns: {
          current_coins: number
          discrepancy: number
          is_balanced: boolean
          ledger_sum: number
          user_id: string
        }[]
      }
      get_expired_submission_media: {
        Args: { retention_days?: number }
        Returns: {
          proof_image_urls: Json
          reviewed_at: string
          student_id: string
          submission_id: string
        }[]
      }
      mark_submission_media_purged: {
        Args: { submission_ids: string[] }
        Returns: number
      }
      purge_expired_audit_logs: {
        Args: { retention_days?: number }
        Returns: number
      }
      purge_expired_auth_logs: {
        Args: { retention_days?: number }
        Returns: number
      }
      purge_expired_notifications: {
        Args: { retention_days?: number }
        Returns: number
      }
      restore_class: { Args: { p_class_id: string }; Returns: boolean }
      restore_mission: { Args: { p_mission_id: string }; Returns: boolean }
      restore_user: { Args: { p_target_user_id: string }; Returns: boolean }
      safe_delete_class: {
        Args: { p_class_id: string; p_requesting_user_id: string }
        Returns: string
      }
      safe_delete_mission: {
        Args: { p_mission_id: string; p_requesting_user_id: string }
        Returns: string
      }
      safe_delete_user: {
        Args: { p_requesting_user_id: string; p_target_user_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
