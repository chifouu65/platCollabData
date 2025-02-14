import { Comment } from './comment.model';

export interface Annotation {
  type: 'boundingBox' | 'polygonMask' | 'draw' | 'highlight' | 'keywords';
  coordinates: any;
  color: string;
  metadata?: {
    labels?: string[];
    confidence?: number;
    keywords?: string[];
    timestamp?: Date;
    comments?: Comment[];
  };
}
