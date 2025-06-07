// Test script to verify cancer types are being fetched correctly
import { supabase } from "./src/integrations/supabase/client.js";

async function testCancerTypes() {
  try {
    console.log("Testing cancer types fetch...");

    const { data, error } = await supabase
      .from("proteins")
      .select("cancer_types")
      .not("cancer_types", "is", null)
      .limit(10);

    if (error) {
      console.error("Error fetching cancer types:", error);
      return;
    }

    console.log("Sample cancer types data:", data);

    // Extract unique cancer types
    const allCancerTypes = new Set();
    data.forEach((protein) => {
      if (protein.cancer_types && Array.isArray(protein.cancer_types)) {
        protein.cancer_types.forEach((type) => {
          if (type && type.trim()) {
            allCancerTypes.add(type.trim());
          }
        });
      }
    });

    const sortedCancerTypes = Array.from(allCancerTypes).sort();
    console.log("Unique cancer types found:", sortedCancerTypes);
    console.log("Total unique cancer types:", sortedCancerTypes.length);
  } catch (error) {
    console.error("Error:", error);
  }
}

testCancerTypes();
