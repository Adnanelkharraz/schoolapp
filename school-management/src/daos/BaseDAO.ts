import { db } from '../database/SchoolDatabase';
import Dexie from 'dexie';

// Classe DAO générique qui servira de base pour tous les DAO spécifiques
export abstract class BaseDAO<T, K> {
  protected table: Dexie.Table<T, K>;
  
  constructor(table: Dexie.Table<T, K>) {
    this.table = table;
  }
  
  // Méthodes CRUD de base
  async getAll(): Promise<T[]> {
    return await this.table.toArray();
  }
  
  async getById(id: K): Promise<T | undefined> {
    return await this.table.get(id);
  }
  
  async add(item: T): Promise<K> {
    return await this.table.add(item);
  }
  
  async update(id: K, changes: Partial<T>): Promise<number> {
    // Utiliser un type plus générique pour éviter les problèmes de typage avec Dexie
    return await this.table.update(id, changes as any);
  }
  
  async delete(id: K): Promise<void> {
    await this.table.delete(id);
  }
  
  // Méthode pour recherche paginée
  async getPaginated(page: number = 1, pageSize: number = 10): Promise<{
    data: T[],
    total: number,
    page: number,
    pageSize: number,
    totalPages: number
  }> {
    const offset = (page - 1) * pageSize;
    const total = await this.table.count();
    const totalPages = Math.ceil(total / pageSize);
    
    const data = await this.table.offset(offset).limit(pageSize).toArray();
    
    return {
      data,
      total,
      page,
      pageSize,
      totalPages
    };
  }
  
  // Récupérer plusieurs éléments par ID
  async getByIds(ids: K[]): Promise<T[]> {
    return await this.table.bulkGet(ids) as T[];
  }
  
  // Bulk operations
  async bulkAdd(items: T[]): Promise<K[]> {
    return await this.table.bulkAdd(items, { allKeys: true });
  }
  
  async bulkDelete(ids: K[]): Promise<void> {
    await this.table.bulkDelete(ids);
  }
} 