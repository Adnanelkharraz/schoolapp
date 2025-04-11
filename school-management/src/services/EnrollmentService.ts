import { db, IEnrollment } from '../database/SchoolDatabase';
import { studentDAO } from '../daos/StudentDAO';
import { courseDAO } from '../daos/CourseDAO';

// Service pour gérer les inscriptions des étudiants aux cours
export class EnrollmentService {
  // Inscrire un étudiant à un cours
  async enrollStudent(studentId: number, courseId: number): Promise<{
    success: boolean;
    message: string;
    enrollmentId?: number;
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

      // Vérifier si le cours existe
      const course = await courseDAO.getById(courseId);
      if (!course) {
        return {
          success: false,
          message: "Le cours n'existe pas"
        };
      }

      // Vérifier si l'étudiant est déjà inscrit au cours
      const existingEnrollment = await db.enrollments
        .where({
          studentId: studentId,
          courseId: courseId
        })
        .first();

      if (existingEnrollment) {
        return {
          success: false,
          message: "L'étudiant est déjà inscrit à ce cours",
          enrollmentId: existingEnrollment.id
        };
      }

      // Créer une nouvelle inscription
      const enrollmentId = await db.enrollments.add({
        studentId,
        courseId,
        enrollmentDate: new Date()
      });

      return {
        success: true,
        message: "Inscription réussie",
        enrollmentId
      };
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      return {
        success: false,
        message: "Une erreur est survenue lors de l'inscription"
      };
    }
  }

  // Désinscrire un étudiant d'un cours
  async unenrollStudent(studentId: number, courseId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Trouver l'inscription
      const enrollment = await db.enrollments
        .where({
          studentId: studentId,
          courseId: courseId
        })
        .first();

      if (!enrollment) {
        return {
          success: false,
          message: "L'étudiant n'est pas inscrit à ce cours"
        };
      }

      // Supprimer l'inscription
      await db.enrollments.delete(enrollment.id!);

      return {
        success: true,
        message: "Désinscription réussie"
      };
    } catch (error) {
      console.error("Erreur lors de la désinscription:", error);
      return {
        success: false,
        message: "Une erreur est survenue lors de la désinscription"
      };
    }
  }

  // Ajouter une note à un étudiant pour un cours
  async assignGrade(studentId: number, courseId: number, grade: number): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      if (grade < 0 || grade > 20) {
        return {
          success: false,
          message: "La note doit être comprise entre 0 et 20"
        };
      }

      // Trouver l'inscription
      const enrollment = await db.enrollments
        .where({
          studentId: studentId,
          courseId: courseId
        })
        .first();

      if (!enrollment) {
        return {
          success: false,
          message: "L'étudiant n'est pas inscrit à ce cours"
        };
      }

      // Mettre à jour la note
      await db.enrollments.update(enrollment.id!, { grade });

      return {
        success: true,
        message: "Note attribuée avec succès"
      };
    } catch (error) {
      console.error("Erreur lors de l'attribution de la note:", error);
      return {
        success: false,
        message: "Une erreur est survenue lors de l'attribution de la note"
      };
    }
  }

  // Obtenir le relevé de notes d'un étudiant
  async getStudentGrades(studentId: number): Promise<{
    studentName: string;
    grades: {
      courseId: number;
      courseName: string;
      grade: number | null;
    }[];
    averageGrade: number | null;
  }> {
    // Récupérer l'étudiant
    const student = await studentDAO.getById(studentId);
    if (!student) {
      throw new Error("Étudiant non trouvé");
    }

    // Récupérer toutes les inscriptions de l'étudiant
    const enrollments = await db.enrollments
      .where('studentId')
      .equals(studentId)
      .toArray();

    // Récupérer les informations des cours
    const grades = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await courseDAO.getById(enrollment.courseId);
        return {
          courseId: enrollment.courseId,
          courseName: course?.name || "Cours inconnu",
          grade: enrollment.grade || null
        };
      })
    );

    // Calculer la moyenne des notes
    const validGrades = grades.filter(g => g.grade !== null).map(g => g.grade!);
    const averageGrade = validGrades.length > 0
      ? validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length
      : null;

    return {
      studentName: student.name,
      grades,
      averageGrade
    };
  }

  // Obtenir la liste des étudiants inscrits à un cours avec leurs notes
  async getCourseStudentsWithGrades(courseId: number): Promise<{
    courseName: string;
    students: {
      studentId: number;
      studentName: string;
      grade: number | null;
    }[];
    averageGrade: number | null;
  }> {
    // Récupérer le cours
    const course = await courseDAO.getById(courseId);
    if (!course) {
      throw new Error("Cours non trouvé");
    }

    // Récupérer toutes les inscriptions pour ce cours
    const enrollments = await db.enrollments
      .where('courseId')
      .equals(courseId)
      .toArray();

    // Récupérer les informations des étudiants
    const students = await Promise.all(
      enrollments.map(async (enrollment) => {
        const student = await studentDAO.getById(enrollment.studentId);
        return {
          studentId: enrollment.studentId,
          studentName: student?.name || "Étudiant inconnu",
          grade: enrollment.grade || null
        };
      })
    );

    // Calculer la moyenne des notes
    const validGrades = students.filter(s => s.grade !== null).map(s => s.grade!);
    const averageGrade = validGrades.length > 0
      ? validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length
      : null;

    return {
      courseName: course.name,
      students,
      averageGrade
    };
  }
}

// Export d'une instance du service
export const enrollmentService = new EnrollmentService(); 