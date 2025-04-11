import { ICourse } from '../database/SchoolDatabase';

// Classe de base pour les cours
export abstract class Course implements ICourse {
  id?: number;
  name: string;
  description: string;
  courseType: string;
  startDate: Date;
  endDate: Date;
  teacherId: number;

  constructor(data: ICourse) {
    this.name = data.name;
    this.description = data.description;
    this.courseType = data.courseType;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.teacherId = data.teacherId;
    if (data.id) this.id = data.id;
  }

  // Méthodes abstraites à implémenter par les sous-classes
  abstract getCourseMaterials(): string[];
  abstract getRequiredEquipment(): string[];
  abstract getDifficulty(): 'easy' | 'medium' | 'hard';

  // Méthode pour convertir l'objet en format stockable
  toJSON(): ICourse {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      courseType: this.courseType,
      startDate: this.startDate,
      endDate: this.endDate,
      teacherId: this.teacherId
    };
  }
}

// Cours de mathématiques
export class MathCourse extends Course {
  constructor(data: Omit<ICourse, 'courseType'>) {
    super({
      ...data,
      courseType: 'math'
    });
  }

  getCourseMaterials(): string[] {
    return ['Manuel de mathématiques', 'Calculatrice', 'Cahier d\'exercices'];
  }

  getRequiredEquipment(): string[] {
    return ['Calculatrice scientifique'];
  }

  getDifficulty(): 'easy' | 'medium' | 'hard' {
    return 'medium';
  }
}

// Cours de sciences
export class ScienceCourse extends Course {
  constructor(data: Omit<ICourse, 'courseType'>) {
    super({
      ...data,
      courseType: 'science'
    });
  }

  getCourseMaterials(): string[] {
    return ['Manuel de sciences', 'Guide de laboratoire', 'Journal d\'expériences'];
  }

  getRequiredEquipment(): string[] {
    return ['Équipement de laboratoire', 'Blouse', 'Lunettes de protection'];
  }

  getDifficulty(): 'easy' | 'medium' | 'hard' {
    return 'hard';
  }
}

// Cours d'histoire
export class HistoryCourse extends Course {
  constructor(data: Omit<ICourse, 'courseType'>) {
    super({
      ...data,
      courseType: 'history'
    });
  }

  getCourseMaterials(): string[] {
    return ['Manuel d\'histoire', 'Atlas historique', 'Documents d\'archives'];
  }

  getRequiredEquipment(): string[] {
    return [];
  }

  getDifficulty(): 'easy' | 'medium' | 'hard' {
    return 'easy';
  }
}

// Cours de langue
export class LanguageCourse extends Course {
  private language: string;

  constructor(data: Omit<ICourse, 'courseType'>, language: string) {
    super({
      ...data,
      courseType: 'language'
    });
    this.language = language;
  }

  getCourseMaterials(): string[] {
    return [`Manuel de ${this.language}`, 'Dictionnaire', 'Cahier d\'exercices'];
  }

  getRequiredEquipment(): string[] {
    return ['Casque audio pour les exercices d\'écoute'];
  }

  getDifficulty(): 'easy' | 'medium' | 'hard' {
    return 'medium';
  }
}

// Pattern Factory Method pour la création de cours
export class CourseFactory {
  // Méthode statique pour créer différents types de cours sans exposer la logique d'instanciation
  static createCourse(type: string, courseData: Omit<ICourse, 'courseType'>): Course {
    switch (type.toLowerCase()) {
      case 'math':
        return new MathCourse(courseData);
      case 'science':
        return new ScienceCourse(courseData);
      case 'history':
        return new HistoryCourse(courseData);
      case 'french':
        return new LanguageCourse(courseData, 'français');
      case 'english':
        return new LanguageCourse(courseData, 'anglais');
      case 'spanish':
        return new LanguageCourse(courseData, 'espagnol');
      default:
        throw new Error(`Type de cours non supporté: ${type}`);
    }
  }

  // Méthode pour créer un cours à partir des données de la base
  static fromJSON(data: ICourse): Course {
    return this.createCourse(data.courseType, data);
  }
} 