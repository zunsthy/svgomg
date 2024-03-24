import { Signal, useSignal, useSignalEffect } from '@preact/signals';
import {
  ProcessorOptimizeConfig,
  OptimizeConfig,
  RenderableSVG,
} from './types';
import mapObject from './utils/mapObject';
import { optimize } from './svgoProcessor';
import KeyValCache from './utils/KeyValCache';

const cache = new KeyValCache<string, RenderableSVG>(10);

export default function useOptimizeSVG(
  input: Signal<RenderableSVG | null>,
  optimizeConfig: OptimizeConfig,
): Signal<RenderableSVG | null> {
  const optimizedSVG = useSignal<RenderableSVG | null>(null);

  useSignalEffect(() => {
    input.valueOf();
    // Clear the cache when the source changes.
    return () => cache.clear();
  });

  useSignalEffect(() => {
    if (!input.value) {
      optimizedSVG.value = null;
      return;
    }

    const clonableOptimizeConfig: ProcessorOptimizeConfig = {
      pretty: optimizeConfig.pretty.enabled.value ? {} : undefined,
      plugins: mapObject(
        optimizeConfig.plugins,
        ([name, settings]) => settings.enabled.value && [name, {}],
      ),
    };

    const cacheKey = JSON.stringify(clonableOptimizeConfig);
    const cacheResult = cache.get(cacheKey);

    if (cacheResult) {
      optimizedSVG.value = cacheResult;
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    optimize(input.value.source, clonableOptimizeConfig, { signal })
      .then((result) => {
        signal.throwIfAborted();
        cache.set(cacheKey, result);
        optimizedSVG.value = result;
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error(err);
      });

    return () => controller.abort();
  });

  return optimizedSVG;
}
