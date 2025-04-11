import { db, IService, IStudentService } from '../database/SchoolDatabase';
import { Student, StudentWithServices, TutoringService, SportsActivitiesService, ArtsClassService, IDecoratedStudent } from '../models/Student';
import { studentDAO } from '../daos/StudentDAO';

// Service pour gérer les services supplémentaires des étudiants
export class StudentServiceManager {
  // Obtenir tous les services disponibles
  async getAllServices(): Promise<IService[]> {
    return await db.services.toArray();
  }

  // Ajouter un nouveau service à la liste des services disponibles
  async addService(service: Omit<IService, 'id'>): Promise<number> {
    return await db.services.add(service as IService);
  }

  // Assigner un service à un étudiant
  async assignServiceToStudent(studentId: number, serviceId: number, startDate: Date, endDate?: Date): Promise<{
    success: boolean;
    message: string;
    studentServiceId?: number;
  }> {
    try {
      // Vérifier si l'étudiant existe
      const student = await studentDAO.getById(studentId);
      if (!student) {
        return {
          success: false,
          message: "L'étudiant n'existe pas"
        };
      }

      // Vérifier si le service existe
      const service = await db.services.get(serviceId);
      if (!service) {
        return {
          success: false,
          message: "Le service n'existe pas"
        };
      }

      // Vérifier si l'étudiant a déjà ce service actif
      const existingService = await db.studentServices
        .where({
          studentId: studentId,
          serviceId: serviceId
        })
        .filter(ss => !ss.endDate || new Date(ss.endDate) >= new Date())
        .first();

      if (existingService) {
        return {
          success: false,
          message: "L'étudiant bénéficie déjà de ce service",
          studentServiceId: existingService.id
        };
      }

      // Assigner le service à l'étudiant
      const studentServiceId = await db.studentServices.add({
        studentId,
        serviceId,
        startDate,
        endDate
      });

      return {
        success: true,
        message: "Service assigné avec succès",
        studentServiceId
      };
    } catch (error) {
      console.error("Erreur lors de l'assignation du service:", error);
      return {
        success: false,
        message: "Une erreur est survenue lors de l'assignation du service"
      };
    }
  }

  // Terminer un service pour un étudiant
  async terminateService(studentServiceId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const studentService = await db.studentServices.get(studentServiceId);
      
      if (!studentService) {
        return {
          success: false,
          message: "Service étudiant non trouvé"
        };
      }
      
      // Mettre à jour la date de fin au jour actuel
      await db.studentServices.update(studentServiceId, { endDate: new Date() });
      
      return {
        success: true,
        message: "Service terminé avec succès"
      };
    } catch (error) {
      console.error("Erreur lors de la terminaison du service:", error);
      return {
        success: false,
        message: "Une erreur est survenue lors de la terminaison du service"
      };
    }
  }

  // Obtenir tous les services d'un étudiant
  async getStudentServices(studentId: number): Promise<{
    activeServices: IStudentService[];
    historicalServices: IStudentService[];
  }> {
    const allServices = await db.studentServices
      .where('studentId')
      .equals(studentId)
      .toArray();
    
    const now = new Date();
    
    const activeServices = allServices.filter(service => 
      !service.endDate || new Date(service.endDate) >= now
    );
    
    const historicalServices = allServices.filter(service => 
      service.endDate && new Date(service.endDate) < now
    );
    
    return {
      activeServices,
      historicalServices
    };
  }

  // Créer un étudiant avec des services (utilisation du pattern Decorator)
  async createStudentWithServices(studentId: number): Promise<IDecoratedStudent> {
    // Récupérer l'étudiant
    const studentData = await studentDAO.getById(studentId);
    if (!studentData) {
      throw new Error("Étudiant non trouvé");
    }
    
    // Convertir en modèle
    const student = Student.fromJSON(studentData);
    let decoratedStudent: IDecoratedStudent = new StudentWithServices(student);
    
    // Récupérer les services actifs de l'étudiant
    const now = new Date();
    const studentServices = await db.studentServices
      .where('studentId')
      .equals(studentId)
      .filter(service => !service.endDate || new Date(service.endDate) >= now)
      .toArray();
    
    // Ajouter chaque service à l'étudiant via le pattern Decorator
    for (const studentService of studentServices) {
      const service = await db.services.get(studentService.serviceId);
      
      if (service) {
        switch (service.name.toLowerCase()) {
          case 'tutorat':
            decoratedStudent = new TutoringService(decoratedStudent);
            break;
          case 'sport':
            decoratedStudent = new SportsActivitiesService(decoratedStudent, 'Activité sportive');
            break;
          case 'art':
            decoratedStudent = new ArtsClassService(decoratedStudent, 'Cours d\'art');
            break;
        }
      }
    }
    
    return decoratedStudent;
  }

  // Calculer le coût total des services pour un étudiant
  async calculateStudentServicesTotal(studentId: number): Promise<{
    student: {
      id: number;
      name: string;
    };
    services: {
      name: string;
      cost: number;
      startDate: Date;
      endDate?: Date;
    }[];
    totalCost: number;
  }> {
    // Récupérer les informations de l'étudiant
    const student = await studentDAO.getById(studentId);
    if (!student) {
      throw new Error("Étudiant non trouvé");
    }
    
    // Récupérer tous les services actifs de l'étudiant
    const now = new Date();
    const studentServices = await db.studentServices
      .where('studentId')
      .equals(studentId)
      .filter(service => !service.endDate || new Date(service.endDate) >= now)
      .toArray();
    
    // Détails des services avec leurs coûts
    const services = await Promise.all(
      studentServices.map(async (ss) => {
        const service = await db.services.get(ss.serviceId);
        return {
          name: service?.name || "Service inconnu",
          cost: service?.cost || 0,
          startDate: ss.startDate,
          endDate: ss.endDate
        };
      })
    );
    
    // Calculer le coût total
    const totalCost = services.reduce((sum, service) => sum + service.cost, 0);
    
    return {
      student: {
        id: studentId,
        name: student.name
      },
      services,
      totalCost
    };
  }
}

// Export d'une instance du service
export const studentServiceManager = new StudentServiceManager(); 