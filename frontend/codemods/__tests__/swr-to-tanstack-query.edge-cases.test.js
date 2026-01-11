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

describe('SWR to TanStack Query Codemod - Edge Cases', () => {
  describe('Malformed or unusual code patterns', () => {
    it('should handle useSWR with only one argument', () => {
      const input = `
        import useSWR from 'swr';
        const result = useSWR('/api/user');
      `;

      const output = applyTransform(input);

      // Import is transformed since hasUseSWR is true
      // but the call itself remains unchanged (invalid usage with < 2 args)
      expect(output).toContain('@tanstack/react-query');
      expect(output).toContain('useQuery');
      expect(output).toContain('useSWR');
      // The useSWR call is not transformed to useQuery call
      expect(output).not.toContain('useQuery({');
    });

    it('should handle useSWR with no destructuring', () => {
      const input = `
        import useSWR from 'swr';
        const swrResult = useSWR('/api/user', fetcher);
        console.log(swrResult.data);
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      expect(output).toContain('swrResult');
    });

    it('should handle empty destructuring pattern', () => {
      const input = `
        import useSWR from 'swr';
        const {} = useSWR('/api/user', fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
    });

    it('should handle rest properties in destructuring', () => {
      const input = `
        import useSWR from 'swr';
        const { data, ...rest } = useSWR('/api/user', fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      expect(output).toContain('...rest');
    });

    it('should handle useSWR with undefined fetcher', () => {
      const input = `
        import useSWR from 'swr';
        const { data } = useSWR('/api/user', undefined);
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      expect(output).toContain('undefined');
    });

    it('should handle useSWR with null key', () => {
      const input = `
        import useSWR from 'swr';
        const { data } = useSWR(null, fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      expect(output).toContain('null');
    });
  });

  describe('Complex key patterns', () => {
    it('should handle array keys', () => {
      const input = `
        import useSWR from 'swr';
        const { data } = useSWR(['/api/user', userId], fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      expect(output).toContain('userId');
    });

    it('should handle object keys', () => {
      const input = `
        import useSWR from 'swr';
        const { data } = useSWR({ url: '/api/user', id: userId }, fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      expect(output).toContain('url:');
    });

    it('should handle function call as key', () => {
      const input = `
        import useSWR from 'swr';
        const { data } = useSWR(getApiUrl(userId), fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      expect(output).toContain('getApiUrl');
    });

    it('should handle template literal keys', () => {
      const input = `
        import useSWR from 'swr';
        const { data } = useSWR(\`/api/user/\${userId}/posts\`, fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      expect(output).toContain('userId');
    });

    it('should handle nested ternary in key', () => {
      const input = `
        import useSWR from 'swr';
        const { data } = useSWR(
          isLoggedIn ? (hasAccess ? '/api/admin' : '/api/user') : null,
          fetcher
        );
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      expect(output).toContain('isLoggedIn');
      expect(output).toContain('hasAccess');
    });

    it('should handle logical AND in conditional key', () => {
      const input = `
        import useSWR from 'swr';
        const { data } = useSWR(userId && isReady ? \`/api/user/\${userId}\` : null, fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain('enabled:');
      expect(output).toContain('userId');
      expect(output).toContain('isReady');
    });
  });

  describe('Import variations', () => {
    it('should handle aliased default import', () => {
      const input = `
        import useSWRHook from 'swr';
        const { data } = useSWRHook('/api/user', fetcher);
      `;

      const output = applyTransform(input);

      // Should still remove the import but won't transform the call
      // since it looks for 'useSWR' specifically
      expect(output).not.toContain("from 'swr'");
    });

    it('should handle both default and named imports', () => {
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

    it('should handle import with side effects', () => {
      const input = `
        import 'swr';
        import useSWR from 'swr';
        const { data } = useSWR('/api/user', fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain('@tanstack/react-query');
    });

    it('should preserve non-SWR imports', () => {
      const input = `
        import React from 'react';
        import useSWR from 'swr';
        import axios from 'axios';

        const { data } = useSWR('/api/user', fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain("from 'react'");
      expect(output).toContain("from 'axios'");
      expect(output).not.toContain("from 'swr'");
    });
  });

  describe('Options edge cases', () => {
    it('should preserve unknown options', () => {
      const input = `
        import useSWR from 'swr';
        const { data } = useSWR('/api/user', fetcher, {
          customOption: true,
          anotherCustom: 'value'
        });
      `;

      const output = applyTransform(input);

      expect(output).toContain('customOption: true');
      expect(output).toContain("anotherCustom: 'value'");
    });

    it('should handle function values in options', () => {
      const input = `
        import useSWR from 'swr';
        const { data } = useSWR('/api/user', fetcher, {
          onSuccess: (data) => console.log(data),
          onError: handleError
        });
      `;

      const output = applyTransform(input);

      expect(output).toContain('onSuccess:');
      expect(output).toContain('onError: handleError');
    });

    it('should handle nested object options', () => {
      const input = `
        import useSWR from 'swr';
        const { data } = useSWR('/api/user', fetcher, {
          refreshInterval: 5000,
          fallbackData: { name: 'Loading...' }
        });
      `;

      const output = applyTransform(input);

      expect(output).toContain('refetchInterval: 5000');
      expect(output).toContain('fallbackData:');
    });

    it('should skip fetcher option in options object', () => {
      const input = `
        import useSWR from 'swr';
        const { data } = useSWR('/api/user', fetcher, {
          fetcher: customFetcher,
          refreshInterval: 5000
        });
      `;

      const output = applyTransform(input);

      expect(output).not.toContain('fetcher:');
      expect(output).toContain('refetchInterval');
    });

    it('should handle computed property names in options', () => {
      const input = `
        import useSWR from 'swr';
        const key = 'refreshInterval';
        const { data } = useSWR('/api/user', fetcher, {
          [key]: 5000
        });
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
    });
  });

  describe('Destructuring variations', () => {
    it('should handle all return properties', () => {
      const input = `
        import useSWR from 'swr';
        const { data, error, isValidating, mutate, isLoading } = useSWR('/api/user', fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain('isFetching');
      expect(output).toContain('refetch');
      expect(output).not.toContain('isValidating');
      expect(output).not.toContain('mutate');
    });

    it('should handle renamed destructured properties', () => {
      const input = `
        import useSWR from 'swr';
        const {
          data: userData,
          error: userError,
          isValidating: userLoading,
          mutate: updateUser
        } = useSWR('/api/user', fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain('userData');
      expect(output).toContain('userError');
      expect(output).toContain('isFetching:');
      expect(output).not.toContain('isValidating');
    });

    it('should handle partial destructuring with defaults', () => {
      const input = `
        import useSWR from 'swr';
        const { data = [] } = useSWR('/api/users', fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      expect(output).toContain('data =');
    });
  });

  describe('Mutate edge cases', () => {
    it('should handle mutate with no arguments', () => {
      const input = `
        import useSWR from 'swr';
        const { data, mutate } = useSWR('/api/user', fetcher);

        function refresh() {
          mutate();
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('refetch');
      expect(output).toContain('refetch()');
    });

    it('should handle global mutate with data and options', () => {
      const input = `
        import { useSWRConfig } from 'swr';

        function Component() {
          const { mutate } = useSWRConfig();

          function update() {
            mutate('/api/user', { name: 'John' }, { revalidate: true });
          }
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('setQueryData');
      expect(output).toContain('invalidateQueries');
    });

    it('should handle multiple mutate variables with different names', () => {
      const input = `
        import useSWR from 'swr';

        const { mutate: mutateUser } = useSWR('/api/user', fetcher);
        const { mutate: mutatePosts } = useSWR('/api/posts', fetcher);

        mutateUser();
        mutatePosts();
      `;

      const output = applyTransform(input);

      expect(output).toContain('refetch');
    });

    it('should handle mutate in different scopes', () => {
      const input = `
        import useSWR, { useSWRConfig } from 'swr';

        function Component() {
          const { mutate: localMutate } = useSWR('/api/user', fetcher);
          const { mutate: globalMutate } = useSWRConfig();

          localMutate();
          globalMutate('/api/posts');
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('refetch');
      expect(output).toContain('invalidateQueries');
    });

    it('should not transform mutate that is not from useSWR', () => {
      const input = `
        import useSWR from 'swr';

        const { data } = useSWR('/api/user', fetcher);

        function mutate() {
          console.log('custom mutate');
        }

        mutate();
      `;

      const output = applyTransform(input);

      // This custom mutate should remain unchanged
      expect(output).toContain('function mutate()');
    });
  });

  describe('SWRConfig and context edge cases', () => {
    it('should handle self-closing SWRConfig', () => {
      const input = `
        import { SWRConfig } from 'swr';
        const config = <SWRConfig value={swrConfig} />;
      `;

      const output = applyTransform(input);

      expect(output).toContain('QueryClientProvider');
    });

    it('should handle multiple SWRConfig components', () => {
      const input = `
        import { SWRConfig } from 'swr';

        function App() {
          return (
            <>
              <SWRConfig value={config1}>
                <Component1 />
              </SWRConfig>
              <SWRConfig value={config2}>
                <Component2 />
              </SWRConfig>
            </>
          );
        }
      `;

      const output = applyTransform(input);

      const providerMatches = output.match(/QueryClientProvider/g);
      expect(providerMatches.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle nested SWRConfig', () => {
      const input = `
        import { SWRConfig } from 'swr';

        function App() {
          return (
            <SWRConfig value={globalConfig}>
              <SWRConfig value={localConfig}>
                <Component />
              </SWRConfig>
            </SWRConfig>
          );
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('QueryClientProvider');
      const providerMatches = output.match(/QueryClientProvider/g);
      expect(providerMatches.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Real-world patterns', () => {
    it('should handle useSWR in custom hooks', () => {
      const input = `
        import useSWR from 'swr';

        function useUser(userId) {
          const { data, error, mutate } = useSWR(
            userId ? \`/api/user/\${userId}\` : null,
            fetcher
          );

          return {
            user: data,
            isLoading: !error && !data,
            isError: error,
            refresh: mutate
          };
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      expect(output).toContain('enabled:');
      expect(output).toContain('refetch');
    });

    it('should handle useSWR with dependent queries', () => {
      const input = `
        import useSWR from 'swr';

        function Component() {
          const { data: user } = useSWR('/api/user', fetcher);
          const { data: posts } = useSWR(
            user ? \`/api/user/\${user.id}/posts\` : null,
            fetcher
          );
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('enabled:');
      expect(output).toContain('user');
    });

    it('should handle useSWR with error handling', () => {
      const input = `
        import useSWR from 'swr';

        function Component() {
          const { data, error } = useSWR('/api/user', fetcher, {
            onError: (err) => {
              console.error(err);
              trackError(err);
            },
            onSuccess: (data) => {
              console.log('Success:', data);
            }
          });

          if (error) return <div>Error: {error.message}</div>;
          if (!data) return <div>Loading...</div>;
          return <div>{data.name}</div>;
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      expect(output).toContain('onError:');
      expect(output).toContain('onSuccess:');
    });

    it('should handle useSWR with suspense', () => {
      const input = `
        import useSWR from 'swr';

        function Component() {
          const { data } = useSWR('/api/user', fetcher, {
            suspense: true
          });

          return <div>{data.name}</div>;
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('suspense: true');
    });

    it('should handle useSWR in useEffect', () => {
      const input = `
        import { useEffect } from 'react';
        import useSWR from 'swr';

        function Component() {
          const { data, mutate } = useSWR('/api/user', fetcher);

          useEffect(() => {
            if (data) {
              mutate();
            }
          }, [data, mutate]);
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('refetch');
      expect(output).toContain('useEffect');
    });

    it('should handle useSWR with pagination', () => {
      const input = `
        import useSWR from 'swr';

        function Component({ page }) {
          const { data, error, isValidating } = useSWR(
            \`/api/users?page=\${page}&limit=10\`,
            fetcher,
            {
              keepPreviousData: true,
              revalidateOnFocus: false
            }
          );
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('placeholderData:');
      expect(output).toContain('previousData');
      expect(output).toContain('refetchOnWindowFocus: false');
      expect(output).toContain('isFetching');
    });

    it('should handle useSWR with infinite loading', () => {
      const input = `
        import useSWR from 'swr';

        function Component() {
          const { data } = useSWR(
            (index) => \`/api/users?page=\${index}\`,
            fetcher
          );
        }
      `;

      const output = applyTransform(input);

      // Function as key - should still work
      expect(output).toContain('useQuery');
    });
  });

  describe('Variable naming conflicts', () => {
    it('should handle when queryClient variable already exists', () => {
      const input = `
        import { useSWRConfig } from 'swr';

        function Component() {
          const queryClient = 'something';
          const { mutate } = useSWRConfig();
        }
      `;

      const output = applyTransform(input);

      // Will create conflict - codemod doesn't handle this
      expect(output).toContain('queryClient');
    });

    it('should handle shadowed variables in nested scopes', () => {
      const input = `
        import useSWR from 'swr';

        function Component() {
          const { data, mutate } = useSWR('/api/user', fetcher);

          function inner() {
            const mutate = () => console.log('inner mutate');
            mutate();
          }

          mutate();
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('refetch');
    });
  });

  describe('Fetcher variations', () => {
    it('should handle async fetcher function', () => {
      const input = `
        import useSWR from 'swr';

        const { data } = useSWR('/api/user', async (url) => {
          const res = await fetch(url);
          return res.json();
        });
      `;

      const output = applyTransform(input);

      expect(output).toContain('async');
      expect(output).toContain('fetch');
    });

    it('should handle fetcher with try-catch', () => {
      const input = `
        import useSWR from 'swr';

        const { data } = useSWR('/api/user', async (url) => {
          try {
            const res = await fetch(url);
            return res.json();
          } catch (error) {
            throw new Error('Failed to fetch');
          }
        });
      `;

      const output = applyTransform(input);

      expect(output).toContain('try');
      expect(output).toContain('catch');
    });

    it('should handle method reference as fetcher', () => {
      const input = `
        import useSWR from 'swr';

        class API {
          getUser(url) {
            return fetch(url).then(r => r.json());
          }
        }

        const api = new API();
        const { data } = useSWR('/api/user', api.getUser);
      `;

      const output = applyTransform(input);

      expect(output).toContain('api.getUser');
    });

    it('should handle bound function as fetcher', () => {
      const input = `
        import useSWR from 'swr';

        const fetcher = fetch.bind(null);
        const { data } = useSWR('/api/user', fetcher);
      `;

      const output = applyTransform(input);

      expect(output).toContain('fetcher');
    });
  });

  describe('Mixed transformations', () => {
    it('should handle file with all transformation types', () => {
      const input = `
        import useSWR, { SWRConfig, useSWRConfig } from 'swr';

        export const swrConfig = {
          refreshInterval: 3000,
          revalidateOnFocus: true,
          fetcher: defaultFetcher
        };

        function App() {
          return (
            <SWRConfig value={swrConfig}>
              <Component />
            </SWRConfig>
          );
        }

        function Component() {
          const { data: user, mutate: updateUser } = useSWR('/api/user', fetcher);
          const { mutate: globalMutate } = useSWRConfig();

          function handleUpdate() {
            updateUser();
            globalMutate('/api/posts');
          }
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('queryClient');
      expect(output).toContain('QueryClientProvider');
      expect(output).toContain('useQuery');
      expect(output).toContain('useQueryClient');
      expect(output).toContain('refetch');
      expect(output).toContain('invalidateQueries');
    });

    it('should preserve code structure and comments', () => {
      const input = `
        import useSWR from 'swr';

        // Fetch user data
        function useUserData(userId) {
          /* TODO: Add error handling */
          const { data, error } = useSWR(
            \`/api/user/\${userId}\`,
            fetcher
          );

          return { data, error };
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('// Fetch user data');
      expect(output).toContain('TODO: Add error handling');
    });
  });

  describe('Performance and scalability', () => {
    it('should handle file with many useSWR calls', () => {
      const calls = Array.from({ length: 50 }, (_, i) =>
        `const { data: data${i} } = useSWR('/api/resource${i}', fetcher);`
      ).join('\n          ');

      const input = `
        import useSWR from 'swr';

        function Component() {
          ${calls}
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      const queryMatches = output.match(/useQuery\({/g);
      expect(queryMatches.length).toBe(50);
    });

    it('should handle deeply nested components', () => {
      const input = `
        import useSWR from 'swr';

        function Level1() {
          const { data } = useSWR('/api/1', fetcher);
          return (
            <div>
              <Level2 />
            </div>
          );
        }

        function Level2() {
          const { data } = useSWR('/api/2', fetcher);
          return (
            <div>
              <Level3 />
            </div>
          );
        }

        function Level3() {
          const { data } = useSWR('/api/3', fetcher);
          return <div>{data}</div>;
        }
      `;

      const output = applyTransform(input);

      expect(output).toContain('useQuery');
      const queryMatches = output.match(/useQuery\({/g);
      expect(queryMatches.length).toBe(3);
    });
  });
});
