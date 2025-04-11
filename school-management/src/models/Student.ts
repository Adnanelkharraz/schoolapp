import { IStudent } from '../database/SchoolDatabase';

// Classe de base Student
export class Student implements IStudent {
  id?: number;
  name: string;
  email: string;
  grade: string;
  createdAt: Date;

  constructor(data: Omit<IStudent, 'createdAt'> & { createdAt?: Date }) {
    this.name = data.name;
    this.email = data.email;
    this.grade = data.grade;
    this.createdAt = data.createdAt || new Date();
    if (data.id) this.id = data.id;
  }

  // Méthode pour convertir l'objet en format stockable
  toJSON(): IStudent {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      grade: this.grade,
      createdAt: this.createdAt
    };
  }

  // Méthode pour créer une instance à partir des données de la base
  static fromJSON(data: IStudent): Student {
    return new Student(data);
  }
}

// Interface Decorator pour les services additionnels
export interface IStudentDecorator extends IStudent {
  getDescription(): string;
  getCost(): number;
}

// Interface commune pour tous les objets décorés
export interface IDecoratedStudent extends IStudentDecorator {}

// Classe pour implémenter le pattern Decorator
export class StudentWithServices implements IDecoratedStudent {
  protected _student: Student;
  
  constructor(student: Student) {
    this._student = student;
  }

  // Implémentation des propriétés de l'interface IStudent
  get id(): number | undefined {
    return this._student.id;
  }

  get name(): string {
    return this._student.name;
  }

  set name(value: string) {
    this._student.name = value;
  }

  get email(): string {
    return this._student.email;
  }

  set email(value: string) {
    this._student.email = value;
  }

  get grade(): string {
    return this._student.grade;
  }

  set grade(value: string) {
    this._student.grade = value;
  }

  get createdAt(): Date {
    return this._student.createdAt;
  }

  // Méthodes du décorateur
  getDescription(): string {
    return `Élève : ${this.name}, Grade: ${this.grade}`;
  }

  getCost(): number {
    return 0; // Coût de base sans services supplémentaires
  }

  // Conversion en format JSON
  toJSON(): IStudent {
    return this._student.toJSON();
  }
}

// Classe de base pour les services additionnels (pattern Decorator)
export abstract class StudentServiceDecorator implements IDecoratedStudent {
  protected _decorated: IDecoratedStudent;
  protected _cost: number;
  protected _description: string;

  constructor(student: IDecoratedStudent, cost: number, description: string) {
    this._decorated = student;
    this._cost = cost;
    this._description = description;
  }

  get id(): number | undefined {
    return this._decorated.id;
  }

  get name(): string {
    return this._decorated.name;
  }

  set name(value: string) {
    this._decorated.name = value;
  }

  get email(): string {
    return this._decorated.email;
  }

  set email(value: string) {
    this._decorated.email = value;
  }

  get grade(): string {
    return this._decorated.grade;
  }

  set grade(value: string) {
    this._decorated.grade = value;
  }

  get createdAt(): Date {
    return this._decorated.createdAt;
  }

  getDescription(): string {
    return `${this._decorated.getDescription()}, ${this._description}`;
  }

  getCost(): number {
    return this._decorated.getCost() + this._cost;
  }

  // Conversion en format JSON
  toJSON(): IStudent {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      grade: this.grade,
      createdAt: this.createdAt
    };
  }
}

// Services spécifiques qui étendent le décorateur de base
export class TutoringService extends StudentServiceDecorator {
  constructor(student: IDecoratedStudent, hours: number = 1) {
    const cost = hours * 25; // 25€ de l'heure
    super(student, cost, `Service de tutorat (${hours}h)`);
  }
}

export class SportsActivitiesService extends StudentServiceDecorator {
  constructor(student: IDecoratedStudent, activityType: string) {
    super(student, 50, `Activité sportive: ${activityType}`);
  }
}

export class ArtsClassService extends StudentServiceDecorator {
  constructor(student: IDecoratedStudent, artType: string) {
    super(student, 35, `Cours d'art: ${artType}`);
  }
} 