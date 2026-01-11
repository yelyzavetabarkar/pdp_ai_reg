import { describe, it, expect } from 'vitest';
import jscodeshift from 'jscodeshift';
import transform from '../swr-to-tanstack-query.js';

/**
 * Helper function to run the codemod transformation
 */
function applyTransform(input) {
  const output = transform(
    { path: 'test.js', source: input },
    { jscodeshift },
    {}
  );
  return output;
}

describe('SWR to TanStack Query Codemod', () => {
  describe('Basic useSWR transformation', () => {
    it('should transform useSWR to useQuery', () => {
      const input = `
        import useSWR from 'swr';

        function Component() {
          const { data, error } = useSWR('/api/user', fetcher);
          return <div>{data}</div>;
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      expect(output).toContain("from '@tanstack/react-query'");
      expect(output).toContain('queryKey');
      expect(output).toContain('queryFn');
      expect(output).not.toContain('useSWR');
      expect(output).not.toContain("from 'swr'");
    });

    it('should handle useSWR with options', () => {
      const input = `
        import useSWR from 'swr';

        const { data } = useSWR('/api/user', fetcher, {
          refreshInterval: 5000,
          revalidateOnFocus: true
        });
      `;

      const output = applyTransform(input);

      expect(output).toContain('refetchInterval');
      expect(output).toContain('refetchOnWindowFocus');
      expect(output).not.toContain('refreshInterval');
      expect(output).not.toContain('revalidateOnFocus');
    });

    it('should skip useSWR with less than 2 arguments', () => {
      const input = `
        import useSWR from 'swr';

        const result = useSWR('/api/user');
      `;

      const output = applyTransform(input);

      // Should still transform imports but skip the call
      expect(output).toContain('useQuery');
    });
  });

  describe('Conditional keys and enabled option', () => {
    it('should transform conditional key to enabled option', () => {
      const input = `
        import useSWR from 'swr';

        const { data } = useSWR(userId ? \`/api/user/\${userId}\` : null, fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain('enabled:');
      expect(output).toContain('userId');
    });

    it('should not add enabled option for non-conditional keys', () => {
      const input = `
        import useSWR from 'swr';

        const { data } = useSWR('/api/user', fetcher);
      `;

      const output = applyTransform(input);

      expect(output).not.toContain('enabled:');
    });
  });

  describe('Options mapping', () => {
    it('should skip loadingTimeout (no direct mapping)', () => {
      const input = `
        import useSWR from 'swr';

        const { data } = useSWR('/api/user', fetcher, {
          loadingTimeout: 1000
        });
      `;

      const output = applyTransform(input);

      expect(output).not.toContain('loadingTimeout');
      expect(output).not.toContain('networkMode');
    });

    it('should skip focusThrottleInterval (no direct mapping)', () => {
      const input = `
        import useSWR from 'swr';

        const { data } = useSWR('/api/user', fetcher, {
          focusThrottleInterval: 5000
        });
      `;

      const output = applyTransform(input);

      expect(output).not.toContain('focusThrottleInterval');
    });

    it('should transform keepPreviousData to placeholderData function', () => {
      const input = `
        import useSWR from 'swr';

        const { data } = useSWR('/api/user', fetcher, {
          keepPreviousData: true
        });
      `;

      const output = applyTransform(input);

      expect(output).toContain('placeholderData:');
      expect(output).toContain('previousData');
      expect(output).not.toContain('keepPreviousData');
    });

    it('should map standard options correctly', () => {
      const input = `
        import useSWR from 'swr';

        const { data } = useSWR('/api/user', fetcher, {
          refreshInterval: 5000,
          revalidateOnFocus: true,
          revalidateOnReconnect: true,
          errorRetryCount: 3,
          dedupingInterval: 2000
        });
      `;

      const output = applyTransform(input);

      expect(output).toContain('refetchInterval: 5000');
      expect(output).toContain('refetchOnWindowFocus: true');
      expect(output).toContain('refetchOnReconnect: true');
      expect(output).toContain('retry: 3');
      expect(output).toContain('staleTime: 2000');
    });
  });

  describe('Return value transformations', () => {
    it('should transform isValidating to isFetching', () => {
      const input = `
        import useSWR from 'swr';

        const { data, error, isValidating } = useSWR('/api/user', fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain('isFetching');
      expect(output).not.toContain('isValidating');
    });

    it('should handle renamed isValidating', () => {
      const input = `
        import useSWR from 'swr';

        const { isValidating: loading } = useSWR('/api/user', fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain('isFetching');
      expect(output).not.toContain('isValidating');
    });

    it('should transform mutate to refetch', () => {
      const input = `
        import useSWR from 'swr';

        const { data, mutate } = useSWR('/api/user', fetcher);

        function update() {
          mutate();
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('refetch');
      expect(output).not.toContain('mutate');
    });
  });

  describe('useSWRConfig transformation', () => {
    it('should transform useSWRConfig to useQueryClient', () => {
      const input = `
        import { useSWRConfig } from 'swr';

        function Component() {
          const { mutate } = useSWRConfig();

          function invalidate() {
            mutate('/api/user');
          }
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQueryClient');
      expect(output).toContain('queryClient');
      expect(output).toContain('invalidateQueries');
      expect(output).not.toContain('useSWRConfig');
    });

    it('should handle mutate with data argument', () => {
      const input = `
        import { useSWRConfig } from 'swr';

        function Component() {
          const { mutate } = useSWRConfig();

          function update() {
            mutate('/api/user', { name: 'John' });
          }
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('setQueryData');
      expect(output).toContain('invalidateQueries');
    });

    it('should handle renamed mutate variable', () => {
      const input = `
        import { useSWRConfig } from 'swr';

        function Component() {
          const { mutate: revalidate } = useSWRConfig();

          function update() {
            revalidate('/api/user');
          }
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('queryClient');
      expect(output).toContain('invalidateQueries');
    });
  });

  describe('SWRConfig JSX transformation', () => {
    it('should transform SWRConfig to QueryClientProvider', () => {
      const input = `
        import { SWRConfig } from 'swr';

        function App() {
          return (
            <SWRConfig value={swrConfig}>
              <Component />
            </SWRConfig>
          );
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('QueryClientProvider');
      expect(output).toContain('client={queryClient}');
      expect(output).not.toContain('SWRConfig');
      expect(output).not.toContain('value=');
    });
  });

  describe('swrConfig export transformation', () => {
    it('should transform swrConfig export to queryClient', () => {
      const input = `
        export const swrConfig = {
          refreshInterval: 5000,
          revalidateOnFocus: true,
          fetcher: defaultFetcher
        };
      `;

      const output = applyTransform(input);

      expect(output).toContain('queryClient');
      expect(output).toContain('new QueryClient');
      expect(output).toContain('defaultOptions');
      expect(output).not.toContain('swrConfig');
    });
  });

  describe('Fetcher function handling', () => {
    it('should handle identifier fetcher', () => {
      const input = `
        import useSWR from 'swr';

        const { data } = useSWR('/api/user', fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain('queryFn:');
      expect(output).toContain('fetcher');
    });

    it('should handle arrow function fetcher', () => {
      const input = `
        import useSWR from 'swr';

        const { data } = useSWR('/api/user', (key) => fetch(key).then(r => r.json()));
      `;

      const output = applyTransform(input);

      expect(output).toContain('queryFn:');
      expect(output).toContain('fetch');
    });

    it('should handle inline fetcher expression', () => {
      const input = `
        import useSWR from 'swr';

        const { data } = useSWR('/api/user', async (url) => {
          const res = await fetch(url);
          return res.json();
        });
      `;

      const output = applyTransform(input);

      expect(output).toContain('queryFn:');
      expect(output).toContain('fetch');
    });
  });

  describe('Import handling', () => {
    it('should remove SWR imports and add TanStack Query imports', () => {
      const input = `
        import useSWR from 'swr';
        import { useState } from 'react';

        const { data } = useSWR('/api/user', fetcher);
      `;

      const output = applyTransform(input);

      expect(output).not.toContain("from 'swr'");
      expect(output).toContain("from '@tanstack/react-query'");
      expect(output).toContain("from 'react'");
    });

    it('should add multiple imports from TanStack Query', () => {
      const input = `
        import useSWR, { SWRConfig, useSWRConfig } from 'swr';

        const { data } = useSWR('/api/user', fetcher);
        const { mutate } = useSWRConfig();
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      expect(output).toContain('useQueryClient');
      expect(output).toContain('QueryClientProvider');
      expect(output).toContain('QueryClient');
    });

    it('should not duplicate existing TanStack Query imports', () => {
      const input = `
        import useSWR from 'swr';
        import { QueryClient } from '@tanstack/react-query';

        const { data } = useSWR('/api/user', fetcher);
      `;

      const output = applyTransform(input);

      // Count occurrences of QueryClient import
      const matches = output.match(/import.*QueryClient.*from '@tanstack\/react-query'/g);
      expect(matches).toBeTruthy();
      expect(matches.length).toBe(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple useSWR calls in one file', () => {
      const input = `
        import useSWR from 'swr';

        function Component() {
          const { data: user } = useSWR('/api/user', fetcher);
          const { data: posts } = useSWR('/api/posts', fetcher);

          return <div>{user?.name}</div>;
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      // Count useQuery call expressions (not import)
      const queryCallMatches = output.match(/useQuery\({/g);
      expect(queryCallMatches.length).toBe(2);
    });

    it('should handle destructured and non-destructured returns', () => {
      const input = `
        import useSWR from 'swr';

        const result = useSWR('/api/user', fetcher);
        const { data } = useSWR('/api/posts', fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      expect(output).not.toContain('useSWR');
    });

    it('should preserve other code unchanged', () => {
      const input = `
        import useSWR from 'swr';
        import { useState } from 'react';

        function Component() {
          const [count, setCount] = useState(0);
          const { data } = useSWR('/api/user', fetcher);

          function handleClick() {
            setCount(count + 1);
          }

          return <button onClick={handleClick}>{count}</button>;
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('useState');
      expect(output).toContain('setCount');
      expect(output).toContain('handleClick');
      expect(output).toContain('onClick');
    });

    it('should handle complex key expressions', () => {
      const input = `
        import useSWR from 'swr';

        const { data } = useSWR(
          userId ? \`/api/user/\${userId}/posts?limit=10\` : null,
          fetcher
        );
      `;

      const output = applyTransform(input);

      expect(output).toContain('enabled:');
      expect(output).toContain('userId');
      expect(output).toContain('queryKey:');
    });

    it('should handle options with spread operator', () => {
      const input = `
        import useSWR from 'swr';

        const baseOptions = { refreshInterval: 5000 };
        const { data } = useSWR('/api/user', fetcher, {
          ...baseOptions,
          revalidateOnFocus: true
        });
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      // Note: Spread operators are not preserved in the transformed options
      // as jscodeshift reconstructs the object expression
      expect(output).toContain('refetchOnWindowFocus: true');
    });

    it('should handle empty files', () => {
      const input = '';
      const output = applyTransform(input);
      expect(output).toBe('');
    });

    it('should handle files without SWR imports', () => {
      const input = `
        import { useState } from 'react';

        function Component() {
          const [data, setData] = useState(null);
          return <div>{data}</div>;
        }
      `;

      const output = applyTransform(input);

      // Should preserve the code structure even if formatting differs
      expect(output).toContain('useState');
      expect(output).toContain('function Component');
      expect(output).not.toContain('useQuery');
      expect(output).not.toContain('@tanstack/react-query');
    });
  });

  describe('Formatting', () => {
    it('should use single quotes for strings', () => {
      const input = `
        import useSWR from 'swr';
        const { data } = useSWR('/api/user', fetcher);
      `;

      const output = applyTransform(input);

      // String literals should use single quotes
      expect(output).toContain("'@tanstack/react-query'");
      expect(output).toContain("'/api/user'");
      // Object keys are identifiers, not string literals
      expect(output).toContain('queryKey:');
    });

    it('should include trailing commas', () => {
      const input = `
        import useSWR from 'swr';
        const { data } = useSWR('/api/user', fetcher, {
          refreshInterval: 5000
        });
      `;

      const output = applyTransform(input);

      // Check for trailing commas in objects
      expect(output).toMatch(/5000,/);
    });
  });
});
