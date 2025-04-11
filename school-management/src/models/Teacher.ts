import { ITeacher } from '../database/SchoolDatabase';

// Décorateur pour ajouter des fonctionnalités au Teacher
export function WithQualifications(target: any) {
  return class extends target {
    private qualifications: string[] = [];
    
    addQualification(qualification: string) {
      this.qualifications.push(qualification);
    }
    
    getQualifications(): string[] {
      return this.qualifications;
    }
  };
}

// Classe de base pour Teacher
export class Teacher implements ITeacher {
  id?: number;
  name: string;
  email: string;
  specialization: string;
  createdAt: Date;

  constructor(data: ITeacher) {
    this.name = data.name;
    this.email = data.email;
    this.specialization = data.specialization;
    this.createdAt = data.createdAt;
    if (data.id) this.id = data.id;
  }

  // Méthode pour convertir en objet simple pour le stockage
  toJSON(): ITeacher {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      specialization: this.specialization,
      createdAt: this.createdAt
    };
  }

  // Méthode pour créer une instance à partir des données JSON
  static fromJSON(data: ITeacher): Teacher {
    return new Teacher(data);
  }
}

// Création d'une classe Teacher avec le décorateur
export const QualifiedTeacher = WithQualifications(Teacher); 