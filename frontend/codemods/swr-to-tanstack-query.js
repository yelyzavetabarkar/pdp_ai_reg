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
        if (decl.id.name === 'swrConfig') {
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

function trackMutateVariables(j, root, mutateVars) {
  root
    .find(j.VariableDeclarator, {
      init: { type: 'CallExpression', callee: { name: 'useSWR' } },
    })
    .forEach((path) => {
      const declarator = path.node;
      if (declarator.id.type === 'ObjectPattern') {
        declarator.id.properties.forEach((prop) => {
          if (prop.key && prop.key.name === 'mutate') {
            const localName = prop.value ? prop.value.name : prop.key.name;
            mutateVars.add(localName);
          }
        });
      }
    });
}

function transformUseSWRCalls(j, root) {
  root
    .find(j.CallExpression, { callee: { name: 'useSWR' } })
    .forEach((path) => {
      const args = path.node.arguments;
      if (args.length < 2) return;

      const [keyArg, fetcherArg, optionsArg] = args;

      const { queryKey, enabledCondition } = extractKeyAndEnabled(j, keyArg);

      const queryFn = buildQueryFn(j, fetcherArg, queryKey);

      const properties = [
        j.property('init', j.identifier('queryKey'), j.arrayExpression([queryKey])),
        j.property('init', j.identifier('queryFn'), queryFn),
      ];

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

function buildQueryFn(j, fetcherArg, queryKey) {
  if (fetcherArg.type === 'ArrowFunctionExpression' || fetcherArg.type === 'FunctionExpression') {
    return fetcherArg;
  }

  if (fetcherArg.type === 'Identifier') {
    return j.arrowFunctionExpression(
      [j.objectPattern([j.property('init', j.identifier('queryKey'), j.identifier('queryKey'))])],
      j.callExpression(fetcherArg, [
        j.memberExpression(j.identifier('queryKey'), j.literal(0), true),
      ])
    );
  }

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
          if (prop.key && prop.key.name === 'mutate') {
            const localName = prop.value ? prop.value.name : prop.key.name;
            trackedMutateVars.add(localName);
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

        const setDataCall = j.callExpression(
          j.memberExpression(j.identifier('queryClient'), j.identifier('setQueryData')),
          [j.arrayExpression([keyArg]), dataArg]
        );

        const invalidateCall = j.callExpression(
          j.memberExpression(j.identifier('queryClient'), j.identifier('invalidateQueries')),
          [
            j.objectExpression([
              j.property('init', j.identifier('queryKey'), j.arrayExpression([keyArg])),
            ]),
          ]
        );

        path.replace(
          j.sequenceExpression([setDataCall, invalidateCall])
        );

        if (args.length > 2) {
          const statement = path.parent.value;
          if (statement && statement.leadingComments) {
            statement.leadingComments.push(
              j.commentLine(' TODO: SWR mutate() options argument not fully migrated - manual review needed')
            );
          }
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

    root.find(j.Identifier, { name: varName }).forEach((path) => {
      if (path.parent.node.type === 'ArrayExpression') {
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
        if (decl.id.name === 'swrConfig' && decl.init.type === 'ObjectExpression') {
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
      if (
        path.parent.node.type === 'Property' &&
        path.parent.parent.node.type === 'ObjectPattern' &&
        path.parent.node.key === path.node
      ) {
        return;
      }
      if (path.parent.node.type === 'ImportSpecifier') {
        return;
      }

      path.node.name = 'refetch';
    });
  });
}
