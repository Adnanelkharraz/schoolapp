import { db, ICourse } from '../database/SchoolDatabase';
import { BaseDAO } from './BaseDAO';
import { Course, CourseFactory } from '../models/Course';

export class CourseDAO extends BaseDAO<ICourse, number> {
  constructor() {
    super(db.courses);
  }

  // Méthodes spécifiques aux cours
  
  // Rechercher des cours par nom
  async searchByName(name: string): Promise<ICourse[]> {
    return await db.courses
      .filter(course => course.name.toLowerCase().includes(name.toLowerCase()))
      .toArray();
  }

  // Obtenir les cours par type
  async getByType(courseType: string): Promise<ICourse[]> {
    return await db.courses
      .where('courseType')
      .equals(courseType)
      .toArray();
  }

  // Obtenir les cours d'un professeur spécifique
  async getCoursesByTeacher(teacherId: number): Promise<ICourse[]> {
    return await db.courses
      .where('teacherId')
      .equals(teacherId)
      .toArray();
  }

  // Obtenir les cours actifs (dates de début et fin)
  async getActiveCourses(): Promise<ICourse[]> {
    const now = new Date();
    
    return await db.courses
      .filter(course => {
        const startDate = new Date(course.startDate);
        const endDate = new Date(course.endDate);
        return startDate <= now && endDate >= now;
      })
      .toArray();
  }

  // Obtenir les cours à venir
  async getUpcomingCourses(): Promise<ICourse[]> {
    const now = new Date();
    
    return await db.courses
      .filter(course => {
        const startDate = new Date(course.startDate);
        return startDate > now;
      })
      .toArray();
  }

  // Obtenir les cours auxquels un étudiant est inscrit
  async getCoursesByStudent(studentId: number): Promise<ICourse[]> {
    // Trouver d'abord toutes les inscriptions pour cet étudiant
    const enrollments = await db.enrollments
      .where('studentId')
      .equals(studentId)
      .toArray();
    
    // Extraire les IDs des cours
    const courseIds = enrollments.map(enrollment => enrollment.courseId);
    
    // Pas d'inscriptions trouvées
    if (courseIds.length === 0) {
      return [];
    }
    
    // Récupérer les cours correspondants
    return await this.getByIds(courseIds);
  }

  // Conversion vers le modèle complet en utilisant la Factory
  mapToModel(data: ICourse): Course {
    return CourseFactory.fromJSON(data);
  }

  // Conversion d'une liste vers des modèles
  mapToModels(data: ICourse[]): Course[] {
    return data.map(item => this.mapToModel(item));
  }
}

// Export d'une instance du DAO
export const courseDAO = new CourseDAO(); 