import Dexie from 'dexie';

// Définition des tables de la base de données
export class SchoolDatabase extends Dexie {
  students!: Dexie.Table<IStudent, number>;
  courses!: Dexie.Table<ICourse, number>;
  teachers!: Dexie.Table<ITeacher, number>;
  enrollments!: Dexie.Table<IEnrollment, number>;
  resources!: Dexie.Table<IResource, number>;
  services!: Dexie.Table<IService, number>;
  studentServices!: Dexie.Table<IStudentService, number>;

  constructor() {
    super('SchoolManagementDB');
    
    // Définition du schéma de la base de données
    this.version(1).stores({
      students: '++id, name, email, grade, createdAt',
      courses: '++id, name, description, courseType, startDate, endDate, teacherId',
      teachers: '++id, name, email, specialization, createdAt',
      enrollments: '++id, studentId, courseId, enrollmentDate, grade',
      resources: '++id, name, type, status, lastReservationDate',
      services: '++id, name, description, cost',
      studentServices: '++id, studentId, serviceId, startDate, endDate'
    });
  }
}

// Export d'une instance unique de la base de données
export const db = new SchoolDatabase();

// Interfaces pour les modèles
export interface IStudent {
  id?: number;
  name: string;
  email: string;
  grade: string;
  createdAt: Date;
}

export interface ICourse {
  id?: number;
  name: string;
  description: string;
  courseType: string;
  startDate: Date;
  endDate: Date;
  teacherId: number;
}

export interface ITeacher {
  id?: number;
  name: string;
  email: string;
  specialization: string;
  createdAt: Date;
}

export interface IEnrollment {
  id?: number;
  studentId: number;
  courseId: number;
  enrollmentDate: Date;
  grade?: number;
}

export interface IResource {
  id?: number;
  name: string;
  type: string;
  status: 'available' | 'inUse' | 'maintenance';
  lastReservationDate?: Date;
}

export interface IService {
  id?: number;
  name: string;
  description: string;
  cost: number;
}

export interface IStudentService {
  id?: number;
  studentId: number;
  serviceId: number;
  startDate: Date;
  endDate?: Date;
} 