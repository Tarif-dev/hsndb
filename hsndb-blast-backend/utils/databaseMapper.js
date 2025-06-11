// Database integration for BLAST results
const { createClient } = require("@supabase/supabase-js");
const config = require("../config");

class BlastDatabaseMapper {
  constructor() {
    // Initialize Supabase client
    this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

    // Cache for FASTA to HSN ID mapping
    this.fastaToHsnCache = new Map();
    this.hsnToProteinCache = new Map();
  }

  async initializeMappings() {
    try {
      console.log("🔄 Initializing FASTA to protein mappings...");
      // Get all FASTA sequences and their HSN IDs from formats table
      const { data: formats, error: formatsError } = await this.supabase
        .from("formats")
        .select("hsn_id, fasta");

      if (formatsError) {
        throw new Error(`Failed to fetch formats: ${formatsError.message}`);
      }

      // Build FASTA to HSN ID mapping
      formats.forEach((format) => {
        if (format.fasta && format.hsn_id) {
          // Extract identifier from FASTA header
          const fastaHeader = format.fasta.split("\n")[0];
          const fastaId = this.extractFastaIdentifier(fastaHeader);

          if (fastaId) {
            this.fastaToHsnCache.set(fastaId, format.hsn_id);
          }
        }
      }); // Get all protein details from proteins table
      const { data: proteins, error: proteinsError } = await this.supabase
        .from("proteins")
        .select("hsn_id, uniprot_id, gene_name, protein_name");

      if (proteinsError) {
        throw new Error(`Failed to fetch proteins: ${proteinsError.message}`);
      }

      // Build HSN ID to protein details mapping
      proteins.forEach((protein) => {
        if (protein.hsn_id) {
          this.hsnToProteinCache.set(protein.hsn_id, {
            hsnId: protein.hsn_id,
            uniprotId: protein.uniprot_id,
            geneName: protein.gene_name || "Unknown",
            proteinName: protein.protein_name || "Unknown protein",
            organism: "Homo sapiens", // Default for all HSNDB proteins
            description: `S-nitrosylated protein: ${
              protein.protein_name || "Unknown protein"
            }`,
          });
        }
      });

      console.log(`✅ Loaded ${this.fastaToHsnCache.size} FASTA mappings`);
      console.log(`✅ Loaded ${this.hsnToProteinCache.size} protein details`);

      return true;
    } catch (error) {
      console.error("❌ Failed to initialize mappings:", error.message);
      return false;
    }
  }

  extractFastaIdentifier(fastaHeader) {
    // Remove '>' and extract the first identifier
    // Handle various FASTA header formats:
    // >P12345
    // >sp|P12345|PROTEIN_NAME
    // >HSN001
    // etc.

    const cleaned = fastaHeader.replace(/^>/, "").trim();

    // Try different patterns
    const patterns = [
      /^([A-Z0-9]+)/, // Simple identifier
      /sp\|([A-Z0-9]+)\|/, // SwissProt format
      /tr\|([A-Z0-9]+)\|/, // TrEMBL format
      /(HSN\d+)/, // HSN format
      /^([^\s\|]+)/, // First non-space, non-pipe part
    ];

    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return cleaned.split(/\s+/)[0]; // Fallback to first word
  }

  async getProteinDetails(fastaIdentifier) {
    try {
      // First, map FASTA identifier to HSN ID
      const hsnId = this.fastaToHsnCache.get(fastaIdentifier);

      if (!hsnId) {
        console.warn(
          `⚠️ No HSN ID found for FASTA identifier: ${fastaIdentifier}`
        );
        return this.getDefaultProteinDetails(fastaIdentifier);
      }

      // Then, get protein details using HSN ID
      const proteinDetails = this.hsnToProteinCache.get(hsnId);

      if (!proteinDetails) {
        console.warn(`⚠️ No protein details found for HSN ID: ${hsnId}`);
        return this.getDefaultProteinDetails(fastaIdentifier, hsnId);
      }

      return {
        ...proteinDetails,
        id: `protein_${hsnId}`, // For navigation purposes
      };
    } catch (error) {
      console.error("❌ Error getting protein details:", error.message);
      return this.getDefaultProteinDetails(fastaIdentifier);
    }
  }

  getDefaultProteinDetails(fastaIdentifier, hsnId = null) {
    return {
      id: `protein_${hsnId || fastaIdentifier}`,
      hsnId: hsnId || fastaIdentifier,
      uniprotId: null,
      geneName: "Unknown",
      proteinName: "Unknown protein",
      organism: "Homo sapiens",
      description: "Protein details not found in database",
    };
  }

  async refreshMappings() {
    // Clear caches and reload
    this.fastaToHsnCache.clear();
    this.hsnToProteinCache.clear();
    return await this.initializeMappings();
  }

  // Batch process multiple FASTA identifiers
  async getMultipleProteinDetails(fastaIdentifiers) {
    const results = [];

    for (const identifier of fastaIdentifiers) {
      const details = await this.getProteinDetails(identifier);
      results.push(details);
    }

    return results;
  }

  // Get statistics
  getStats() {
    return {
      fastaToHsnMappings: this.fastaToHsnCache.size,
      hsnToProteinMappings: this.hsnToProteinCache.size,
      totalProteins: this.hsnToProteinCache.size,
    };
  }
}

module.exports = BlastDatabaseMapper;
