
import { useQuery } from '@tanstack/react-query';
import { 
  fetchUniProtData, 
  fetchStringInteractions,
  parseGoTerms,
  parseProteinDomains,
  parsePathways,
  calculateSecondaryStructure
} from '@/utils/proteinApis';

export const useProteinData = (uniprotId: string, enabled: boolean = true) => {
  const uniprotQuery = useQuery({
    queryKey: ['uniprot', uniprotId],
    queryFn: () => fetchUniProtData(uniprotId),
    enabled: enabled && !!uniprotId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const stringQuery = useQuery({
    queryKey: ['string', uniprotId],
    queryFn: () => fetchStringInteractions(uniprotId),
    enabled: enabled && !!uniprotId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const processedData = uniprotQuery.data ? {
    molecularWeight: uniprotQuery.data.sequence?.molWeight || null,
    goTerms: parseGoTerms(uniprotQuery.data),
    domains: parseProteinDomains(uniprotQuery.data),
    pathways: parsePathways(uniprotQuery.data),
    secondaryStructure: calculateSecondaryStructure(parseProteinDomains(uniprotQuery.data)),
    function: uniprotQuery.data.comments
      ?.find(comment => comment.commentType === 'FUNCTION')
      ?.texts?.[0]?.value || null
  } : null;

  return {
    uniprotData: uniprotQuery.data,
    stringInteractions: stringQuery.data || [],
    processedData,
    isLoading: uniprotQuery.isLoading || stringQuery.isLoading,
    error: uniprotQuery.error || stringQuery.error
  };
};
