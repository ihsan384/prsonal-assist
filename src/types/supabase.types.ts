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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      budgets: {
        Row: {
          category: string
          color: string
          created_at: string | null
          deleted: boolean | null
          id: string
          last_synced_at: string | null
          monthly_limit: number
          spent: number | null
          sync_version: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          color: string
          created_at?: string | null
          deleted?: boolean | null
          id: string
          last_synced_at?: string | null
          monthly_limit: number
          spent?: number | null
          sync_version?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          color?: string
          created_at?: string | null
          deleted?: boolean | null
          id?: string
          last_synced_at?: string | null
          monthly_limit?: number
          spent?: number | null
          sync_version?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chapters: {
        Row: {
          completed_hours: number | null
          confidence_percentage: number | null
          created_at: string | null
          deleted: boolean | null
          difficulty: string | null
          estimated_hours: number | null
          id: string
          last_synced_at: string | null
          name: string
          notes: string | null
          priority: string | null
          revision_count: number | null
          status: string | null
          subject_id: string | null
          sync_version: number | null
          updated_at: string | null
        }
        Insert: {
          completed_hours?: number | null
          confidence_percentage?: number | null
          created_at?: string | null
          deleted?: boolean | null
          difficulty?: string | null
          estimated_hours?: number | null
          id: string
          last_synced_at?: string | null
          name: string
          notes?: string | null
          priority?: string | null
          revision_count?: number | null
          status?: string | null
          subject_id?: string | null
          sync_version?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_hours?: number | null
          confidence_percentage?: number | null
          created_at?: string | null
          deleted?: boolean | null
          difficulty?: string | null
          estimated_hours?: number | null
          id?: string
          last_synced_at?: string | null
          name?: string
          notes?: string | null
          priority?: string | null
          revision_count?: number | null
          status?: string | null
          subject_id?: string | null
          sync_version?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_motivation_categories: {
        Row: {
          color: string
          created_at: string | null
          deleted: boolean | null
          icon: string
          id: string
          last_synced_at: string | null
          name: string
          sync_version: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          deleted?: boolean | null
          icon?: string
          id: string
          last_synced_at?: string | null
          name: string
          sync_version?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          deleted?: boolean | null
          icon?: string
          id?: string
          last_synced_at?: string | null
          name?: string
          sync_version?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      formulas: {
        Row: {
          chapter_id: string | null
          created_at: string | null
          deleted: boolean | null
          description: string | null
          example: string | null
          expression: string
          id: string
          is_favourite: boolean | null
          last_synced_at: string | null
          name: string
          subject_id: string | null
          sync_version: number | null
          updated_at: string | null
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string | null
          deleted?: boolean | null
          description?: string | null
          example?: string | null
          expression: string
          id: string
          is_favourite?: boolean | null
          last_synced_at?: string | null
          name: string
          subject_id?: string | null
          sync_version?: number | null
          updated_at?: string | null
        }
        Update: {
          chapter_id?: string | null
          created_at?: string | null
          deleted?: boolean | null
          description?: string | null
          example?: string | null
          expression?: string
          id?: string
          is_favourite?: boolean | null
          last_synced_at?: string | null
          name?: string
          subject_id?: string | null
          sync_version?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formulas_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formulas_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          category: string
          color: string | null
          created_at: string | null
          current_value: number
          deleted: boolean | null
          description: string | null
          id: string
          last_synced_at: string | null
          milestones: Json | null
          status: string | null
          sync_version: number | null
          target_date: string | null
          target_value: number
          timeframe: string
          title: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          color?: string | null
          created_at?: string | null
          current_value?: number
          deleted?: boolean | null
          description?: string | null
          id: string
          last_synced_at?: string | null
          milestones?: Json | null
          status?: string | null
          sync_version?: number | null
          target_date?: string | null
          target_value: number
          timeframe: string
          title: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string | null
          current_value?: number
          deleted?: boolean | null
          description?: string | null
          id?: string
          last_synced_at?: string | null
          milestones?: Json | null
          status?: string | null
          sync_version?: number | null
          target_date?: string | null
          target_value?: number
          timeframe?: string
          title?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      habits: {
        Row: {
          category: string | null
          color: string
          completed_today: boolean | null
          completions: Json | null
          created_at: string | null
          deleted: boolean | null
          description: string | null
          frequency: string | null
          icon: string
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          longest_streak: number | null
          name: string
          streak: number | null
          sync_version: number | null
          target_days: number[] | null
          updated_at: string | null
          week_days: boolean[] | null
        }
        Insert: {
          category?: string | null
          color: string
          completed_today?: boolean | null
          completions?: Json | null
          created_at?: string | null
          deleted?: boolean | null
          description?: string | null
          frequency?: string | null
          icon: string
          id: string
          is_active?: boolean | null
          last_synced_at?: string | null
          longest_streak?: number | null
          name: string
          streak?: number | null
          sync_version?: number | null
          target_days?: number[] | null
          updated_at?: string | null
          week_days?: boolean[] | null
        }
        Update: {
          category?: string | null
          color?: string
          completed_today?: boolean | null
          completions?: Json | null
          created_at?: string | null
          deleted?: boolean | null
          description?: string | null
          frequency?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          longest_streak?: number | null
          name?: string
          streak?: number | null
          sync_version?: number | null
          target_days?: number[] | null
          updated_at?: string | null
          week_days?: boolean[] | null
        }
        Relationships: []
      }
      knowledge: {
        Row: {
          author: string | null
          color: string | null
          created_at: string | null
          current_page: number | null
          deleted: boolean | null
          id: string
          last_synced_at: string | null
          notes: string | null
          progress: number | null
          rating: number | null
          status: string
          sync_version: number | null
          tags: string[] | null
          title: string
          total_pages: number | null
          type: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          author?: string | null
          color?: string | null
          created_at?: string | null
          current_page?: number | null
          deleted?: boolean | null
          id: string
          last_synced_at?: string | null
          notes?: string | null
          progress?: number | null
          rating?: number | null
          status: string
          sync_version?: number | null
          tags?: string[] | null
          title: string
          total_pages?: number | null
          type: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          author?: string | null
          color?: string | null
          created_at?: string | null
          current_page?: number | null
          deleted?: boolean | null
          id?: string
          last_synced_at?: string | null
          notes?: string | null
          progress?: number | null
          rating?: number | null
          status?: string
          sync_version?: number | null
          tags?: string[] | null
          title?: string
          total_pages?: number | null
          type?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      meals: {
        Row: {
          created_at: string | null
          date: string
          deleted: boolean | null
          foods: Json | null
          id: string
          last_synced_at: string | null
          name: string
          notes: string | null
          sync_version: number | null
          time: string
          total_calories: number
          total_carbs: number | null
          total_fat: number | null
          total_protein: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          deleted?: boolean | null
          foods?: Json | null
          id: string
          last_synced_at?: string | null
          name: string
          notes?: string | null
          sync_version?: number | null
          time: string
          total_calories?: number
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          deleted?: boolean | null
          foods?: Json | null
          id?: string
          last_synced_at?: string | null
          name?: string
          notes?: string | null
          sync_version?: number | null
          time?: string
          total_calories?: number
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mistakes: {
        Row: {
          category: string | null
          chapter_id: string | null
          correct_solution: string | null
          created_at: string | null
          date_added: string
          deleted: boolean | null
          id: string
          last_synced_at: string | null
          question: string
          reason: string | null
          revision_status: string | null
          subject_id: string | null
          sync_version: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          chapter_id?: string | null
          correct_solution?: string | null
          created_at?: string | null
          date_added: string
          deleted?: boolean | null
          id: string
          last_synced_at?: string | null
          question: string
          reason?: string | null
          revision_status?: string | null
          subject_id?: string | null
          sync_version?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          chapter_id?: string | null
          correct_solution?: string | null
          created_at?: string | null
          date_added?: string
          deleted?: boolean | null
          id?: string
          last_synced_at?: string | null
          question?: string
          reason?: string | null
          revision_status?: string | null
          subject_id?: string | null
          sync_version?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mistakes_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mistakes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      motivation_collections: {
        Row: {
          color: string
          created_at: string | null
          deleted: boolean | null
          description: string | null
          icon: string
          id: string
          last_synced_at: string | null
          name: string
          sync_version: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          deleted?: boolean | null
          description?: string | null
          icon?: string
          id: string
          last_synced_at?: string | null
          name: string
          sync_version?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          deleted?: boolean | null
          description?: string | null
          icon?: string
          id?: string
          last_synced_at?: string | null
          name?: string
          sync_version?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      motivation_notes: {
        Row: {
          category: string
          collection_ids: string[] | null
          content: string
          created_at: string | null
          custom_category: string | null
          deleted: boolean | null
          id: string
          is_favourite: boolean
          is_pinned: boolean
          last_synced_at: string | null
          sync_version: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          collection_ids?: string[] | null
          content?: string
          created_at?: string | null
          custom_category?: string | null
          deleted?: boolean | null
          id: string
          is_favourite?: boolean
          is_pinned?: boolean
          last_synced_at?: string | null
          sync_version?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          collection_ids?: string[] | null
          content?: string
          created_at?: string | null
          custom_category?: string | null
          deleted?: boolean | null
          id?: string
          is_favourite?: boolean
          is_pinned?: boolean
          last_synced_at?: string | null
          sync_version?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      motivation_quotes: {
        Row: {
          author: string | null
          category: string
          collection_ids: string[] | null
          created_at: string | null
          custom_category: string | null
          deleted: boolean | null
          id: string
          is_favourite: boolean
          is_pinned: boolean
          last_synced_at: string | null
          quote: string
          source: string | null
          sync_version: number | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          category?: string
          collection_ids?: string[] | null
          created_at?: string | null
          custom_category?: string | null
          deleted?: boolean | null
          id: string
          is_favourite?: boolean
          is_pinned?: boolean
          last_synced_at?: string | null
          quote: string
          source?: string | null
          sync_version?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          category?: string
          collection_ids?: string[] | null
          created_at?: string | null
          custom_category?: string | null
          deleted?: boolean | null
          id?: string
          is_favourite?: boolean
          is_pinned?: boolean
          last_synced_at?: string | null
          quote?: string
          source?: string | null
          sync_version?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          created_at: string | null
          date_created: string
          date_updated: string
          deleted: boolean | null
          id: string
          is_pinned: boolean | null
          last_synced_at: string | null
          sync_version: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          date_created: string
          date_updated: string
          deleted?: boolean | null
          id: string
          is_pinned?: boolean | null
          last_synced_at?: string | null
          sync_version?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          date_created?: string
          date_updated?: string
          deleted?: boolean | null
          id?: string
          is_pinned?: boolean | null
          last_synced_at?: string | null
          sync_version?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      nutrition_goals: {
        Row: {
          calories: number
          carbs: number
          created_at: string | null
          deleted: boolean | null
          fat: number
          id: string
          last_synced_at: string | null
          protein: number
          sync_version: number | null
          updated_at: string | null
          water: number
        }
        Insert: {
          calories: number
          carbs: number
          created_at?: string | null
          deleted?: boolean | null
          fat: number
          id: string
          last_synced_at?: string | null
          protein: number
          sync_version?: number | null
          updated_at?: string | null
          water: number
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string | null
          deleted?: boolean | null
          fat?: number
          id?: string
          last_synced_at?: string | null
          protein?: number
          sync_version?: number | null
          updated_at?: string | null
          water?: number
        }
        Relationships: []
      }
      profile: {
        Row: {
          accent_color: string | null
          avatar: string | null
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          deleted: boolean | null
          id: string
          joined_at: string
          last_synced_at: string | null
          name: string | null
          sync_version: number | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          deleted?: boolean | null
          id: string
          joined_at: string
          last_synced_at?: string | null
          name?: string | null
          sync_version?: number | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          deleted?: boolean | null
          id?: string
          joined_at?: string
          last_synced_at?: string | null
          name?: string | null
          sync_version?: number | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          accuracy_percentage: number | null
          chapter_id: string | null
          correct: number | null
          created_at: string | null
          date: string
          deleted: boolean | null
          difficulty: string | null
          id: string
          last_synced_at: string | null
          notes: string | null
          questions_solved: number
          skipped: number | null
          subject_id: string | null
          sync_version: number | null
          time_taken_minutes: number | null
          updated_at: string | null
          wrong: number | null
        }
        Insert: {
          accuracy_percentage?: number | null
          chapter_id?: string | null
          correct?: number | null
          created_at?: string | null
          date: string
          deleted?: boolean | null
          difficulty?: string | null
          id: string
          last_synced_at?: string | null
          notes?: string | null
          questions_solved: number
          skipped?: number | null
          subject_id?: string | null
          sync_version?: number | null
          time_taken_minutes?: number | null
          updated_at?: string | null
          wrong?: number | null
        }
        Update: {
          accuracy_percentage?: number | null
          chapter_id?: string | null
          correct?: number | null
          created_at?: string | null
          date?: string
          deleted?: boolean | null
          difficulty?: string | null
          id?: string
          last_synced_at?: string | null
          notes?: string | null
          questions_solved?: number
          skipped?: number | null
          subject_id?: string | null
          sync_version?: number | null
          time_taken_minutes?: number | null
          updated_at?: string | null
          wrong?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      reflection_entries: {
        Row: {
          accomplishments: string | null
          content: string
          created_at: string | null
          date: string
          day_of_week: string
          deleted: boolean | null
          distractions: string | null
          end_time: string | null
          energy_level: number
          focus_level: number
          free_notes: string | null
          frustrations: string | null
          gratitude: string | null
          happiness: string | null
          how_was_today: string | null
          id: string
          iit_progress: string | null
          improvements: string | null
          is_favourite: boolean
          is_pinned: boolean
          last_synced_at: string | null
          learnings: string | null
          location: string | null
          mistakes: string | null
          mood: string
          productivity_rating: number
          sleep_quality: string | null
          start_time: string | null
          stress_level: number
          sync_version: number | null
          tags: string[] | null
          time_wasted: string | null
          tomorrow_priorities: string | null
          updated_at: string | null
          weather: string | null
          word_count: number
        }
        Insert: {
          accomplishments?: string | null
          content?: string
          created_at?: string | null
          date: string
          day_of_week: string
          deleted?: boolean | null
          distractions?: string | null
          end_time?: string | null
          energy_level?: number
          focus_level?: number
          free_notes?: string | null
          frustrations?: string | null
          gratitude?: string | null
          happiness?: string | null
          how_was_today?: string | null
          id: string
          iit_progress?: string | null
          improvements?: string | null
          is_favourite?: boolean
          is_pinned?: boolean
          last_synced_at?: string | null
          learnings?: string | null
          location?: string | null
          mistakes?: string | null
          mood?: string
          productivity_rating?: number
          sleep_quality?: string | null
          start_time?: string | null
          stress_level?: number
          sync_version?: number | null
          tags?: string[] | null
          time_wasted?: string | null
          tomorrow_priorities?: string | null
          updated_at?: string | null
          weather?: string | null
          word_count?: number
        }
        Update: {
          accomplishments?: string | null
          content?: string
          created_at?: string | null
          date?: string
          day_of_week?: string
          deleted?: boolean | null
          distractions?: string | null
          end_time?: string | null
          energy_level?: number
          focus_level?: number
          free_notes?: string | null
          frustrations?: string | null
          gratitude?: string | null
          happiness?: string | null
          how_was_today?: string | null
          id?: string
          iit_progress?: string | null
          improvements?: string | null
          is_favourite?: boolean
          is_pinned?: boolean
          last_synced_at?: string | null
          learnings?: string | null
          location?: string | null
          mistakes?: string | null
          mood?: string
          productivity_rating?: number
          sleep_quality?: string | null
          start_time?: string | null
          stress_level?: number
          sync_version?: number | null
          tags?: string[] | null
          time_wasted?: string | null
          tomorrow_priorities?: string | null
          updated_at?: string | null
          weather?: string | null
          word_count?: number
        }
        Relationships: []
      }
      revisions: {
        Row: {
          completed: boolean | null
          confidence: number | null
          created_at: string | null
          deleted: boolean | null
          id: string
          last_synced_at: string | null
          revision_number: number | null
          scheduled_date: string
          subject_name: string
          sync_version: number | null
          topic_id: string | null
          topic_name: string
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          confidence?: number | null
          created_at?: string | null
          deleted?: boolean | null
          id: string
          last_synced_at?: string | null
          revision_number?: number | null
          scheduled_date: string
          subject_name: string
          sync_version?: number | null
          topic_id?: string | null
          topic_name: string
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          confidence?: number | null
          created_at?: string | null
          deleted?: boolean | null
          id?: string
          last_synced_at?: string | null
          revision_number?: number | null
          scheduled_date?: string
          subject_name?: string
          sync_version?: number | null
          topic_id?: string | null
          topic_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revisions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          chapter_id: string | null
          correct_answers: number | null
          created_at: string | null
          date: string
          deleted: boolean | null
          duration_minutes: number
          end_time: string
          focus_rating: number | null
          id: string
          last_synced_at: string | null
          notes: string | null
          questions_solved: number | null
          start_time: string
          study_method: string
          subject_id: string | null
          sync_version: number | null
          topic_id: string | null
          understanding_percentage: number | null
          updated_at: string | null
          wrong_answers: number | null
        }
        Insert: {
          chapter_id?: string | null
          correct_answers?: number | null
          created_at?: string | null
          date: string
          deleted?: boolean | null
          duration_minutes: number
          end_time: string
          focus_rating?: number | null
          id: string
          last_synced_at?: string | null
          notes?: string | null
          questions_solved?: number | null
          start_time: string
          study_method: string
          subject_id?: string | null
          sync_version?: number | null
          topic_id?: string | null
          understanding_percentage?: number | null
          updated_at?: string | null
          wrong_answers?: number | null
        }
        Update: {
          chapter_id?: string | null
          correct_answers?: number | null
          created_at?: string | null
          date?: string
          deleted?: boolean | null
          duration_minutes?: number
          end_time?: string
          focus_rating?: number | null
          id?: string
          last_synced_at?: string | null
          notes?: string | null
          questions_solved?: number | null
          start_time?: string
          study_method?: string
          subject_id?: string | null
          sync_version?: number | null
          topic_id?: string | null
          understanding_percentage?: number | null
          updated_at?: string | null
          wrong_answers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          accent_color: string | null
          calorie_goal: number | null
          compact_mode: boolean | null
          created_at: string | null
          deleted: boolean | null
          haptic_enabled: boolean | null
          id: string
          language: string | null
          last_synced_at: string | null
          notifications: boolean | null
          sleep_goal: number | null
          sound_enabled: boolean | null
          study_timer_default: number | null
          sync_version: number | null
          theme: string | null
          time_format: string | null
          updated_at: string | null
          water_goal: number | null
          week_starts_on: number | null
        }
        Insert: {
          accent_color?: string | null
          calorie_goal?: number | null
          compact_mode?: boolean | null
          created_at?: string | null
          deleted?: boolean | null
          haptic_enabled?: boolean | null
          id: string
          language?: string | null
          last_synced_at?: string | null
          notifications?: boolean | null
          sleep_goal?: number | null
          sound_enabled?: boolean | null
          study_timer_default?: number | null
          sync_version?: number | null
          theme?: string | null
          time_format?: string | null
          updated_at?: string | null
          water_goal?: number | null
          week_starts_on?: number | null
        }
        Update: {
          accent_color?: string | null
          calorie_goal?: number | null
          compact_mode?: boolean | null
          created_at?: string | null
          deleted?: boolean | null
          haptic_enabled?: boolean | null
          id?: string
          language?: string | null
          last_synced_at?: string | null
          notifications?: boolean | null
          sleep_goal?: number | null
          sound_enabled?: boolean | null
          study_timer_default?: number | null
          sync_version?: number | null
          theme?: string | null
          time_format?: string | null
          updated_at?: string | null
          water_goal?: number | null
          week_starts_on?: number | null
        }
        Relationships: []
      }
      sleep_logs: {
        Row: {
          bed_time: string
          created_at: string | null
          date: string
          deleted: boolean | null
          duration_hours: number
          factors: string[] | null
          id: string
          last_synced_at: string | null
          notes: string | null
          quality: string
          rating: number | null
          sync_version: number | null
          updated_at: string | null
          wake_time: string
        }
        Insert: {
          bed_time: string
          created_at?: string | null
          date: string
          deleted?: boolean | null
          duration_hours: number
          factors?: string[] | null
          id: string
          last_synced_at?: string | null
          notes?: string | null
          quality: string
          rating?: number | null
          sync_version?: number | null
          updated_at?: string | null
          wake_time: string
        }
        Update: {
          bed_time?: string
          created_at?: string | null
          date?: string
          deleted?: boolean | null
          duration_hours?: number
          factors?: string[] | null
          id?: string
          last_synced_at?: string | null
          notes?: string | null
          quality?: string
          rating?: number | null
          sync_version?: number | null
          updated_at?: string | null
          wake_time?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          created_at: string | null
          deleted: boolean | null
          duration_minutes: number
          end_time: string | null
          id: string
          last_synced_at: string | null
          notes: string | null
          rating: number | null
          start_time: string
          subject: string
          sync_version: number | null
          tags: string[] | null
          topic: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted?: boolean | null
          duration_minutes: number
          end_time?: string | null
          id: string
          last_synced_at?: string | null
          notes?: string | null
          rating?: number | null
          start_time: string
          subject: string
          sync_version?: number | null
          tags?: string[] | null
          topic?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted?: boolean | null
          duration_minutes?: number
          end_time?: string | null
          id?: string
          last_synced_at?: string | null
          notes?: string | null
          rating?: number | null
          start_time?: string
          subject?: string
          sync_version?: number | null
          tags?: string[] | null
          topic?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subjects: {
        Row: {
          completed_chapters: number | null
          completion_percentage: number | null
          created_at: string | null
          deleted: boolean | null
          id: string
          last_synced_at: string | null
          name: string
          pending_chapters: number | null
          study_hours: number | null
          sync_version: number | null
          target_hours: number | null
          updated_at: string | null
        }
        Insert: {
          completed_chapters?: number | null
          completion_percentage?: number | null
          created_at?: string | null
          deleted?: boolean | null
          id: string
          last_synced_at?: string | null
          name: string
          pending_chapters?: number | null
          study_hours?: number | null
          sync_version?: number | null
          target_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_chapters?: number | null
          completion_percentage?: number | null
          created_at?: string | null
          deleted?: boolean | null
          id?: string
          last_synced_at?: string | null
          name?: string
          pending_chapters?: number | null
          study_hours?: number | null
          sync_version?: number | null
          target_hours?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string | null
          deleted: boolean | null
          description: string | null
          due_date: string | null
          due_time: string | null
          id: string
          last_synced_at: string | null
          priority: string | null
          status: string | null
          subtasks: Json | null
          sync_version: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          completed_at?: string | null
          created_at?: string | null
          deleted?: boolean | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          id: string
          last_synced_at?: string | null
          priority?: string | null
          status?: string | null
          subtasks?: Json | null
          sync_version?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string | null
          deleted?: boolean | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          last_synced_at?: string | null
          priority?: string | null
          status?: string | null
          subtasks?: Json | null
          sync_version?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tests: {
        Row: {
          correct_answers: number | null
          created_at: string | null
          date: string
          deleted: boolean | null
          duration_minutes: number | null
          id: string
          last_synced_at: string | null
          name: string
          notes: string | null
          score_percentage: number | null
          solved_questions: number
          subject_id: string | null
          sync_version: number | null
          total_questions: number
          updated_at: string | null
          wrong_answers: number | null
        }
        Insert: {
          correct_answers?: number | null
          created_at?: string | null
          date: string
          deleted?: boolean | null
          duration_minutes?: number | null
          id: string
          last_synced_at?: string | null
          name: string
          notes?: string | null
          score_percentage?: number | null
          solved_questions: number
          subject_id?: string | null
          sync_version?: number | null
          total_questions: number
          updated_at?: string | null
          wrong_answers?: number | null
        }
        Update: {
          correct_answers?: number | null
          created_at?: string | null
          date?: string
          deleted?: boolean | null
          duration_minutes?: number | null
          id?: string
          last_synced_at?: string | null
          name?: string
          notes?: string | null
          score_percentage?: number | null
          solved_questions?: number
          subject_id?: string | null
          sync_version?: number | null
          total_questions?: number
          updated_at?: string | null
          wrong_answers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tests_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          chapter_id: string | null
          created_at: string | null
          deleted: boolean | null
          id: string
          last_synced_at: string | null
          mistakes: number | null
          name: string
          notes: string | null
          questions_solved: number | null
          revision_needed: boolean | null
          status: string | null
          sync_version: number | null
          understanding_percentage: number | null
          updated_at: string | null
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string | null
          deleted?: boolean | null
          id: string
          last_synced_at?: string | null
          mistakes?: number | null
          name: string
          notes?: string | null
          questions_solved?: number | null
          revision_needed?: boolean | null
          status?: string | null
          sync_version?: number | null
          understanding_percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          chapter_id?: string | null
          created_at?: string | null
          deleted?: boolean | null
          id?: string
          last_synced_at?: string | null
          mistakes?: number | null
          name?: string
          notes?: string | null
          questions_solved?: number | null
          revision_needed?: boolean | null
          status?: string | null
          sync_version?: number | null
          understanding_percentage?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          deleted: boolean | null
          id: string
          last_synced_at: string | null
          notes: string | null
          sync_version: number | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date: string
          deleted?: boolean | null
          id: string
          last_synced_at?: string | null
          notes?: string | null
          sync_version?: number | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          deleted?: boolean | null
          id?: string
          last_synced_at?: string | null
          notes?: string | null
          sync_version?: number | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          amount_ml: number
          created_at: string | null
          deleted: boolean | null
          id: string
          last_synced_at: string | null
          sync_version: number | null
          updated_at: string | null
        }
        Insert: {
          amount_ml: number
          created_at?: string | null
          deleted?: boolean | null
          id: string
          last_synced_at?: string | null
          sync_version?: number | null
          updated_at?: string | null
        }
        Update: {
          amount_ml?: number
          created_at?: string | null
          deleted?: boolean | null
          id?: string
          last_synced_at?: string | null
          sync_version?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      workouts: {
        Row: {
          calories_burned: number | null
          created_at: string | null
          date: string
          deleted: boolean | null
          duration_minutes: number
          exercises: Json | null
          id: string
          last_synced_at: string | null
          name: string
          notes: string | null
          rating: number | null
          sync_version: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string | null
          date: string
          deleted?: boolean | null
          duration_minutes: number
          exercises?: Json | null
          id: string
          last_synced_at?: string | null
          name: string
          notes?: string | null
          rating?: number | null
          sync_version?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string | null
          date?: string
          deleted?: boolean | null
          duration_minutes?: number
          exercises?: Json | null
          id?: string
          last_synced_at?: string | null
          name?: string
          notes?: string | null
          rating?: number | null
          sync_version?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
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
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
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
    Enums: {},
  },
} as const
