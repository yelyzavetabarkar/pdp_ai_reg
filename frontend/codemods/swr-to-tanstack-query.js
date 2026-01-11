/**
 * SWR to TanStack Query Codemod
 *
 * This codemod transforms SWR hooks and patterns to their TanStack Query equivalents.
 *
 * Transformations:
 * - useSWR -> useQuery
 * - useSWRMutation -> useMutation
 * - useSWRInfinite -> useInfiniteQuery
 * - mutate (global) -> queryClient.invalidateQueries
 * - SWRConfig -> QueryClientProvider
 *
 * Usage:
 *   npx jscodeshift -t codemods/swr-to-tanstack-query.js src/**\/*.js
 */

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  let hasSwrImports = false;
  let needsQueryClient = false;
  let needsUseQueryClient = false;

  // Track imports to add
  const tanstackImports = new Set();

  // ============================================================================
  // IMPORT TRANSFORMATIONS
  // ============================================================================

  /**
   * Transform SWR imports to TanStack Query imports
   */
  root
    .find(j.ImportDeclaration)
    .filter((path) => {
      const source = path.node.source.value;
      return source === 'swr' || source === 'swr/mutation' || source === 'swr/infinite';
    })
    .forEach((path) => {
      hasSwrImports = true;
      const source = path.node.source.value;

      path.node.specifiers.forEach((specifier) => {
        if (specifier.type === 'ImportDefaultSpecifier') {
          if (source === 'swr') {
            tanstackImports.add('useQuery');
          } else if (source === 'swr/infinite') {
            tanstackImports.add('useInfiniteQuery');
          }
        } else if (specifier.type === 'ImportSpecifier') {
          const imported = specifier.imported.name;
          if (imported === 'useSWRConfig') {
            tanstackImports.add('useQueryClient');
          } else if (imported === 'mutate') {
            needsQueryClient = true;
            tanstackImports.add('useQueryClient');
          } else if (imported === 'SWRConfig') {
            tanstackImports.add('QueryClientProvider');
          } else if (imported === 'useSWRMutation') {
            tanstackImports.add('useMutation');
          }
        }
      });

      // Remove the SWR import
      j(path).remove();
    });

  // Add TanStack Query imports if we had SWR imports
  if (hasSwrImports && tanstackImports.size > 0) {
    const importSpecifiers = Array.from(tanstackImports).map((name) =>
      j.importSpecifier(j.identifier(name))
    );

    const tanstackImport = j.importDeclaration(
      importSpecifiers,
      j.literal('@tanstack/react-query')
    );

    // Add at the top of the file after other imports
    const firstImport = root.find(j.ImportDeclaration).at(0);
    if (firstImport.length > 0) {
      firstImport.insertBefore(tanstackImport);
    } else {
      root.get().node.program.body.unshift(tanstackImport);
    }
  }

  // ============================================================================
  // HOOK TRANSFORMATIONS
  // ============================================================================

  /**
   * Transform useSWR calls to useQuery
   *
   * useSWR(key, fetcher, options) -> useQuery({ queryKey: [key], queryFn: fetcher, ...options })
   */
  root
    .find(j.CallExpression, {
      callee: { name: 'useSWR' },
    })
    .forEach((path) => {
      const args = path.node.arguments;
      if (args.length === 0) return;

      const properties = [];

      // Handle query key (first argument)
      const keyArg = args[0];
      let queryKey;
      if (keyArg.type === 'ArrayExpression') {
        queryKey = keyArg;
      } else {
        queryKey = j.arrayExpression([keyArg]);
      }
      properties.push(j.property('init', j.identifier('queryKey'), queryKey));

      // Handle fetcher (second argument)
      if (args.length >= 2 && args[1]) {
        properties.push(j.property('init', j.identifier('queryFn'), args[1]));
      }

      // Handle options (third argument)
      if (args.length >= 3 && args[2] && args[2].type === 'ObjectExpression') {
        args[2].properties.forEach((prop) => {
          if (prop.type === 'Property' || prop.type === 'ObjectProperty') {
            const key = prop.key.name || prop.key.value;
            // Map SWR options to TanStack Query options
            const mappedKey = mapSwrOptionToTanstack(key);
            if (mappedKey) {
              properties.push(
                j.property('init', j.identifier(mappedKey), prop.value)
              );
            }
          } else if (prop.type === 'SpreadElement') {
            properties.push(prop);
          }
        });
      }

      // Replace with useQuery
      path.node.callee.name = 'useQuery';
      path.node.arguments = [j.objectExpression(properties)];
    });

  /**
   * Transform useSWRMutation calls to useMutation
   */
  root
    .find(j.CallExpression, {
      callee: { name: 'useSWRMutation' },
    })
    .forEach((path) => {
      const args = path.node.arguments;
      if (args.length === 0) return;

      const properties = [];

      // Handle mutation key (first argument) - used for invalidation
      const keyArg = args[0];
      let mutationKey;
      if (keyArg.type === 'ArrayExpression') {
        mutationKey = keyArg;
      } else {
        mutationKey = j.arrayExpression([keyArg]);
      }
      properties.push(j.property('init', j.identifier('mutationKey'), mutationKey));

      // Handle mutation function (second argument)
      if (args.length >= 2 && args[1]) {
        properties.push(j.property('init', j.identifier('mutationFn'), args[1]));
      }

      // Handle options (third argument)
      if (args.length >= 3 && args[2] && args[2].type === 'ObjectExpression') {
        args[2].properties.forEach((prop) => {
          if (prop.type === 'Property' || prop.type === 'ObjectProperty') {
            properties.push(
              j.property('init', j.identifier(prop.key.name || prop.key.value), prop.value)
            );
          } else if (prop.type === 'SpreadElement') {
            properties.push(prop);
          }
        });
      }

      // Replace with useMutation
      path.node.callee.name = 'useMutation';
      path.node.arguments = [j.objectExpression(properties)];
    });

  /**
   * Transform useSWRInfinite calls to useInfiniteQuery
   */
  root
    .find(j.CallExpression, {
      callee: { name: 'useSWRInfinite' },
    })
    .forEach((path) => {
      const args = path.node.arguments;
      if (args.length === 0) return;

      const properties = [];

      // Handle getKey function (first argument)
      if (args[0]) {
        properties.push(j.property('init', j.identifier('queryKey'), j.arrayExpression([j.literal('infinite')])));
        properties.push(j.property('init', j.identifier('queryFn'), args[0]));
      }

      // Handle fetcher (second argument)
      if (args.length >= 2 && args[1]) {
        // In TanStack Query, we need getNextPageParam
        properties.push(
          j.property(
            'init',
            j.identifier('getNextPageParam'),
            j.arrowFunctionExpression(
              [j.identifier('lastPage'), j.identifier('pages')],
              j.identifier('lastPage.nextCursor')
            )
          )
        );
      }

      // Replace with useInfiniteQuery
      path.node.callee.name = 'useInfiniteQuery';
      path.node.arguments = [j.objectExpression(properties)];
    });

  // ============================================================================
  // MUTATE TRANSFORMATIONS
  // ============================================================================

  /**
   * Transform mutate calls to queryClient.invalidateQueries
   *
   * FIXED: Now properly captures all arguments (data, options) instead of just the key.
   *
   * SWR mutate signatures:
   *   mutate(key)                           -> invalidate only
   *   mutate(key, data)                     -> set data then invalidate
   *   mutate(key, data, options)            -> set data with options then invalidate
   *   mutate(key, data, { revalidate })     -> conditional invalidation
   *
   * TanStack Query equivalents:
   *   queryClient.invalidateQueries({ queryKey: [key] })
   *   queryClient.setQueryData([key], data) + invalidateQueries
   *   queryClient.setQueryData([key], data, options) + conditional invalidation
   */
  root
    .find(j.CallExpression, {
      callee: { name: 'mutate' },
    })
    .forEach((path) => {
      const args = path.node.arguments;
      if (args.length === 0) return;

      needsUseQueryClient = true;

      // Extract all arguments: key, data, and options
      const keyArg = args[0];
      const dataArg = args.length >= 2 ? args[1] : null;
      const optionsArg = args.length >= 3 ? args[2] : null;

      // Build the query key
      let queryKey;
      if (keyArg.type === 'ArrayExpression') {
        queryKey = keyArg;
      } else {
        queryKey = j.arrayExpression([keyArg]);
      }

      // If we have data argument, we need to use setQueryData first
      if (dataArg) {
        // Check if options has revalidate: false
        let shouldInvalidate = true;
        if (optionsArg && optionsArg.type === 'ObjectExpression') {
          const revalidateProp = optionsArg.properties.find(
            (p) => (p.key.name === 'revalidate' || p.key.value === 'revalidate')
          );
          if (revalidateProp && revalidateProp.value.value === false) {
            shouldInvalidate = false;
          }
        }

        // Create setQueryData call with all relevant arguments
        const setQueryDataArgs = [queryKey, dataArg];

        // If there are options beyond revalidate, pass them to setQueryData
        if (optionsArg && optionsArg.type === 'ObjectExpression') {
          const filteredOptions = optionsArg.properties.filter(
            (p) => p.key.name !== 'revalidate' && p.key.value !== 'revalidate'
          );
          if (filteredOptions.length > 0) {
            setQueryDataArgs.push(j.objectExpression(filteredOptions));
          }
        }

        const setQueryDataCall = j.callExpression(
          j.memberExpression(j.identifier('queryClient'), j.identifier('setQueryData')),
          setQueryDataArgs
        );

        if (shouldInvalidate) {
          // Replace with both setQueryData and invalidateQueries
          const invalidateCall = j.callExpression(
            j.memberExpression(j.identifier('queryClient'), j.identifier('invalidateQueries')),
            [j.objectExpression([j.property('init', j.identifier('queryKey'), queryKey)])]
          );

          // Wrap in an IIFE or sequence expression
          j(path).replaceWith(
            j.sequenceExpression([setQueryDataCall, invalidateCall])
          );
        } else {
          // Just setQueryData without invalidation
          j(path).replaceWith(setQueryDataCall);
        }
      } else {
        // No data argument - just invalidate
        const invalidateCall = j.callExpression(
          j.memberExpression(j.identifier('queryClient'), j.identifier('invalidateQueries')),
          [j.objectExpression([j.property('init', j.identifier('queryKey'), queryKey)])]
        );
        j(path).replaceWith(invalidateCall);
      }
    });

  /**
   * Transform bound mutate from useSWR destructuring
   *
   * const { mutate } = useSWR(...) -> const { refetch } = useQuery(...)
   * mutate() -> refetch()
   * mutate(newData) -> queryClient.setQueryData(queryKey, newData)
   * mutate(newData, options) -> queryClient.setQueryData(queryKey, newData, options)
   */
  root
    .find(j.VariableDeclarator)
    .filter((path) => {
      return (
        path.node.id.type === 'ObjectPattern' &&
        path.node.init &&
        path.node.init.type === 'CallExpression' &&
        path.node.init.callee.name === 'useQuery'
      );
    })
    .forEach((path) => {
      const properties = path.node.id.properties;
      properties.forEach((prop, index) => {
        if (prop.key && prop.key.name === 'mutate') {
          // Rename mutate to refetch in destructuring
          prop.key.name = 'refetch';
          if (prop.value && prop.value.name === 'mutate') {
            prop.value.name = 'refetch';
          }
        }
      });
    });

  // ============================================================================
  // RESULT OBJECT TRANSFORMATIONS
  // ============================================================================

  /**
   * Transform SWR result properties to TanStack Query equivalents
   *
   * SWR                    TanStack Query
   * ----                   --------------
   * data                   data
   * error                  error
   * isLoading              isLoading (or isPending in v5)
   * isValidating           isFetching
   * mutate                 refetch (for bound mutate)
   */
  const propertyMappings = {
    isValidating: 'isFetching',
  };

  Object.entries(propertyMappings).forEach(([swrProp, tanstackProp]) => {
    root
      .find(j.Identifier, { name: swrProp })
      .forEach((path) => {
        // Only transform if it's a property access or destructuring
        const parent = path.parent.node;
        if (
          parent.type === 'MemberExpression' ||
          parent.type === 'Property' ||
          parent.type === 'ObjectProperty'
        ) {
          path.node.name = tanstackProp;
        }
      });
  });

  // ============================================================================
  // useSWRConfig TRANSFORMATIONS
  // ============================================================================

  /**
   * Transform useSWRConfig to useQueryClient
   */
  root
    .find(j.CallExpression, {
      callee: { name: 'useSWRConfig' },
    })
    .forEach((path) => {
      path.node.callee.name = 'useQueryClient';
    });

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Map SWR options to TanStack Query options
   */
  function mapSwrOptionToTanstack(option) {
    const optionMap = {
      revalidateOnFocus: 'refetchOnWindowFocus',
      revalidateOnReconnect: 'refetchOnReconnect',
      refreshInterval: 'refetchInterval',
      refreshWhenHidden: null, // No direct equivalent
      refreshWhenOffline: null, // No direct equivalent
      shouldRetryOnError: 'retry',
      dedupingInterval: 'staleTime',
      focusThrottleInterval: null, // No direct equivalent
      loadingTimeout: null, // No direct equivalent
      errorRetryInterval: 'retryDelay',
      errorRetryCount: 'retry',
      fallbackData: 'placeholderData',
      fallback: 'placeholderData',
      suspense: 'suspense',
      revalidateOnMount: 'refetchOnMount',
      revalidateIfStale: 'staleTime', // Needs special handling
      keepPreviousData: 'placeholderData', // Uses keepPreviousData helper
      onSuccess: 'onSuccess', // Deprecated in v5, use mutation callbacks
      onError: 'onError',
      onErrorRetry: null, // Custom retry logic needed
      compare: null, // No direct equivalent
      isPaused: 'enabled', // Inverted logic
    };
    return optionMap[option] !== undefined ? optionMap[option] : option;
  }

  return root.toSource({ quote: 'single' });
};

/**
 * Configuration for jscodeshift
 */
module.exports.parser = 'babel';
