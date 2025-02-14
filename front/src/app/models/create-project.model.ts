export interface CreateProjectDto {
  _id?: string; // Optionnel pour les nouveaux projets
  nom: string;
  description: string;
  datasets: Dataset[]; // Liste des datasets
}

export interface Dataset {
  type: 'image' | 'audio' | 'video' | 'text'; // Type du dataset
  url?: string; // Lien vers le fichier, seulement pour 'image', 'audio' ou 'video'
  texte?: string; // Contenu textuel, seulement pour 'text'
  metadata?: Record<string, any>; // Métadonnées flexibles
}
