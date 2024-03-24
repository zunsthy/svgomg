export default class KeyValCache<Key, Value> {
  #size: number;
  #map = new Map<Key, Value>();

  constructor(size: number) {
    this.#size = size;
  }

  set(key: Key, value: Value) {
    this.#map.set(key, value);

    if (this.#map.size > this.#size) {
      for (const key of this.#map.keys()) {
        this.#map.delete(key);
        if (this.#map.size <= this.#size) break;
      }
    }
  }

  get(key: Key) {
    return this.#map.get(key);
  }

  clear() {
    this.#map.clear();
  }
}
