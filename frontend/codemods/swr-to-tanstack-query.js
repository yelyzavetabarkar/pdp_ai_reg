/**
 * SWR to TanStack Query (React Query) Codemod
 *
 * Automatically migrates SWR data fetching hooks to TanStack Query equivalents.
 *
 * @see https://swr.vercel.app → https://tanstack.com/query
 *
 * ## Supported Transformations
 *
 * - `useSWR()` → `useQuery()`
 * - `useSWRConfig()` → `useQueryClient()`
 * - `<SWRConfig>` → `<QueryClientProvider>`
 * - `swrConfig` exports → `QueryClient` instances
 * - Conditional keys (`key ? key : null`) → `enabled` option
 * - Return values: `isValidating` → `isFetching`, `mutate` → `refetch`
 * - Options mapping (refreshInterval, revalidateOnFocus, etc.)
 *
 * ## NOT Supported (Manual Migration Required)
 *
 * The following SWR features are NOT handled by this codemod and require manual migration:
 *
 * - `useSWRInfinite` → Must manually migrate to `useInfiniteQuery`
 * - `useSWRMutation` → Must manually migrate to `useMutation`
 * - `useSWRImmutable` → Use `useQuery` with `staleTime: Infinity`
 * - Middleware functions → TanStack Query uses different patterns
 * - Custom cache providers → Configure QueryClient differently
 * - `compare` option → No direct equivalent
 * - `isPaused()` → Use `status === 'paused'`
 *
 * ## Known Limitations
 *
 * - **Semantic differences:** SWR's `isValidating` is false during the initial load when
 *   there is no cached data, while TanStack Query's `isFetching` is true for any fetch
 *   including initial loads. Review usage carefully.
 * - **Global mutate with data:** Transformed to `setQueryData` + `invalidateQueries`
 * - **Options:** Some SWR options (loadingTimeout, focusThrottleInterval) have no equivalent
 * - **Variable conflicts:** Does not check if `queryClient` variable name is already taken
 *
 * ## Usage
 *
 * ```bash
 * npx jscodeshift -t codemods/swr-to-tanstack-query.js --extensions=js,jsx src/
 * ```
 *
 * @param {Object} file - File object with source code
 * @param {Object} api - jscodeshift API
 * @returns {string} Transformed source code
 */

// Constants for variable names
const QUERY_CLIENT_VAR = 'queryClient';

// Options mapping from SWR to TanStack Query
const SWR_TO_TANSTACK_OPTIONS_MAP = {
  refreshInterval: 'refetchInterval',
  revalidateOnFocus: 'refetchOnWindowFocus',
  revalidateOnReconnect: 'refetchOnReconnect',
  revalidateOnMount: 'refetchOnMount',
  errorRetryCount: 'retry',
  errorRetryInterval: 'retryDelay',
  dedupingInterval: 'staleTime',
  suspense: 'suspense',
};

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  let hasUseSWR = false;
  let hasUseSWRConfig = false;
  let hasSWRConfig = false;
  let hasSwrConfigImport = false;
  let hasSwrConfigExport = false;
  let needsUseQuery = false;
  let needsUseQueryClient = false;
  let needsQueryClientProvider = false;
  let needsQueryClient = false;

  const mutateVarsFromUseSWR = new Set();

  root.find(j.ImportDeclaration, { source: { value: 'swr' } }).forEach((path) => {
    path.node.specifiers.forEach((spec) => {
      if (spec.type === 'ImportDefaultSpecifier') {
        hasUseSWR = true;
        needsUseQuery = true;
      }
      if (spec.type === 'ImportSpecifier') {
        if (spec.imported.name === 'useSWRConfig') {
          hasUseSWRConfig = true;
          needsUseQueryClient = true;
        }
        if (spec.imported.name === 'SWRConfig') {
          hasSWRConfig = true;
          needsQueryClientProvider = true;
        }
      }
    });
  });

  root.find(j.ImportDeclaration).forEach((path) => {
    const source = path.node.source.value;
    if (source && source.includes('use-swr-config')) {
      path.node.specifiers.forEach((spec) => {
        if (spec.type === 'ImportSpecifier' && spec.imported.name === 'swrConfig') {
          hasSwrConfigImport = true;
        }
      });
    }
  });

  root.find(j.ExportNamedDeclaration).forEach((path) => {
    if (path.node.declaration && path.node.declaration.type === 'VariableDeclaration') {
      path.node.declaration.declarations.forEach((decl) => {
        if (decl.id && decl.id.type === 'Identifier' && decl.id.name === 'swrConfig') {
          hasSwrConfigExport = true;
          needsQueryClient = true;
        }
      });
    }
  });

  if (hasUseSWR) {
    trackMutateVariables(j, root, mutateVarsFromUseSWR);
    transformUseSWRCalls(j, root);
  }

  if (hasUseSWRConfig) {
    transformUseSWRConfig(j, root);
  }

  if (hasSWRConfig) {
    transformSWRConfigJSX(j, root);
  }

  if (hasSwrConfigExport) {
    transformSwrConfigExport(j, root);
  }

  if (hasSwrConfigImport) {
    transformSwrConfigImport(j, root);
  }

  transformImports(j, root, {
    needsUseQuery,
    needsUseQueryClient,
    needsQueryClientProvider,
    needsQueryClient,
  });

  if (hasUseSWR) {
    transformMutateToRefetch(j, root, mutateVarsFromUseSWR);
  }

  return root.toSource({ quote: 'single', trailingComma: true });
};

