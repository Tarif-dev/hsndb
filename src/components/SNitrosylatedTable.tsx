import React from "react";
import { useProteins } from "@/hooks/useProteins";
import ProteinTableInterface from "./common/ProteinTableInterface";

interface SNitrsoylatedTableProps {
  initialQuery?: string;
}

const SNitrosylatedTable = ({ initialQuery = "" }: SNitrsoylatedTableProps) => {
  return (
    <ProteinTableInterface
      initialQuery={initialQuery}
      title="Human S-nitrosylation Database"
      description="Explore and filter through the complete collection of human S-nitrosylated proteins with experimentally validated sites and cancer associations."
      useHook={useProteins}
      badgeText="Experimental Validation"
      tooltipText="These proteins have been experimentally validated to contain S-nitrosylation sites."
    />
  );
};

export default SNitrosylatedTable;
