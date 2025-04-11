import { db } from '../database/SchoolDatabase';
import { Student } from '../models/Student';
import { CourseFactory } from '../models/Course';
import { resourceManager } from '../models/ResourceManager';

export class DataInitializer {
  // Vérifier si des données existent déjà
  static async hasData(): Promise<boolean> {
    const studentsCount = await db.students.count();
    const coursesCount = await db.courses.count();
    const teachersCount = await db.teachers.count();
    
    return studentsCount > 0 || coursesCount > 0 || teachersCount > 0;
  }
  
  // Initialiser toutes les données de test
  static async initializeTestData(): Promise<void> {
    try {
      // Vérifier si des données existent déjà
      const hasData = await this.hasData();
      if (hasData) {
        console.log('La base de données contient déjà des données, initialisation ignorée');
        return;
      }
      
      // Initialiser les enseignants
      await this.initializeTeachers();
      
      // Initialiser les étudiants
      await this.initializeStudents();
      
      // Initialiser les cours
      await this.initializeCourses();
      
      // Initialiser les ressources
      await this.initializeResources();
      
      // Initialiser les services
      await this.initializeServices();
      
      // Créer quelques inscriptions
      await this.initializeEnrollments();
      
      console.log('Initialisation des données de test terminée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des données de test:', error);
    }
  }
  
  // Initialiser les enseignants
  private static async initializeTeachers(): Promise<void> {
    const teachers = [
      {
        name: 'Jean Dupont',
        email: 'jean.dupont@ecole.fr',
        specialization: 'Mathématiques',
        createdAt: new Date()
      },
      {
        name: 'Marie Durand',
        email: 'marie.durand@ecole.fr',
        specialization: 'Sciences',
        createdAt: new Date()
      },
      {
        name: 'Pierre Martin',
        email: 'pierre.martin@ecole.fr',
        specialization: 'Histoire',
        createdAt: new Date()
      },
      {
        name: 'Sophie Lefebvre',
        email: 'sophie.lefebvre@ecole.fr',
        specialization: 'Français',
        createdAt: new Date()
      }
    ];
    
    await db.teachers.bulkAdd(teachers);
  }
  
  // Initialiser les étudiants
  private static async initializeStudents(): Promise<void> {
    const students = [
      {
        name: 'Lucas Bernard',
        email: 'lucas.b@eleve.fr',
        grade: '6ème',
        createdAt: new Date()
      },
      {
        name: 'Emma Petit',
        email: 'emma.p@eleve.fr',
        grade: '5ème',
        createdAt: new Date()
      },
      {
        name: 'Léo Dubois',
        email: 'leo.d@eleve.fr',
        grade: '4ème',
        createdAt: new Date()
      },
      {
        name: 'Chloé Moreau',
        email: 'chloe.m@eleve.fr',
        grade: '3ème',
        createdAt: new Date()
      },
      {
        name: 'Louis Richard',
        email: 'louis.r@eleve.fr',
        grade: 'Seconde',
        createdAt: new Date()
      },
      {
        name: 'Jade Simon',
        email: 'jade.s@eleve.fr',
        grade: 'Première',
        createdAt: new Date()
      },
      {
        name: 'Hugo Leroy',
        email: 'hugo.l@eleve.fr',
        grade: 'Terminale',
        createdAt: new Date()
      }
    ];
    
    // Convertir en objets Student et ajouter à la base de données
    const studentModels = students.map(data => new Student(data).toJSON());
    await db.students.bulkAdd(studentModels);
  }
  
