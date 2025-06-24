### How to Replace Existing Tables with the Reusable Component

To integrate the reusable table component with existing application views, follow these steps:

## Step 1: Install and Set Up the Reusable Component

1. Copy the `ProteinTableInterface.tsx` file to your components/common directory
2. Resolve any dependency issues if needed (all dependencies should be standard UI components)

## Step 2: For the Motif-Based Proteins Table

1. Replace or rename the existing `MotifBrowseInterface.tsx` with the new implementation:

```bash
# Option 1: Replace the file
cp d:\hsndb\src\components\MotifBrowseInterface.new.tsx d:\hsndb\src\components\MotifBrowseInterface.tsx

# Option 2: Keep both versions and modify imports where needed
# (Update the import statements in files that use MotifBrowseInterface)
```

## Step 3: For the Standard Proteins Table

1. Replace or rename the existing `BrowseInterface.tsx` with the new implementation:

```bash
# Option 1: Replace the file
cp d:\hsndb\src\components\BrowseInterfaceNew.tsx d:\hsndb\src\components\BrowseInterface.tsx

# Option 2: Keep both versions and modify imports where needed
# (Update the import statements in files that use BrowseInterface)
```

## Step 4: Test All Views

1. Test the motif-based proteins view (e.g., `/motif-browse` or similar route)
2. Test the standard proteins view (e.g., `/browse` route)
3. Verify that all functionality works as expected:
   - Searching
   - Filtering
   - Sorting
   - Pagination
   - Row clicking/navigation

## Step 5: Add Additional Views as Needed

To add a new table view for a different type of protein data:

1. Create a new component file (e.g., `SpecialProteinBrowse.tsx`)
2. Follow the pattern in the example files to implement your view
3. Define columns appropriate for your data
4. Create or reuse a data-fetching hook for your data type
5. Add the component to your routes/navigation as needed

## Benefits of This Approach

- **Reduced code duplication**: You now have one table implementation instead of multiple
- **Consistent UI**: All protein tables will have the same styling and behavior
- **Easier maintenance**: Bug fixes and feature enhancements can be made in one place
- **Better scalability**: Adding new table views is much faster and more consistent

## Common Issues and Solutions

- **TypeScript errors**: Make sure your data types match the expected interface
- **Column layout issues**: Use the width property to control column widths
- **Sorting problems**: Ensure your data hook properly handles the sortBy parameter
- **Filter inconsistencies**: Check that your filter options match what your data hook expects

## Next Steps

After successfully implementing the reusable components, consider these improvements:

1. Add more filter options specific to each view
2. Enhance the column configuration to support more cell types
3. Add export functionality for table data
4. Implement column visibility toggles to let users customize their view