/**
 * Tracks all variable names used for mutate from useSWR destructuring.
 *
 * Example: const { mutate } = useSWR(...) → tracks "mutate"
 * Example: const { mutate: update } = useSWR(...) → tracks "update"
 *
 * @param {Object} j - jscodeshift API
 * @param {Object} root - AST root
 * @param {Set} mutateVars - Set to store mutate variable names
 */
function trackMutateVariables(j, root, mutateVars) {
  root
    .find(j.VariableDeclarator, {
      init: { type: 'CallExpression', callee: { name: 'useSWR' } },
    })
    .forEach((path) => {
      const declarator = path.node;
      if (declarator.id.type === 'ObjectPattern') {
        declarator.id.properties.forEach((prop) => {
          if (
            prop &&
            prop.type === 'Property' &&
            prop.key &&
            prop.key.type === 'Identifier' &&
            prop.key.name === 'mutate'
          ) {
            let localName = null;
            if (prop.value && prop.value.type === 'Identifier') {
              localName = prop.value.name;
            } else {
              // Fallback to the key name for shorthand properties
              localName = prop.key.name;
            }
            if (localName) {
              mutateVars.add(localName);
            }
          }
        });
      }
    });
}

/**
 * Transforms all useSWR() calls to useQuery() calls.
 *
 * Before: const { data, error } = useSWR('/api/user', fetcher, { refreshInterval: 5000 })
 * After:  const { data, error } = useQuery({ queryKey: ['/api/user'], queryFn: ..., refetchInterval: 5000 })
 *
 * Also handles:
 * - Conditional keys (key ? key : null) → enabled option
 * - Return value mapping (isValidating → isFetching)
 * - Options transformation
 *
 * @param {Object} j - jscodeshift API
 * @param {Object} root - AST root
 */
