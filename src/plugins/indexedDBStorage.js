import IndexedDBStorage from '@/utils/IndexedDBStorage';

const globalStorage = new IndexedDBStorage({
  dbName: 'fate',
  storeName: 'fate_project',
  keyPath: 'id',
});

export default globalStorage;