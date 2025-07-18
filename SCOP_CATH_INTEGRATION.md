# SCOP and CATH Structural Classification Integration

## Overview

This document describes the integration of SCOP (Structural Classification of Proteins) and CATH (Class, Architecture, Topology, Homology) databases into the HSN Database protein details page.

## Implementation Details

### Database Tables

#### SCOP Table Schema

```sql
create table public.scop (
  id bigint generated by default as identity not null,
  uniprot_id text null,
  protein_type_name text null,
  class_name text null,
  fold_name text null,
  superfamily_name text null,
  superfamily_pdb text null,
  superfamily_pdb_region text null,
  family_name text null,
  family_pdb text null,
  family_pdb_region text null,
  constraint scop_pkey primary key (id)
);
```

#### CATH Table Schema

```sql
create table public.cath (
  id bigint generated by default as identity not null,
  uniprot_id text null,
  region text null,
  source text null,
  length integer null,
  organism text null,
  class text null,
  "CATH_Code" text null,
  assignment text null,
  "pLDDT" text null,
  "LUR" boolean null,
  "SSEs" real null,
  "perc_not_in_SS" real null,
  packing text null,
  "CATH_Class" text null,
  "CATH_Architecture" text null,
  "CATH_Topology" text null,
  "CATH_Superfamily" text null,
  constraint cath_pkey primary key (id)
);
```

### Files Modified/Created

1. **Database Types** (`src/integrations/supabase/types.ts`)

   - Added TypeScript types for SCOP and CATH tables
   - Includes Row, Insert, and Update types for type safety

2. **Custom Hooks** (`src/hooks/useStructuralClassification.ts`)

   - `useScopData(uniprotId)`: Fetches SCOP classification data
   - `useCathData(uniprotId)`: Fetches CATH classification data
   - Both hooks use React Query for caching and error handling

3. **Structural Classification Component** (`src/components/StructuralClassification.tsx`)

   - Main component that displays both SCOP and CATH data
   - Features beautiful card-based layout with color-coded sections
   - Handles loading states and empty data gracefully
   - Includes external links to SCOP and CATH databases

4. **Protein Details Page** (`src/pages/ProteinDetails.tsx`)
   - Integrated the structural classification into the Overview tab
   - Added proper section headers and descriptions
   - Positioned after basic protein information and cancer data

### Component Features

#### SCOP Card Features:

- **Class Information**: Displays protein structural class (e.g., "All alpha proteins")
- **Fold Information**: Shows fold type (e.g., "Canonical Rossmann fold")
- **Hierarchical Organization**: Superfamily and Family classifications
- **PDB References**: Links to PDB structures with specific regions
- **Visual Design**: Blue gradient styling for easy identification

#### CATH Card Features:

- **Domain Information**: Region and length data
- **CATH Code**: Hierarchical classification code
- **Four-Level Classification**: Class, Architecture, Topology, Superfamily
- **Quality Metrics**: pLDDT scores with color-coded confidence levels
- **Secondary Structure**: SSE counts and disorder percentages
- **Assignment Method**: Source and confidence indicators
- **Visual Design**: Green gradient styling to distinguish from SCOP

### Data Display Logic

#### SCOP Data Fields:

- **protein_type_name**: Type of protein structure
- **class_name**: Structural class classification
- **fold_name**: Protein fold type
- **superfamily_name & superfamily_pdb**: Superfamily classification with PDB reference
- **family_name & family_pdb**: Family classification with PDB reference

#### CATH Data Fields:

- **region**: Amino acid region covered
- **CATH_Code**: Numerical classification code
- **CATH_Class/Architecture/Topology/Superfamily**: Four-level hierarchy
- **pLDDT**: Confidence score for AlphaFold predictions
- **SSEs**: Secondary structure element count
- **perc_not_in_SS**: Percentage not in secondary structure
- **LUR**: Low-uncertainty region indicator

### Loading States and Error Handling

- Shows loading spinners while fetching data
- Gracefully handles empty datasets with informative messages
- Displays database icons and helpful text when no data is available
- Error handling through React Query with console logging

### External Database Links

- SCOP card includes link to https://scop.mrc-lmb.cam.ac.uk/
- CATH card includes link to https://www.cathdb.info/
- Links open in new tabs to preserve user context

### Styling and User Experience

- Responsive grid layout that works on mobile and desktop
- Color-coded sections (blue for SCOP, green for CATH)
- Clear typography hierarchy with proper spacing
- Badge components for categorical data
- Gradient backgrounds for visual appeal
- Consistent with existing HSN Database design system

## Usage

The structural classification data will automatically appear in the Overview tab of any protein details page where the protein has a UniProt ID that matches entries in the SCOP or CATH tables. The component queries both databases simultaneously and displays available data for each.

## Future Enhancements

1. **Interactive Elements**: Add click-to-expand functionality for detailed information
2. **Visualization**: Include 3D structure thumbnails or fold diagrams
3. **Cross-references**: Link to related proteins with similar classifications
4. **Export Functionality**: Allow users to download classification data
5. **Comparison Mode**: Side-by-side comparison of classification schemes
