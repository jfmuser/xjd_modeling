/**
 * Minimal helper for persisting JSON-serializable data in IndexedDB.
 */
export default class IndexedDBStorage {
  constructor({
    dbName = 'app-storage',
    storeName = 'default',
    version = 1,
    keyPath = 'id',
    indexes = [],
  } = {}) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
    this.keyPath = keyPath;
    this.indexes = indexes;
    this.dbPromise = this.#openDatabase();
  }

  async set(value, key) {
    return this.#withStore('readwrite', (store) => store.put(value, key));
  }

  async get(key) {
    return this.#withStore('readonly', (store) => store.get(key));
  }

  async delete(key) {
    return this.#withStore('readwrite', (store) => store.delete(key));
  }

  async clear() {
    return this.#withStore('readwrite', (store) => store.clear());
  }

  async getAll() {
    return this.#withStore('readonly', (store) => store.getAll());
  }

  async #withStore(mode, action) {
    const db = await this.dbPromise;
    if (!db) throw new Error('IndexedDB not available');
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, mode);
      const store = tx.objectStore(this.storeName);
      const request = action(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  #openDatabase() {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported in this environment.');
      return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: this.keyPath, autoIncrement: !this.keyPath });
          this.indexes.forEach(({ name, keyPath, options }) => {
            objectStore.createIndex(name, keyPath, options);
          });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

