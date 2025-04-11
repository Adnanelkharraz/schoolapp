import { db, IResource } from '../database/SchoolDatabase';

// Classe ResourceManager avec pattern Singleton
export class ResourceManager {
  private static instance: ResourceManager;
  private constructor() {
    // Constructeur privé pour empêcher l'instanciation directe
  }

  // Méthode pour accéder à l'instance unique
  public static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  // Obtenir toutes les ressources
  public async getAllResources(): Promise<IResource[]> {
    return await db.resources.toArray();
  }

  // Obtenir une ressource par ID
  public async getResourceById(id: number): Promise<IResource | undefined> {
    return await db.resources.get(id);
  }

  // Obtenir les ressources disponibles
  public async getAvailableResources(): Promise<IResource[]> {
    return await db.resources.where('status').equals('available').toArray();
  }

  // Ajouter une ressource
  public async addResource(resource: Omit<IResource, 'id'>): Promise<number> {
    return await db.resources.add(resource);
  }

  // Mettre à jour une ressource
  public async updateResource(id: number, changes: Partial<IResource>): Promise<number> {
    return await db.resources.update(id, changes);
  }

  // Supprimer une ressource
  public async deleteResource(id: number): Promise<void> {
    await db.resources.delete(id);
  }

  // Réserver une ressource
  public async reserveResource(id: number): Promise<boolean> {
    const resource = await this.getResourceById(id);
    
    if (!resource || resource.status !== 'available') {
      return false;
    }
    
    await this.updateResource(id, {
      status: 'inUse',
      lastReservationDate: new Date()
    });
    
    return true;
  }

  // Libérer une ressource
  public async releaseResource(id: number): Promise<boolean> {
    const resource = await this.getResourceById(id);
    
    if (!resource || resource.status !== 'inUse') {
      return false;
    }
    
    await this.updateResource(id, {
      status: 'available'
    });
    
    return true;
  }

  // Mettre une ressource en maintenance
  public async setResourceMaintenance(id: number): Promise<boolean> {
    const resource = await this.getResourceById(id);
    
    if (!resource) {
      return false;
    }
    
    await this.updateResource(id, {
      status: 'maintenance'
    });
    
    return true;
  }

  // Obtenir les statistiques d'utilisation des ressources
  public async getResourceStats(): Promise<{
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
  }> {
    const all = await this.getAllResources();
    const available = all.filter(r => r.status === 'available').length;
    const inUse = all.filter(r => r.status === 'inUse').length;
    const maintenance = all.filter(r => r.status === 'maintenance').length;
    
    return {
      total: all.length,
      available,
      inUse,
      maintenance
    };
  }
}

// Export de l'instance singleton
export const resourceManager = ResourceManager.getInstance(); 