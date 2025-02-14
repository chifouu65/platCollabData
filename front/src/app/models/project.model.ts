// front/src/app/models/project.model.ts
import { Comment } from './comment.model';
import { ProjectStats } from './project-stats.model';

export interface Project {
  _id: string; // Optionnel pour les nouveaux projets
  nom: string;
  description: string;
  datasets: Dataset[]; // Liste des datasets
  comments?: Comment[]; // Add comments property
  stats?: ProjectStats;
}

export interface Dataset {
  type: 'image' | 'audio' | 'video' | 'text'; // Type du dataset
  url?: string; // Lien vers le fichier, seulement pour 'image', 'audio' ou 'video'
  texte?: string; // Contenu textuel, seulement pour 'text'
  metadata?: Record<string, any>; // Métadonnées flexibles
}
