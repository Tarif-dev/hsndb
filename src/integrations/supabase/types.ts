export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      formats: {
        Row: {
          fasta: string | null;
          CDS_sequence: string | null;
          hsn_id: string;
        };
        Insert: {
          fasta?: string | null;
          CDS_sequence?: string | null;
          hsn_id: string;
        };
        Update: {
          fasta?: string | null;
          CDS_sequence?: string | null;
          hsn_id?: string;
        };
        Relationships: [];
      };
      protein_disorder: {
        Row: {
          protein_id: string;
          length: number;
          scores: number[];
          summaries: Json | null;
          uniprot_id: string;
          gene_name: string | null;
          protein_name: string | null;
          sequence: string | null;
        };
        Insert: {
          protein_id: string;
          length: number;
          scores: number[];
          summaries?: Json | null;
          uniprot_id: string;
          gene_name?: string | null;
          protein_name?: string | null;
          sequence?: string | null;
        };
        Update: {
          protein_id?: string;
          length?: number;
          scores?: number[];
          summaries?: Json | null;
          uniprot_id?: string;
          gene_name?: string | null;
          protein_name?: string | null;
          sequence?: string | null;
        };
        Relationships: [];
      };
      proteins: {
        Row: {
          alphafold_id: string | null;
          cancer_causing: boolean | null;
          cancer_types: string[] | null;
          created_at: string;
          gene_name: string | null;
          hsn_id: string;
          id: string;
          positions_of_nitrosylation: string;
          protein_length: number | null;
          protein_name: string | null;
          total_sites: number | null;
          uniprot_id: string | null;
          updated_at: string;
        };
        Insert: {
          alphafold_id?: string | null;
          cancer_causing?: boolean | null;
          cancer_types?: string[] | null;
          created_at?: string;
          gene_name?: string | null;
          hsn_id: string;
          id?: string;
          positions_of_nitrosylation: string;
          protein_length?: number | null;
          protein_name?: string | null;
          total_sites?: number | null;
          uniprot_id?: string | null;
          updated_at?: string;
        };
        Update: {
          alphafold_id?: string | null;
          cancer_causing?: boolean | null;
          cancer_types?: string[] | null;
          created_at?: string;
          gene_name?: string | null;
          hsn_id?: string;
          id?: string;
          positions_of_nitrosylation?: string;
          protein_length?: number | null;
          protein_name?: string | null;
          total_sites?: number | null;
          uniprot_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      motif_based_proteins: {
        Row: {
          alphafold_id: string | null;
          created_at: string;
          gene_name: string | null;
          hsn_id: string;
          id: string;
          positions_of_nitrosylation: string;
          protein_length: number | null;
          protein_name: string | null;
          total_sites: number | null;
          uniprot_id: string | null;
          updated_at: string;
        };
        Insert: {
          alphafold_id?: string | null;
          created_at?: string;
          gene_name?: string | null;
          hsn_id: string;
          id?: string;
          positions_of_nitrosylation: string;
          protein_length?: number | null;
          protein_name?: string | null;
          total_sites?: number | null;
          uniprot_id?: string | null;
          updated_at?: string;
        };
        Update: {
          alphafold_id?: string | null;
          created_at?: string;
          gene_name?: string | null;
          hsn_id?: string;
          id?: string;
          positions_of_nitrosylation?: string;
          protein_length?: number | null;
          protein_name?: string | null;
          total_sites?: number | null;
          uniprot_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      cancer_cysteine_mutations: {
        Row: {
          id: number;
          gene_name: string;
          uniprot_id: string;
          position: number;
          reference_aa: string;
          altered_aa: string;
          cancer_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          gene_name: string;
          uniprot_id: string;
          position: number;
          reference_aa?: string;
          altered_aa: string;
          cancer_type: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          gene_name?: string;
          uniprot_id?: string;
          position?: number;
          reference_aa?: string;
          altered_aa?: string;
          cancer_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      protein_visualization_data: {
        Row: {
          id: number;
          uniprot_id: string;
          source: string;
          sequence: string | null;
          secondary_structure: string | null;
          length: number;
          cysteine_positions: number[] | null;
          sasa_values: Json | null;
          disorder_scores: Json | null;
          positions_of_nitrosylation: Json | null;
          protein_name: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          uniprot_id: string;
          source: string;
          sequence?: string | null;
          secondary_structure?: string | null;
          length: number;
          cysteine_positions?: number[] | null;
          sasa_values?: Json | null;
          disorder_scores?: Json | null;
          positions_of_nitrosylation?: Json | null;
          protein_name?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          uniprot_id?: string;
          source?: string;
          sequence?: string | null;
          secondary_structure?: string | null;
          length?: number;
          cysteine_positions?: number[] | null;
          sasa_values?: Json | null;
          disorder_scores?: Json | null;
          positions_of_nitrosylation?: Json | null;
          protein_name?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      scop: {
        Row: {
          id: number;
          uniprot_id: string | null;
          protein_type_name: string | null;
          class_name: string | null;
          fold_name: string | null;
          superfamily_name: string | null;
          superfamily_pdb: string | null;
          superfamily_pdb_region: string | null;
          family_name: string | null;
          family_pdb: string | null;
          family_pdb_region: string | null;
        };
        Insert: {
          id?: number;
          uniprot_id?: string | null;
          protein_type_name?: string | null;
          class_name?: string | null;
          fold_name?: string | null;
          superfamily_name?: string | null;
          superfamily_pdb?: string | null;
          superfamily_pdb_region?: string | null;
          family_name?: string | null;
          family_pdb?: string | null;
          family_pdb_region?: string | null;
        };
        Update: {
          id?: number;
          uniprot_id?: string | null;
          protein_type_name?: string | null;
          class_name?: string | null;
          fold_name?: string | null;
          superfamily_name?: string | null;
          superfamily_pdb?: string | null;
          superfamily_pdb_region?: string | null;
          family_name?: string | null;
          family_pdb?: string | null;
          family_pdb_region?: string | null;
        };
        Relationships: [];
      };
      cath: {
        Row: {
          id: number;
          uniprot_id: string | null;
          region: string | null;
          source: string | null;
          length: number | null;
          organism: string | null;
          class: string | null;
          CATH_Code: string | null;
          assignment: string | null;
          pLDDT: string | null;
          LUR: boolean | null;
          SSEs: number | null;
          perc_not_in_SS: number | null;
          packing: string | null;
          CATH_Class: string | null;
          CATH_Architecture: string | null;
          CATH_Topology: string | null;
          CATH_Superfamily: string | null;
        };
        Insert: {
          id?: number;
          uniprot_id?: string | null;
          region?: string | null;
          source?: string | null;
          length?: number | null;
          organism?: string | null;
          class?: string | null;
          CATH_Code?: string | null;
          assignment?: string | null;
          pLDDT?: string | null;
          LUR?: boolean | null;
          SSEs?: number | null;
          perc_not_in_SS?: number | null;
          packing?: string | null;
          CATH_Class?: string | null;
          CATH_Architecture?: string | null;
          CATH_Topology?: string | null;
          CATH_Superfamily?: string | null;
        };
        Update: {
          id?: number;
          uniprot_id?: string | null;
          region?: string | null;
          source?: string | null;
          length?: number | null;
          organism?: string | null;
          class?: string | null;
          CATH_Code?: string | null;
          assignment?: string | null;
          pLDDT?: string | null;
          LUR?: boolean | null;
          SSEs?: number | null;
          perc_not_in_SS?: number | null;
          packing?: string | null;
          CATH_Class?: string | null;
          CATH_Architecture?: string | null;
          CATH_Topology?: string | null;
          CATH_Superfamily?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
