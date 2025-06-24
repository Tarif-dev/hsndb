# Reusable Protein Table Component Guide

This guide explains how to use the reusable `ProteinTableInterface` component to create consistent table interfaces across different types of protein views in the application.

## Overview

The `ProteinTableInterface` component is a generic, reusable table component that can be used to display different types of protein data with the same styling, filtering, sorting, and pagination behaviors. This approach helps reduce code duplication and ensures a consistent user experience across the application.

## Benefits

- **Code reuse**: Eliminates duplication between similar table components
- **Consistency**: Ensures all tables have the same look and feel
- **Maintainability**: Changes to table behavior can be made in one place
- **Flexibility**: Can be configured to display different data types with different columns

## Implementation Examples

### 1. For Motif-Based Proteins

See `MotifBrowseInterface.new.tsx` for example implementation.

```tsx
import ProteinTableInterface from "@/components/common/ProteinTableInterface";
import { useMotifProteins } from "@/hooks/useMotifProteins";

const MotifBrowseInterface = ({ initialQuery = "" }) => {
  // Define column configurations
  const columns = [
    // Column definitions...
  ];

  // Define filter options
  const filterOptions = {
    cancerCausing: ["Yes", "No", "Unknown"],
  };

  return (
    <ProteinTableInterface
      initialQuery={initialQuery}
      title="S-nitrosylation Proteins"
      description="Browse proteins with known S-nitrosylation sites"
      columns={columns}
      useHook={useMotifProteins}
      filterOptions={filterOptions}
      badgeText="S-nitrosylation"
      tooltipText="Table description for tooltip..."
    />
  );
};
```

### 2. For Standard Proteins

See `BrowseInterfaceNew.tsx` for example implementation.

```tsx
import ProteinTableInterface from "@/components/common/ProteinTableInterface";
import { useProteins } from "@/hooks/useProteins";

const BrowseInterface = ({ initialQuery = "" }) => {
  // Define column configurations
  const columns = [
    // Column definitions...
  ];

  // Define filter options
  const filterOptions = {
    cancerCausing: ["Yes", "No"],
  };

  return (
    <ProteinTableInterface
      initialQuery={initialQuery}
      title="S-nitrosylated Proteins"
      description="Browse all S-nitrosylated proteins in our database"
      columns={columns}
      useHook={useProteins}
      filterOptions={filterOptions}
      badgeText="S-nitrosylation"
      tooltipText="Table description for tooltip..."
    />
  );
};
```

## How to Use the Component

1. **Define column configurations**: Create an array of column definitions, each with:

   - `header`: The column header text
   - `accessorKey`: The key to access the data field
   - `width`: The column width (optional, use CSS classes)
   - `sortable`: Whether the column should be sortable
   - `cell`: A render function for the cell content

2. **Define filter options**: Create an object with filter categories and their options

3. **Pass your data hook**: Pass the hook that will fetch and manage the data

4. **Configure appearance**: Set title, description, badge text, and tooltip text

## Required Props

| Prop            | Type        | Description          |
| --------------- | ----------- | -------------------- |
| `initialQuery`  | string      | Initial search query |
| `title`         | string      | Table title          |
| `description`   | string      | Table description    |
| `columns`       | ColumnDef[] | Column definitions   |
| `useHook`       | function    | Data fetching hook   |
| `filterOptions` | object      | Filter options       |
| `badgeText`     | string      | Badge display text   |
| `tooltipText`   | string      | Tooltip description  |

## Adding New Views

To create a new protein table view:

1. Create a new component file
2. Import `ProteinTableInterface`
3. Define column configurations for your data
4. Define filter options
5. Create or use an existing data fetching hook
6. Return the `ProteinTableInterface` with your configurations

## Migration Guide

For existing table components:

1. Extract column definitions
2. Extract filter options
3. Replace the entire table implementation with `ProteinTableInterface`
4. Pass the appropriate data fetching hook