function transformUseSWRCalls(j, root) {
  root
    .find(j.CallExpression, { callee: { name: 'useSWR' } })
    .forEach((path) => {
      const args = path.node.arguments;
      // Skip only truly invalid calls with no arguments
      // Calls with a single key (relying on a global fetcher) are handled by
      // omitting queryFn so that a global queryFn can be used by TanStack Query
      if (args.length === 0) return;

      const keyArg = args[0];
      const fetcherArg = args[1];
      const optionsArg = args[2];

      const { queryKey, enabledCondition } = extractKeyAndEnabled(j, keyArg);

      const properties = [
        j.property('init', j.identifier('queryKey'), j.arrayExpression([queryKey])),
      ];

      // Only add queryFn if a fetcher is provided
      if (fetcherArg) {
        const queryFn = buildQueryFn(j, fetcherArg, queryKey);
        properties.push(j.property('init', j.identifier('queryFn'), queryFn));
      }

      if (enabledCondition) {
        properties.push(j.property('init', j.identifier('enabled'), enabledCondition));
      }

      if (optionsArg && optionsArg.type === 'ObjectExpression') {
        const mappedOptions = mapOptions(j, optionsArg);
        properties.push(...mappedOptions);
      }

      const useQueryCall = j.callExpression(j.identifier('useQuery'), [
        j.objectExpression(properties),
      ]);

      path.replace(useQueryCall);

      // Transform return value properties: isValidating → isFetching
      // NOTE: Semantic difference! SWR's isValidating is true only during background revalidation,
      // while TanStack Query's isFetching is true during ANY fetch (including initial).
      // Review usage carefully if conditional rendering depends on this value.
      const parentPath = path.parent;
      if (
        parentPath &&
        parentPath.value &&
        parentPath.value.type === 'VariableDeclarator' &&
        parentPath.value.id &&
        parentPath.value.id.type === 'ObjectPattern'
      ) {
        parentPath.value.id.properties.forEach((prop) => {
          if (
            prop &&
            prop.type === 'Property' &&
            prop.key &&
            prop.key.type === 'Identifier' &&
            prop.key.name === 'isValidating'
          ) {
            prop.key.name = 'isFetching';
            if (prop.value && prop.value.type === 'Identifier' && prop.value.name === 'isValidating') {
              prop.value.name = 'isFetching';
            }
          }
        });
      }
    });
}

/**
 * Extracts query key and enabled condition from conditional key expressions.
 *
 * SWR uses conditional keys for conditional fetching:
 *   useSWR(userId ? `/api/user/${userId}` : null, fetcher)
 *
 * TanStack Query uses the enabled option:
 *   useQuery({ queryKey: [`/api/user/${userId}`], enabled: userId, ... })
 *
 * @param {Object} j - jscodeshift API
 * @param {Object} keyArg - The key argument AST node
 * @returns {{queryKey: Object, enabledCondition: Object|null}}
 */
function extractKeyAndEnabled(j, keyArg) {
  if (keyArg.type === 'ConditionalExpression') {
    const { test, consequent, alternate } = keyArg;

    const isNullAlternate =
      alternate.type === 'NullLiteral' ||
      (alternate.type === 'Literal' && alternate.value === null) ||
      (alternate.type === 'Identifier' && alternate.name === 'null');

    if (isNullAlternate) {
      return {
        queryKey: consequent,
        enabledCondition: test,
      };
    }
  }

  return { queryKey: keyArg, enabledCondition: null };
}

/**
 * Builds a queryFn that wraps the fetcher for TanStack Query.
 *
 * SWR: fetcher receives the key directly: `fetcher('/api/user')`
 * TanStack Query: queryFn receives context object: `({ queryKey }) => fetcher(queryKey[0])`
 *
 * @param {Object} j - jscodeshift API
 * @param {Object} fetcherArg - The fetcher argument AST node
 * @param {Object} queryKey - The query key AST node (unused but kept for future use)
 * @returns {Object} Arrow function expression wrapping the fetcher
 */
function buildQueryFn(j, fetcherArg, queryKey) {
  // If the fetcher is already a function expression, use it as-is
  if (fetcherArg.type === 'ArrowFunctionExpression' || fetcherArg.type === 'FunctionExpression') {
    return fetcherArg;
  }

  // For all other cases (Identifier, MemberExpression, etc.), wrap in an arrow function
  // TanStack Query passes { queryKey, signal, ... } to queryFn, extract the key value
  return j.arrowFunctionExpression(
    [j.objectPattern([j.property('init', j.identifier('queryKey'), j.identifier('queryKey'))])],
    j.callExpression(fetcherArg, [
      j.memberExpression(j.identifier('queryKey'), j.literal(0), true),
    ])
  );
}

