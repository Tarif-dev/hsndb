import React from "react";
import { useMotifProteins } from "@/hooks/useMotifProteins";
import ProteinTableInterface from "./common/ProteinTableInterface";

interface MotifTableProps {
  initialQuery?: string;
}

const MotifTable = ({ initialQuery = "" }: MotifTableProps) => {
  return (
    <ProteinTableInterface
      initialQuery={initialQuery}
      title="Motif-Based Proteins Database"
      description="Browse proteins from our motif-based protein database with information on cancer associations. This database showcases proteins identified through motif pattern analysis, aligned with the experimental S-nitrosylated protein database."
      useHook={useMotifProteins}
      badgeText="Motif Analysis"
      tooltipText="These proteins were identified through computational motif pattern analysis from human proteome data."
    />
  );
};

export default MotifTable;
