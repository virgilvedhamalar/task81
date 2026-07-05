import fs from 'fs';
import path from 'path';
import { getDBStatus } from './db';

// Ensure data directory exists for local fallback storage
const DATA_DIR = path.join(process.cwd(), 'server', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Creates a Mongoose-compatible wrapper that falls back to localized JSON storage.
 * This guarantees the API works perfectly in local preview modes or when Mongo is unavailable.
 */
export function createModelWrapper<T extends { id?: string; _id?: any; [key: string]: any }>(
  mongooseModel: any,
  fileName: string,
  defaultData: T[] = []
) {
  const filePath = path.join(DATA_DIR, `${fileName}.json`);

  // Helper to read data from local JSON file
  const readLocal = (): T[] => {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error(`Error reading database file ${fileName}.json:`, e);
      return defaultData;
    }
  };

  // Helper to write data back to local JSON file
  const writeLocal = (data: T[]) => {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error(`Error writing to database file ${fileName}.json:`, e);
    }
  };

  return {
    /**
     * Retrieve all items
     */
    async find() {
      if (getDBStatus()) {
        return await mongooseModel.find();
      }
      return readLocal();
    },

    /**
     * Retrieve a single item matching specific key-value criteria
     */
    async findOne(query: { [key: string]: any }) {
      if (getDBStatus()) {
        return await mongooseModel.findOne(query);
      }
      const data = readLocal();
      const match = data.find((item: any) => {
        return Object.keys(query).every(key => item[key] === query[key]);
      });
      return match || null;
    },

    /**
     * Retrieve a single item by ID
     */
    async findById(id: string) {
      if (getDBStatus()) {
        return await mongooseModel.findById(id);
      }
      const data = readLocal();
      const match = data.find((item: any) => item.id === id || item._id === id);
      return match || null;
    },

    /**
     * Create and insert a new item
     */
    async create(doc: Partial<T>) {
      if (getDBStatus()) {
        return await mongooseModel.create(doc);
      }
      const data = readLocal();
      const id = doc.id || doc._id || Math.random().toString(36).substring(2, 11);
      const newDoc = {
        _id: id,
        id: id,
        createdAt: new Date().toISOString(),
        ...doc,
      } as unknown as T;
      
      data.push(newDoc);
      writeLocal(data);
      return newDoc;
    },

    /**
     * Find an item by ID and delete it
     */
    async findByIdAndDelete(id: string) {
      if (getDBStatus()) {
        return await mongooseModel.findByIdAndDelete(id);
      }
      const data = readLocal();
      const index = data.findIndex((item: any) => item.id === id || item._id === id);
      if (index === -1) return null;
      const [deleted] = data.splice(index, 1);
      writeLocal(data);
      return deleted;
    },

    /**
     * Find an item by ID and update its fields
     */
    async findByIdAndUpdate(id: string, updateData: Partial<T>, options?: any) {
      if (getDBStatus()) {
        return await mongooseModel.findByIdAndUpdate(id, updateData, options);
      }
      const data = readLocal();
      const index = data.findIndex((item: any) => item.id === id || item._id === id);
      if (index === -1) return null;
      const updated = {
        ...data[index],
        ...updateData,
      };
      data[index] = updated;
      writeLocal(data);
      return updated;
    }
  };
}