  // Initialiser les cours
  private static async initializeCourses(): Promise<void> {
    // Récupérer les IDs des enseignants
    const teachers = await db.teachers.toArray();
    
    if (teachers.length === 0) {
      throw new Error('Aucun enseignant trouvé, impossible d\'initialiser les cours');
    }
    
    const now = new Date();
    const termStart = new Date(now);
    termStart.setMonth(termStart.getMonth() - 1);
    
    const termEnd = new Date(now);
    termEnd.setMonth(termEnd.getMonth() + 5);
    
    // Créer des cours avec la Factory
    const mathCourse = CourseFactory.createCourse('math', {
      name: 'Mathématiques fondamentales',
      description: 'Cours de mathématiques de base',
      startDate: termStart,
      endDate: termEnd,
      teacherId: teachers[0].id!
    });
    
    const scienceCourse = CourseFactory.createCourse('science', {
      name: 'Sciences physiques',
      description: 'Introduction aux principes de la physique',
      startDate: termStart,
      endDate: termEnd,
      teacherId: teachers[1].id!
    });
    
    const historyCourse = CourseFactory.createCourse('history', {
      name: 'Histoire moderne',
      description: 'Histoire du monde moderne',
      startDate: termStart,
      endDate: termEnd,
      teacherId: teachers[2].id!
    });
    
    const frenchCourse = CourseFactory.createCourse('french', {
      name: 'Français',
      description: 'Littérature et grammaire française',
      startDate: termStart,
      endDate: termEnd,
      teacherId: teachers[3].id!
    });
    
    // Ajouter les cours à la base de données
    await db.courses.bulkAdd([
      mathCourse.toJSON(),
      scienceCourse.toJSON(),
      historyCourse.toJSON(),
      frenchCourse.toJSON()
    ]);
  }
  
  // Initialiser les ressources
  private static async initializeResources(): Promise<void> {
    const resources = [
      {
        name: 'Salle 101',
        type: 'classroom',
        status: 'available' as const
      },
      {
        name: 'Salle 102',
        type: 'classroom',
        status: 'available' as const
      },
      {
        name: 'Laboratoire de sciences',
        type: 'lab',
        status: 'available' as const
      },
      {
        name: 'Salle informatique',
        type: 'computer_lab',
        status: 'inUse' as const,
        lastReservationDate: new Date()
      },
      {
        name: 'Projecteur 1',
        type: 'equipment',
        status: 'available' as const
      },
      {
        name: 'Projecteur 2',
        type: 'equipment',
        status: 'maintenance' as const
      }
    ];
    
    for (const resource of resources) {
      await resourceManager.addResource(resource);
    }
  }
  
  // Initialiser les services
  private static async initializeServices(): Promise<void> {
    const services = [
      {
        name: 'Tutorat',
        description: 'Service de tutorat personnalisé',
        cost: 25
      },
      {
        name: 'Sport',
        description: 'Activités sportives extrascolaires',
        cost: 50
      },
      {
        name: 'Art',
        description: 'Cours d\'art et activités créatives',
        cost: 35
      }
    ];
    
    await db.services.bulkAdd(services);
  }
  
  // Initialiser quelques inscriptions
  private static async initializeEnrollments(): Promise<void> {
    const students = await db.students.toArray();
    const courses = await db.courses.toArray();
    
    if (students.length === 0 || courses.length === 0) {
      throw new Error('Aucun étudiant ou cours trouvé, impossible d\'initialiser les inscriptions');
    }
    
    const enrollments = [
      {
        studentId: students[0].id!,
        courseId: courses[0].id!,
        enrollmentDate: new Date(),
        grade: 15
      },
      {
        studentId: students[0].id!,
        courseId: courses[1].id!,
        enrollmentDate: new Date(),
        grade: 14
      },
      {
        studentId: students[1].id!,
        courseId: courses[0].id!,
        enrollmentDate: new Date(),
        grade: 16
      },
      {
        studentId: students[1].id!,
        courseId: courses[2].id!,
        enrollmentDate: new Date(),
        grade: 18
      },
      {
        studentId: students[2].id!,
        courseId: courses[1].id!,
        enrollmentDate: new Date(),
        grade: 13
      },
      {
        studentId: students[3].id!,
        courseId: courses[3].id!,
        enrollmentDate: new Date()
      }
    ];
    
    await db.enrollments.bulkAdd(enrollments);

    // Ajouter quelques services aux étudiants
    const services = await db.services.toArray();
    
    if (services.length === 0) {
      throw new Error('Aucun service trouvé, impossible d\'initialiser les services étudiants');
    }
    
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 3);
    
    const studentServices = [
      {
        studentId: students[0].id!,
        serviceId: services[0].id!,
        startDate: now,
        endDate: endDate
      },
      {
        studentId: students[1].id!,
        serviceId: services[1].id!,
        startDate: now,
        endDate: endDate
      },
      {
        studentId: students[2].id!,
        serviceId: services[2].id!,
        startDate: now,
        endDate: endDate
      }
    ];
    
    await db.studentServices.bulkAdd(studentServices);
  }
} 