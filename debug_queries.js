// Debug query for investigating database structure
async function debugDatabase() {
  try {
    // Create a temporary client without exposing credentials
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    // 1. Check if we have proteins with cancer_causing = true
    const { data: cancerTrue, error: errorCancerTrue } = await supabase
      .from("proteins")
      .select("id, gene_name")
      .eq("cancer_causing", true)
      .limit(5);

    console.log("Proteins with cancer_causing=true:", cancerTrue?.length || 0);
    if (cancerTrue?.length) console.log("Sample:", cancerTrue[0]);

    // 2. Check if we have proteins with cancer_types data
    const { data: cancerTypes, error: errorCancerTypes } = await supabase
      .from("proteins")
      .select("id, gene_name, cancer_types")
      .not("cancer_types", "is", null)
      .limit(5);

    console.log("Proteins with cancer_types data:", cancerTypes?.length || 0);
    if (cancerTypes?.length) console.log("Sample:", cancerTypes[0]);

    // 3. Check proteins with total_sites > 0
    const { data: withSites, error: errorSites } = await supabase
      .from("proteins")
      .select("id, gene_name, total_sites")
      .gt("total_sites", 0)
      .limit(5);

    console.log("Proteins with total_sites > 0:", withSites?.length || 0);
    if (withSites?.length) console.log("Sample:", withSites[0]);

    // 4. Check if there's another field that might indicate cancer association
    const { data: columns, error: errorColumns } = await supabase.rpc(
      "get_table_columns",
      { table_name: "proteins" }
    );

    if (columns) {
      console.log("Available columns in proteins table:");
      columns.forEach((col) =>
        console.log(`- ${col.column_name}: ${col.data_type}`)
      );
    }
  } catch (err) {
    console.error("Debug query failed:", err);
  }
}
