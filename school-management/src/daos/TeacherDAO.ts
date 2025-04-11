import { db, ITeacher } from '../database/SchoolDatabase';
import { BaseDAO } from './BaseDAO';

export class TeacherDAO extends BaseDAO<ITeacher, number> {
  constructor() {
    super(db.teachers);
  }

  // Méthodes spécifiques aux enseignants
  
  // Rechercher des enseignants par nom
  async searchByName(name: string): Promise<ITeacher[]> {
    return await db.teachers
      .filter(teacher => teacher.name.toLowerCase().includes(name.toLowerCase()))
      .toArray();
  }

  // Rechercher des enseignants par spécialisation
  async getBySpecialization(specialization: string): Promise<ITeacher[]> {
    return await db.teachers
      .where('specialization')
      .equals(specialization)
      .toArray();
  }

  // Obtenir tous les enseignants avec leurs cours
  async getTeachersWithCourses(): Promise<Array<ITeacher & { coursesCount: number }>> {
    const teachers = await this.getAll();
    
    // Pour chaque enseignant, compter les cours
    const teachersWithCourses = await Promise.all(
      teachers.map(async (teacher) => {
        const courses = await db.courses
          .where('teacherId')
          .equals(teacher.id!)
          .toArray();
        
        return {
          ...teacher,
          coursesCount: courses.length
        };
      })
    );
    
    return teachersWithCourses;
  }
}

// Export d'une instance du DAO
export const teacherDAO = new TeacherDAO(); 