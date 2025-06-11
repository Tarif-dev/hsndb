// Database integration for BLAST results
const { createClient } = require("@supabase/supabase-js");
const config = require("../config");

class BlastDatabaseMapper {
  constructor() {
    // Initialize Supabase client
    this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

    // Cache for UniProt ID to protein details mapping
    this.uniprotToProteinCache = new Map();
  }

  async initializeMappings() {
    try {
      console.log("🔄 Initializing UniProt ID to protein mappings...");

      // Get ALL protein details by fetching in batches to bypass Supabase limits
      let allProteins = [];
      let batch = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const start = batch * batchSize;
        const end = start + batchSize - 1;

        console.log(`📥 Fetching batch ${batch + 1} (rows ${start}-${end})...`);

        const { data: proteins, error: proteinsError } = await this.supabase
          .from("proteins")
          .select("id, hsn_id, uniprot_id, gene_name, protein_name")
          .range(start, end);

        if (proteinsError) {
          throw new Error(
            `Failed to fetch proteins batch ${batch}: ${proteinsError.message}`
          );
        }

        if (proteins.length === 0) {
          hasMore = false;
        } else {
          allProteins = allProteins.concat(proteins);
          batch++;

          // Stop if we got less than a full batch (indicates we're at the end)
          if (proteins.length < batchSize) {
            hasMore = false;
          }
        }
      }

      console.log(
        `📥 Total fetched: ${allProteins.length} proteins from ${batch} batches`
      ); // Build UniProt ID to protein details mapping (direct mapping)
      let mappedCount = 0;
      let skippedCount = 0;

      allProteins.forEach((protein) => {
        if (protein.uniprot_id) {
          this.uniprotToProteinCache.set(protein.uniprot_id, {
            id: protein.id,
            hsnId: protein.hsn_id,
            uniprotId: protein.uniprot_id,
            geneName: protein.gene_name || "Unknown",
            proteinName: protein.protein_name || "Unknown protein",
            description: `S-nitrosylated protein: ${
              protein.protein_name || "Unknown protein"
            }`,
          });
          mappedCount++;
        } else {
          skippedCount++;
        }
      });

      console.log(`✅ Mapped ${mappedCount} proteins with UniProt IDs`);
      console.log(`⚠️  Skipped ${skippedCount} proteins without UniProt IDs`);
      console.log(`✅ Total proteins processed: ${allProteins.length}`);
      console.log("✅ Direct UniProt ID → Protein mapping initialized");

      return true;
    } catch (error) {
      console.error("❌ Failed to initialize mappings:", error.message);
      return false;
    }
  }
  extractFastaIdentifier(fastaHeader) {
    // Remove '>' and extract UniProt ID from FASTA header
    // Handle UniProt format: >sp|A0A024RBG1|NUD4B_HUMAN Diphosphoinositol...

    const cleaned = fastaHeader.replace(/^>/, "").trim();

    // Primary pattern for UniProt format: sp|UNIPROT_ID|PROTEIN_NAME
    const uniprotMatch = cleaned.match(/^sp\|([A-Z0-9]+)\|/);
    if (uniprotMatch) {
      return uniprotMatch[1]; // Return the UniProt ID (e.g., A0A024RBG1)
    }

    // Fallback patterns for other formats
    const patterns = [
      /^tr\|([A-Z0-9]+)\|/, // TrEMBL format
      /^([A-Z0-9]{6,10})/, // Direct UniProt ID format
      /(HSN\d+)/, // HSN format (fallback)
      /^([^\s\|]+)/, // First non-space, non-pipe part
    ];

    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return cleaned.split(/\s+/)[0]; // Final fallback to first word
  }

  async getProteinDetails(fastaIdentifier) {
    try {
      // Direct lookup using UniProt ID
      const proteinDetails = this.uniprotToProteinCache.get(fastaIdentifier);

      if (!proteinDetails) {
        console.warn(
          `⚠️ No protein details found for UniProt ID: ${fastaIdentifier}`
        );
        return this.getDefaultProteinDetails(fastaIdentifier);
      }

      console.log(
        `✅ Found protein details for ${fastaIdentifier}: ${proteinDetails.geneName} - ${proteinDetails.proteinName}`
      );

      return {
        ...proteinDetails,
        id: proteinDetails.id || `protein_${proteinDetails.hsnId}`, // Use actual ID or fallback
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
      uniprotId: fastaIdentifier, // Use the UniProt ID as fallback
      geneName: "Unknown",
      proteinName: "Unknown protein",
      description: "Protein details not found in database",
    };
  }

  async refreshMappings() {
    // Clear caches and reload
    this.uniprotToProteinCache.clear();
    return await this.initializeMappings();
  }

  // Batch process multiple UniProt identifiers
  async getMultipleProteinDetails(uniprotIds) {
    const results = [];

    for (const uniprotId of uniprotIds) {
      const details = await this.getProteinDetails(uniprotId);
      results.push(details);
    }

    return results;
  }

  // Get statistics
  getStats() {
    return {
      uniprotToProteinMappings: this.uniprotToProteinCache.size,
      totalProteins: this.uniprotToProteinCache.size,
    };
  }
}

module.exports = BlastDatabaseMapper;
