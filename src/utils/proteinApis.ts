
interface UniProtFeature {
  type: string;
  category: string;
  description?: string;
  begin: string;
  end: string;
}

interface UniProtEntry {
  primaryAccession: string;
  sequence: {
    length: number;
    molWeight: number;
  };
  features: UniProtFeature[];
  genes: Array<{
    geneName: {
      value: string;
    };
  }>;
  comments: Array<{
    commentType: string;
    texts: Array<{
      value: string;
    }>;
  }>;
  dbReferences: Array<{
    type: string;
    id: string;
    properties?: {
      [key: string]: string;
    };
  }>;
  keywords: Array<{
    name: string;
  }>;
}

interface StringInteraction {
  stringId_A: string;
  stringId_B: string;
  preferredName_A: string;
  preferredName_B: string;
  score: number;
}

export const fetchUniProtData = async (uniprotId: string): Promise<UniProtEntry | null> => {
  try {
    const response = await fetch(
      `https://rest.uniprot.org/uniprotkb/${uniprotId}?format=json`
    );
    
    if (!response.ok) {
      throw new Error('UniProt data not found');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching UniProt data:', error);
    return null;
  }
};

export const fetchStringInteractions = async (uniprotId: string): Promise<StringInteraction[]> => {
  try {
    // First get the STRING identifier
    const speciesId = '9606'; // Human
    const response = await fetch(
      `https://string-db.org/api/json/network?identifiers=${uniprotId}&species=${speciesId}&limit=10`
    );
    
    if (!response.ok) {
      throw new Error('STRING data not found');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching STRING interactions:', error);
    return [];
  }
};

export const parseGoTerms = (uniprotData: UniProtEntry) => {
  const goTerms = uniprotData.dbReferences
    ?.filter(ref => ref.type === 'GO')
    ?.map(ref => ({
      id: ref.id,
      term: ref.properties?.['GoTerm']?.replace('C:', '').replace('F:', '').replace('P:', '') || ref.id,
      aspect: ref.properties?.['GoEvidenceType'] || 'Unknown'
    })) || [];

  return {
    molecular_function: goTerms.filter(term => term.id.startsWith('GO:') && term.aspect.includes('F')),
    biological_process: goTerms.filter(term => term.id.startsWith('GO:') && term.aspect.includes('P')),
    cellular_component: goTerms.filter(term => term.id.startsWith('GO:') && term.aspect.includes('C'))
  };
};

export const parseProteinDomains = (uniprotData: UniProtEntry) => {
  return uniprotData.features
    ?.filter(feature => 
      feature.type === 'Domain' || 
      feature.type === 'Region' || 
      feature.type === 'Signal peptide'
    )
    ?.map(feature => ({
      type: feature.type,
      description: feature.description || feature.type,
      start: parseInt(feature.begin),
      end: parseInt(feature.end)
    })) || [];
};

export const parsePathways = (uniprotData: UniProtEntry) => {
  return uniprotData.dbReferences
    ?.filter(ref => ref.type === 'KEGG' || ref.type === 'Reactome')
    ?.map(ref => ({
      database: ref.type,
      id: ref.id,
      name: ref.properties?.['PathwayName'] || ref.id
    })) || [];
};

export const calculateSecondaryStructure = (domains: any[]) => {
  // Simplified calculation based on domain types
  const totalLength = domains.length > 0 ? Math.max(...domains.map(d => d.end)) : 100;
  
  // Rough estimates based on typical protein structure
  return {
    alpha_helix: Math.round((totalLength * 0.35) / totalLength * 100),
    beta_sheet: Math.round((totalLength * 0.25) / totalLength * 100),
    random_coil: Math.round((totalLength * 0.40) / totalLength * 100)
  };
};
