import { Signal, useSignal, useSignalEffect } from '@preact/signals';
import KeyValCache from './utils/KeyValCache';
import { compress } from './brotliProcessor';

const brotliCache = new KeyValCache<string, number>(10);

export default function useCompressedSize(
  input: Signal<string | null>,
): Signal<number | null> {
  const brotliSize = useSignal<number | null>(null);

  useSignalEffect(() => {
    if (!input.value) {
      brotliSize.value = null;
      return;
    }

    const cacheResult = brotliCache.get(input.value);

    if (cacheResult !== undefined) {
      brotliSize.value = cacheResult;
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    compress(input.value, { signal })
      .then((result) => {
        signal.throwIfAborted();
        brotliCache.set(input.value!, result);
        brotliSize.value = result;
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error(err);
      });

    return () => controller.abort();
  });

  return brotliSize;
}
