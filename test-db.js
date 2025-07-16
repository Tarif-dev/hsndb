import { supabase } from "./src/integrations/supabase/client.ts";

async function testDatabaseConnection() {
  console.log("Testing SCOP table...");

  // Test SCOP data
  const { data: scopData, error: scopError } = await supabase
    .from("scop")
    .select("uniprot_id")
    .limit(5);

  if (scopError) {
    console.error("SCOP Error:", scopError);
  } else {
    console.log(
      "SCOP UniProt IDs:",
      scopData.map((row) => row.uniprot_id)
    );
  }

  console.log("\nTesting CATH table...");

  // Test CATH data
  const { data: cathData, error: cathError } = await supabase
    .from("cath")
    .select("uniprot_id")
    .limit(5);

  if (cathError) {
    console.error("CATH Error:", cathError);
  } else {
    console.log(
      "CATH UniProt IDs:",
      cathData.map((row) => row.uniprot_id)
    );
  }

  // Test specific UniProt ID
  console.log("\nTesting specific UniProt ID: A0AV96");

  const { data: cathSpecific, error: cathSpecificError } = await supabase
    .from("cath")
    .select("*")
    .eq("uniprot_id", "A0AV96");

  if (cathSpecificError) {
    console.error("CATH Specific Error:", cathSpecificError);
  } else {
    console.log("CATH data for A0AV96:", cathSpecific);
  }
}

testDatabaseConnection();