function mapOptions(j, optionsArg) {
  const mappedProperties = [];

  optionsArg.properties.forEach((prop) => {
    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') return;

    const keyName = prop.key.name || prop.key.value;
    const mappedKey = SWR_TO_TANSTACK_OPTIONS_MAP[keyName];

    if (keyName === 'keepPreviousData') {
      const placeholderValue = j.arrowFunctionExpression(
        [j.identifier('previousData')],
        j.identifier('previousData')
      );
      mappedProperties.push(j.property('init', j.identifier('placeholderData'), placeholderValue));
    } else if (keyName === 'errorRetryInterval') {
      // TanStack Query's retryDelay expects a function: (attemptIndex: number) => number
      // If the value is already a function, use it as-is, otherwise wrap it
      const value = prop.value.type === 'ArrowFunctionExpression' || prop.value.type === 'FunctionExpression'
        ? prop.value
        : j.arrowFunctionExpression([j.identifier('attemptIndex')], prop.value);
      mappedProperties.push(j.property('init', j.identifier('retryDelay'), value));
    } else if (mappedKey) {
      mappedProperties.push(j.property('init', j.identifier(mappedKey), prop.value));
    } else if (keyName !== 'fetcher' && keyName !== 'loadingTimeout' && keyName !== 'focusThrottleInterval') {
      mappedProperties.push(j.property('init', j.identifier(keyName), prop.value));
    }
  });

  return mappedProperties;
}

function transformUseSWRConfig(j, root) {
  const trackedMutateVars = new Set();

  root
    .find(j.VariableDeclarator, {
      init: { type: 'CallExpression', callee: { name: 'useSWRConfig' } },
    })
    .forEach((path) => {
      const declarator = path.node;

      if (declarator.id.type === 'ObjectPattern') {
        declarator.id.properties.forEach((prop) => {
          if (
            prop &&
            prop.type === 'Property' &&
            prop.key &&
            prop.key.type === 'Identifier' &&
            prop.key.name === 'mutate'
          ) {
            let localName = null;
            if (prop.value && prop.value.type === 'Identifier') {
              localName = prop.value.name;
            } else {
              // Fallback to the key name for shorthand properties
              localName = prop.key.name;
            }
            if (localName) {
              trackedMutateVars.add(localName);
            }
          }
        });

        path.replace(
          j.variableDeclarator(
            j.identifier('queryClient'),
            j.callExpression(j.identifier('useQueryClient'), [])
          )
        );
      }
    });

  trackedMutateVars.forEach((varName) => {
    root.find(j.CallExpression, { callee: { name: varName } }).forEach((path) => {
      const args = path.node.arguments;
      if (args.length === 0) return;

      const keyArg = args[0];

      if (args.length >= 2) {
        const dataArg = args[1];

        const setDataCall = j.expressionStatement(
          j.callExpression(
            j.memberExpression(j.identifier(QUERY_CLIENT_VAR), j.identifier('setQueryData')),
            [j.arrayExpression([keyArg]), dataArg]
          )
        );

        const invalidateCall = j.expressionStatement(
          j.callExpression(
            j.memberExpression(j.identifier(QUERY_CLIENT_VAR), j.identifier('invalidateQueries')),
            [
              j.objectExpression([
                j.property('init', j.identifier('queryKey'), j.arrayExpression([keyArg])),
              ]),
            ]
          )
        );

        // Wrap in IIFE to work in both statement and expression contexts
        // Before: mutate(key, data)
        // After: (() => { queryClient.setQueryData(...); queryClient.invalidateQueries(...); })()
        const iife = j.callExpression(
          j.arrowFunctionExpression(
            [],
            j.blockStatement([setDataCall, invalidateCall])
          ),
          []
        );

        path.replace(iife);

        if (args.length > 2) {
          // Add a TODO comment for manual review when options argument is present
          const comment = j.commentLine(
            ' TODO: SWR mutate() options argument not fully migrated - manual review needed',
            true,
            false
          );
          const targetNode = (path.parent && path.parent.value) || path.node;
          targetNode.comments = targetNode.comments || [];
          targetNode.comments.push(comment);
        }
      } else {
        const invalidateCall = j.callExpression(
          j.memberExpression(j.identifier('queryClient'), j.identifier('invalidateQueries')),
          [
            j.objectExpression([
              j.property('init', j.identifier('queryKey'), j.arrayExpression([keyArg])),
            ]),
          ]
        );

        path.replace(invalidateCall);
      }
    });

    // Only rename mutate variables in React hook dependency arrays
    // e.g., useEffect(..., [mutate]) -> useEffect(..., [queryClient])
    root.find(j.Identifier, { name: varName }).forEach((path) => {
      const parent = path.parent.node;
      const grandParentPath = path.parent.parent;
      const grandParent = grandParentPath && grandParentPath.node;

      // Only rename in React hook dependency arrays
      if (
        parent.type === 'ArrayExpression' &&
        grandParent &&
        grandParent.type === 'CallExpression' &&
        Array.isArray(grandParent.arguments) &&
        grandParent.arguments[grandParent.arguments.length - 1] === parent &&
        grandParent.callee &&
        grandParent.callee.type === 'Identifier' &&
        /^use[A-Z0-9]/.test(grandParent.callee.name)
      ) {
        path.node.name = 'queryClient';
      }
    });
  });
}

