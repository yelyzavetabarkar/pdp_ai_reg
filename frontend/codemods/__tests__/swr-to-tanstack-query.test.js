const { transform } = require('../swr-to-tanstack-query');

describe('SWR to TanStack Query Codemod', () => {
  describe('basic useSWR transformations', () => {
    it('should transform simple useSWR to useQuery', () => {
      const input = `
        import useSWR from 'swr';

        function Component() {
          const { data, error } = useSWR('/api/user', fetcher);
          return <div>{data}</div>;
        }
      `;

      const output = transform(input);

      expect(output).toContain('useQuery');
      expect(output).not.toContain('useSWR');
      expect(output).toContain('@tanstack/react-query');
    });

    it('should transform useSWR with options', () => {
      const input = `
        import useSWR from 'swr';

        function Component() {
          const { data } = useSWR('/api/user', fetcher, {
            revalidateOnFocus: false,
            refreshInterval: 1000
          });
          return <div>{data}</div>;
        }
      `;

      const output = transform(input);

      expect(output).toContain('useQuery');
      expect(output).toContain('refetchOnWindowFocus: false');
      expect(output).toContain('refetchInterval: 1000');
    });

    it('should handle conditional fetching', () => {
      const input = `
        import useSWR from 'swr';

        function Component({ userId }) {
          const { data } = useSWR(userId ? \`/api/user/\${userId}\` : null, fetcher);
          return <div>{data}</div>;
        }
      `;

      const output = transform(input);

      expect(output).toContain('enabled:');
      expect(output).toContain('useQuery');
    });
  });

  describe('import transformations', () => {
    it('should replace swr import with tanstack query', () => {
      const input = `
        import useSWR from 'swr';
        import useSWRMutation from 'swr/mutation';
      `;

      const output = transform(input);

      expect(output).toContain("from '@tanstack/react-query'");
      expect(output).not.toContain("from 'swr'");
    });

    it('should handle named imports', () => {
      const input = `
        import useSWR, { mutate } from 'swr';
      `;

      const output = transform(input);

      expect(output).toContain('useQueryClient');
      expect(output).toContain('useQuery');
    });
  });

  describe('edge cases', () => {
    it('should handle useSWR with no conditional logic', () => {
      const input = `
        import useSWR from 'swr';

        function Component() {
          const { data } = useSWR('/api/user', fetcher);
          return <div>{data}</div>;
        }
      `;

      const output = transform(input);

      expect(output).not.toContain('enabled:');
      expect(output).toContain('queryKey: [\'/api/user\']');
    });

    it('should preserve custom fetcher functions', () => {
      const input = `
        import useSWR from 'swr';

        const customFetcher = (url) => fetch(url).then(r => r.json());

        function Component() {
          const { data } = useSWR('/api/data', customFetcher);
          return <div>{data}</div>;
        }
      `;

      const output = transform(input);

      expect(output).toContain('queryFn');
      expect(output).toContain('customFetcher');
    });

    it('should handle multiple useSWR calls in same component', () => {
      const input = `
        import useSWR from 'swr';

        function Component() {
          const { data: user } = useSWR('/api/user', fetcher);
          const { data: posts } = useSWR('/api/posts', fetcher);
          return <div>{user}{posts}</div>;
        }
      `;

      const output = transform(input);

      expect(output).toContain("queryKey: ['/api/user']");
      expect(output).toContain("queryKey: ['/api/posts']");
    });
  });

  describe('mutation transformations', () => {
    it('should transform useSWRMutation to useMutation', () => {
      const input = `
        import useSWRMutation from 'swr/mutation';

        function Component() {
          const { trigger } = useSWRMutation('/api/user', updateUser);
          return <button onClick={trigger}>Update</button>;
        }
      `;

      const output = transform(input);

      expect(output).toContain('useMutation');
      expect(output).toContain('mutate');
      expect(output).not.toContain('trigger');
    });
  });
});
