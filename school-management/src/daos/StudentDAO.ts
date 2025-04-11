import { db, IStudent } from '../database/SchoolDatabase';
import { BaseDAO } from './BaseDAO';
import { Student } from '../models/Student';

export class StudentDAO extends BaseDAO<IStudent, number> {
  constructor() {
    super(db.students);
  }

  // Méthodes spécifiques aux étudiants
  
  // Rechercher des étudiants par nom
  async searchByName(name: string): Promise<IStudent[]> {
    return await db.students
      .filter(student => student.name.toLowerCase().includes(name.toLowerCase()))
      .toArray();
  }

  // Rechercher des étudiants par grade/niveau
  async getByGrade(grade: string): Promise<IStudent[]> {
    return await db.students
      .where('grade')
      .equals(grade)
      .toArray();
  }

  // Obtenir tous les étudiants inscrits à un cours spécifique
  async getStudentsByCourse(courseId: number): Promise<IStudent[]> {
    // Trouver d'abord toutes les inscriptions pour ce cours
    const enrollments = await db.enrollments
      .where('courseId')
      .equals(courseId)
      .toArray();
    
    // Extraire les IDs des étudiants
    const studentIds = enrollments.map(enrollment => enrollment.studentId);
    
    // Pas d'inscriptions trouvées
    if (studentIds.length === 0) {
      return [];
    }
    
    // Récupérer les étudiants correspondants
    return await this.getByIds(studentIds);
  }

  // Conversion vers le modèle complet
  mapToModel(data: IStudent): Student {
    return Student.fromJSON(data);
  }

  // Conversion d'une liste vers des modèles
  mapToModels(data: IStudent[]): Student[] {
    return data.map(item => this.mapToModel(item));
  }
}

// Export d'une instance du DAO
export const studentDAO = new StudentDAO(); 