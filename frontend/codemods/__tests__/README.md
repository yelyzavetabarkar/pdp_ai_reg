# SWR to TanStack Query Codemod Tests

This directory contains comprehensive tests for the SWR to TanStack Query migration codemod.

## Test Coverage

### Basic Tests (`swr-to-tanstack-query.test.js`)

**Basic useSWR transformation**
- Transform useSWR to useQuery
- Handle useSWR with options
- Skip useSWR with less than 2 arguments

**Conditional keys and enabled option**
- Transform conditional keys to enabled option
- Handle non-conditional keys appropriately

**Options mapping**
- Skip options without direct mappings (loadingTimeout, focusThrottleInterval)
- Transform keepPreviousData to placeholderData function
- Map standard options correctly (refreshInterval, revalidateOnFocus, etc.)

**Return value transformations**
- Transform isValidating to isFetching
- Handle renamed properties
- Transform mutate to refetch

**useSWRConfig transformation**
- Transform useSWRConfig to useQueryClient
- Handle mutate with data argument (optimistic updates)
- Handle renamed mutate variables

**SWRConfig JSX transformation**
- Transform SWRConfig to QueryClientProvider
- Update props (value → client)

**swrConfig export transformation**
- Transform config exports to QueryClient instances
- Map options in defaultOptions

**Fetcher function handling**
- Handle identifier fetchers
- Handle arrow function fetchers
- Handle inline function expressions

**Import handling**
- Remove SWR imports and add TanStack Query imports
- Handle multiple import types
- Avoid duplicate imports

**Edge cases**
- Multiple useSWR calls in one file
- Destructured and non-destructured returns
- Preserve other code unchanged
- Complex key expressions
- Options with spread operators
- Empty files
- Files without SWR imports

**Formatting**
- Use single quotes for string literals
- Include trailing commas

### Edge Case Tests (`swr-to-tanstack-query.edge-cases.test.js`)

**Malformed or unusual code patterns**
- useSWR with only one argument
- useSWR with no destructuring
- Empty destructuring pattern
- Rest properties in destructuring
- undefined/null fetcher or key

**Complex key patterns**
- Array keys
- Object keys
- Function calls as keys
- Template literal keys
- Nested ternary expressions
- Logical AND in conditional keys

**Import variations**
- Aliased default imports
- Both default and named imports
- Import with side effects
- Preserve non-SWR imports

**Options edge cases**
- Preserve unknown options
- Handle function values in options
- Handle nested object options
- Skip fetcher option in options object
- Computed property names

**Destructuring variations**
- All return properties
- Renamed destructured properties
- Partial destructuring with defaults

**Mutate edge cases**
- Mutate with no arguments
- Global mutate with data and options
- Multiple mutate variables with different names
- Mutate in different scopes
- Don't transform non-SWR mutate functions

**SWRConfig and context edge cases**
- Self-closing SWRConfig
- Multiple SWRConfig components
- Nested SWRConfig

**Real-world patterns**
- useSWR in custom hooks
- Dependent queries
- Error handling
- Suspense
- useSWR in useEffect
- Pagination with keepPreviousData
- Infinite loading patterns

**Variable naming conflicts**
- Existing queryClient variable
- Shadowed variables in nested scopes

**Fetcher variations**
- Async fetcher functions
- Fetcher with try-catch
- Method references as fetcher
- Bound functions as fetcher

**Mixed transformations**
- Files with all transformation types
- Preserve code structure and comments

**Performance and scalability**
- Many useSWR calls (50+)
- Deeply nested components

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

## Test Statistics

- **Total test files**: 2
- **Total tests**: 81
- **Coverage areas**:
  - Basic transformations
  - Options mapping
  - Return value handling
  - Import/export handling
  - JSX transformations
  - Edge cases and error conditions
  - Real-world usage patterns
  - Performance scenarios

## Known Limitations (Tested)

These are edge cases that are tested to document current behavior:

1. **useSWR with < 2 arguments**: Import is transformed but call remains unchanged
2. **Spread operators in options**: Not preserved (reconstructed by jscodeshift)
3. **Variable naming conflicts**: Codemod doesn't detect conflicts (e.g., existing queryClient variable)
4. **Aliased imports**: Only default import named 'useSWR' is recognized
5. **Invalid syntax**: Codemod assumes valid JavaScript input

## Adding New Tests

When adding new tests:

1. Add to appropriate describe block or create new one
2. Follow the pattern of input → transform → assertions
3. Test both positive cases (what should transform) and negative cases (what shouldn't)
4. Add comments explaining expected behavior for non-obvious cases
5. Update this README with new test categories

## CI Integration

Tests are run automatically on:
- Pre-commit hooks (if configured)
- Pull requests
- Main branch commits

All tests must pass before merging changes to the codemod.
