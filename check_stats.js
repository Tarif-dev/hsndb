import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkStats() {
  console.log("Checking database statistics...");

  // Count all proteins
  const { count: totalProteins, error: proteinsError } = await supabase
    .from("proteins")
    .select("*", { count: "exact", head: true });

  if (proteinsError) {
    console.error("Error counting proteins:", proteinsError);
    return;
  }

  // Count proteins with cancer_causing = true
  const { count: cancerProteins, error: cancerError } = await supabase
    .from("proteins")
    .select("*", { count: "exact", head: true })
    .eq("cancer_causing", true);

  if (cancerError) {
    console.error("Error counting cancer proteins:", cancerError);
    return;
  }

  // Count proteins with cancer_causing field
  const { count: hasCancerField, error: fieldError } = await supabase
    .from("proteins")
    .select("*", { count: "exact", head: true })
    .not("cancer_causing", "is", null);

  if (fieldError) {
    console.error("Error counting proteins with cancer field:", fieldError);
    return;
  }

  // Get proteins with total_sites
  const { data: sitesData, error: sitesError } = await supabase
    .from("proteins")
    .select("total_sites")
    .not("total_sites", "is", null);

  if (sitesError) {
    console.error("Error fetching sites data:", sitesError);
    return;
  }

  // Calculate sum of all sites
  const totalSites =
    sitesData?.reduce((sum, protein) => sum + (protein.total_sites || 0), 0) ||
    0;

  // Count proteins with total_sites
  const proteinsWithSites = sitesData?.length || 0;

  // Sample data to examine
  const { data: sampleData, error: sampleError } = await supabase
    .from("proteins")
    .select("id, name, cancer_causing, total_sites")
    .limit(5);

  if (sampleError) {
    console.error("Error fetching sample data:", sampleError);
    return;
  }

  console.log("Statistics:");
  console.log(`Total proteins: ${totalProteins}`);
  console.log(`Cancer-associated proteins: ${cancerProteins}`);
  console.log(`Proteins with cancer_causing field: ${hasCancerField}`);
  console.log(`Total S-nitrosylation sites: ${totalSites}`);
  console.log(`Proteins with total_sites: ${proteinsWithSites}`);
  console.log("\nSample data:");
  console.log(sampleData);
}

checkStats().catch(console.error);