function transformSWRConfigJSX(j, root) {
  root
    .find(j.JSXElement, {
      openingElement: { name: { name: 'SWRConfig' } },
    })
    .forEach((path) => {
      const openingElement = path.node.openingElement;
      const closingElement = path.node.closingElement;

      openingElement.name.name = 'QueryClientProvider';
      if (closingElement) {
        closingElement.name.name = 'QueryClientProvider';
      }

      openingElement.attributes.forEach((attr, index) => {
        if (attr.type === 'JSXAttribute' && attr.name.name === 'value') {
          openingElement.attributes[index] = j.jsxAttribute(
            j.jsxIdentifier('client'),
            j.jsxExpressionContainer(j.identifier('queryClient'))
          );
        }
      });
    });
}

function transformSwrConfigExport(j, root) {
  root.find(j.ExportNamedDeclaration).forEach((path) => {
    if (path.node.declaration && path.node.declaration.type === 'VariableDeclaration') {
      path.node.declaration.declarations.forEach((decl) => {
        if (decl.id && decl.id.type === 'Identifier' && decl.id.name === 'swrConfig' && decl.init && decl.init.type === 'ObjectExpression') {
          const defaultOptions = [];

          decl.init.properties.forEach((prop) => {
            if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') return;

            const keyName = prop.key.name || prop.key.value;

            if (keyName === 'fetcher') return;

            const mappedKey = SWR_TO_TANSTACK_OPTIONS_MAP[keyName];
            if (mappedKey) {
              defaultOptions.push(j.property('init', j.identifier(mappedKey), prop.value));
            }
          });

          const queryClientInit = j.newExpression(j.identifier('QueryClient'), [
            j.objectExpression([
              j.property(
                'init',
                j.identifier('defaultOptions'),
                j.objectExpression([
                  j.property('init', j.identifier('queries'), j.objectExpression(defaultOptions)),
                ])
              ),
            ]),
          ]);

          decl.id.name = 'queryClient';
          decl.init = queryClientInit;
        }
      });
    }
  });
}

function transformSwrConfigImport(j, root) {
  root.find(j.ImportDeclaration).forEach((path) => {
    const source = path.node.source.value;
    if (source && source.includes('use-swr-config')) {
      path.node.specifiers.forEach((spec) => {
        if (spec.type === 'ImportSpecifier' && spec.imported.name === 'swrConfig') {
          spec.imported.name = 'queryClient';
          if (spec.local.name === 'swrConfig') {
            spec.local.name = 'queryClient';
          }
        }
      });
    }
  });

  root.find(j.Identifier, { name: 'swrConfig' }).forEach((path) => {
    if (
      path.parent.node.type === 'ImportSpecifier' ||
      (path.parent.node.type === 'Property' && path.parent.node.key === path.node)
    ) {
      return;
    }
    path.node.name = 'queryClient';
  });
}

