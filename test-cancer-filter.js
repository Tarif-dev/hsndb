// Test file to verify cancer causing filter logic

// Mock data similar to what useMotifProteins generates
const mockProteins = [
  { id: "1", hsn_id: "HSNMB1000", cancer_causing: true, gene_name: "GENE1" },
  { id: "2", hsn_id: "HSNMB1001", cancer_causing: false, gene_name: "GENE2" },
  { id: "3", hsn_id: "HSNMB1002", cancer_causing: true, gene_name: "GENE3" },
  { id: "4", hsn_id: "HSNMB1003", cancer_causing: false, gene_name: "GENE4" },
  { id: "5", hsn_id: "HSNMB1004", cancer_causing: null, gene_name: "GENE5" },
];

// Test function to simulate filter logic
function testCancerFilter(proteins, cancerCausing) {
  if (cancerCausing === undefined) {
    return proteins; // No filter applied
  }

  return proteins.filter((protein) => protein.cancer_causing === cancerCausing);
}

console.log("Original proteins:", mockProteins.length);

// Test filtering for cancer causing = true (Yes)
const cancerCausingTrue = testCancerFilter(mockProteins, true);
console.log(
  "Cancer causing = true (Yes):",
  cancerCausingTrue.length,
  "proteins"
);
console.log(
  "IDs:",
  cancerCausingTrue.map((p) => p.id)
);

// Test filtering for cancer causing = false (No)
const cancerCausingFalse = testCancerFilter(mockProteins, false);
console.log(
  "Cancer causing = false (No):",
  cancerCausingFalse.length,
  "proteins"
);
console.log(
  "IDs:",
  cancerCausingFalse.map((p) => p.id)
);

// Test no filter
const noFilter = testCancerFilter(mockProteins, undefined);
console.log("No filter:", noFilter.length, "proteins");

console.log("Filter logic test completed successfully!");