function transformImports(
  j,
  root,
  { needsUseQuery, needsUseQueryClient, needsQueryClientProvider, needsQueryClient }
) {
  const tanstackImports = [];

  if (needsUseQuery) {
    tanstackImports.push(j.importSpecifier(j.identifier('useQuery')));
  }
  if (needsUseQueryClient) {
    tanstackImports.push(j.importSpecifier(j.identifier('useQueryClient')));
  }
  if (needsQueryClientProvider) {
    tanstackImports.push(j.importSpecifier(j.identifier('QueryClientProvider')));
  }
  if (needsQueryClientProvider || needsQueryClient) {
    let hasQueryClientImport = false;
    root.find(j.ImportDeclaration, { source: { value: '@tanstack/react-query' } }).forEach((path) => {
      path.node.specifiers.forEach((spec) => {
        if (spec.type === 'ImportSpecifier' && spec.imported.name === 'QueryClient') {
          hasQueryClientImport = true;
        }
      });
    });
    if (!hasQueryClientImport) {
      tanstackImports.push(j.importSpecifier(j.identifier('QueryClient')));
    }
  }

  root.find(j.ImportDeclaration, { source: { value: 'swr' } }).remove();

  if (tanstackImports.length > 0) {
    const existingTanstackImport = root.find(j.ImportDeclaration, {
      source: { value: '@tanstack/react-query' },
    });

    if (existingTanstackImport.length > 0) {
      existingTanstackImport.forEach((path) => {
        tanstackImports.forEach((newSpec) => {
          const alreadyExists = path.node.specifiers.some(
            (spec) => spec.type === 'ImportSpecifier' && spec.imported.name === newSpec.imported.name
          );
          if (!alreadyExists) {
            path.node.specifiers.push(newSpec);
          }
        });
      });
    } else {
      const tanstackImport = j.importDeclaration(
        tanstackImports,
        j.literal('@tanstack/react-query')
      );

      const firstImport = root.find(j.ImportDeclaration).at(0);
      if (firstImport.length > 0) {
        firstImport.insertAfter(tanstackImport);
      } else {
        root.get().node.program.body.unshift(tanstackImport);
      }
    }
  }
}

function transformMutateToRefetch(j, root, mutateVars) {
  root
    .find(j.VariableDeclarator, {
      init: { type: 'CallExpression', callee: { name: 'useQuery' } },
    })
    .forEach((path) => {
      const declarator = path.node;

      if (declarator.id.type === 'ObjectPattern') {
        declarator.id.properties.forEach((prop) => {
          if (prop.key && prop.key.name === 'mutate') {
            prop.key.name = 'refetch';
            if (prop.value && prop.value.name === 'mutate') {
              prop.value.name = 'refetch';
            } else if (!prop.value || prop.shorthand) {
              prop.value = j.identifier('refetch');
              prop.shorthand = false;
            }
          }
        });
      }
    });

  mutateVars.forEach((varName) => {
    root.find(j.Identifier, { name: varName }).forEach((path) => {
      // Skip if it's part of a Property within ObjectPattern (either key or value side)
      if (
        path.parent.node.type === 'Property' &&
        path.parent.parent.node.type === 'ObjectPattern'
      ) {
        // Skip both key and value side of properties in object patterns
        // This includes shorthand properties where the identifier appears as both key and value
        if (
          path.parent.node.key === path.node ||
          (path.parent.node.value === path.node && path.parent.node.shorthand)
        ) {
          return;
        }
      }
      if (path.parent.node.type === 'ImportSpecifier') {
        return;
      }

      path.node.name = 'refetch';
    });
  });
}
