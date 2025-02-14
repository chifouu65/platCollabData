import {
  Component, Input, ElementRef, AfterViewInit, viewChild, signal, computed, effect, Signal, Output, EventEmitter
} from '@angular/core';
import { AnnotationService } from '../../services/annotation.service';
import { NgIf, NgFor } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Comment } from '../../models/comment.model';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

interface Point {
  x: number;
  y: number;
}

export interface Annotation {
  type: 'boundingBox' | 'polygonMask' | 'draw' | 'highlight' | 'keywords';
  coordinates: any;
  metadata?: {
    labels?: string[];
    confidence?: number;
    keywords?: string[];
    timestamp?: Date;
    comments?: Comment[];
  };
  color: string;
}

interface BoundingBoxCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnnotationGroup {
  _id?: string;
  name: string;
  annotations: Annotation[];
  isDeleted?: boolean;
  createdAt?: Date;
}

/**
 * Composant gérant le canvas pour les annotations
 * Permet de dessiner et gérer différents types d'annotations (boundingBox, polygonMask, draw)
 */
@Component({
  selector: 'app-canvas',
  template: `
    <div class="canvas-container">
      <div class="controls">
        <div class="color-picker">
          <input
            type="color"
            [value]="currentColor()"
            (change)="setColor($event)"
            title="Choisir une couleur"
          >
          <span class="current-color">Couleur: {{currentColor()}}</span>
        </div>
        <div class="metadata-controls" *ngIf="selectedAnnotation()">
          <div class="labels-input">
            <input #labelInput type="text" placeholder="Ajouter un label" (keyup.enter)="addLabel(labelInput.value); labelInput.value = ''">
            <div class="labels-list">
              <span *ngFor="let label of selectedAnnotation()?.metadata?.labels || []" class="label">
                {{label}} <button (click)="removeLabel(label)">×</button>
              </span>
            </div>
          </div>
          <div class="confidence-input">
            <input type="range" [value]="selectedAnnotation()?.metadata?.confidence || 0.5"
                   (input)="updateConfidence($event)" min="0" max="1" step="0.1">
            <span>Confiance: {{selectedAnnotation()?.metadata?.confidence || 0.5}}</span>
          </div>
        </div>
        <div class="keywords-input" *ngIf="selectedTool() === 'keywords'">
        <mat-form-field class="pt-2">
          <mat-label>Mot-clé</mat-label>
          <input #keywordInput type="text" placeholder="Ajouter un mot-clé"
          (keyup.enter)="addKeyword(keywordInput.value); keywordInput.value = ''" matInput  />
        </mat-form-field>
            <div class="keywords-list">
              <span *ngFor="let keyword of selectedAnnotation()?.metadata?.keywords || []" class="keyword">
                {{keyword}} <button (click)="removeKeyword(keyword)">×</button>
              </span>
            </div>
          </div>
        <div class="actions">
          <<ng-content></ng-content>
          <button (click)="resetCanvas()">Reset</button>
        </div>
      </div>

      <div class="flex justify-center">
        <canvas #canvas
          [width]="width()"
          [height]="height()"
          (mousedown)="onMouseDown($event)"
          (mousemove)="onMouseMove($event)"
          (mouseup)="onMouseUp($event)">
        </canvas>

        <div class="metadata-list" *ngIf="annotations().length > 0">
          <h3>Annotations sauvegardées</h3>
          <ul>
            <li *ngFor="let annotation of annotations(); let i = index"
                (click)="selectAnnotation(i)"
                [class.selected]="selectedAnnotationIndex() === i">
              {{ annotation.type }} -
              {{ formatMetadata(annotation.metadata) }}
              <span class="color-preview" [style.background-color]="annotation.color"></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .canvas-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    canvas {
      border: 1px solid #000;
      width: 400px;
      height: 400px;
    }
    .color-picker {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .current-color {
      font-size: 14px;
    }
    input[type="color"] {
      width: 50px;
      height: 30px;
      padding: 0;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .metadata-list {
      margin-top: 20px;
      padding: 10px;
      border-radius: 4px;
    }
    .metadata-list ul {
      list-style: none;
      padding: 0;
    }
    .metadata-list li {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 5px 0;
    }
    .color-preview {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 1px solid #ddd;
    }
    .actions {
      display: flex;
      gap: 10px;
    }
    button {
      padding: 5px 15px;
      border: none;
      border-radius: 4px;
      background: #007bff;
      color: white;
      cursor: pointer;
    }
    button:hover {
      background: #0056b3;
    }
    .metadata-controls {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px;
      border-radius: 4px;
    }
    .labels-input, .keywords-input {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .label, .keyword {
      display: inline-flex;
      align-items: center;
      background: #e9ecef;
      padding: 2px 8px;
      border-radius: 12px;
      margin: 2px;
      font-size: 12px;
    }
    .label button, .keyword button {
      border: none;
      background: none;
      margin-left: 5px;
      cursor: pointer;
      color: #666;
    }
    .selected {
      background: #e3f2fd;
    }
    .confidence-input {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  `],
  imports: [NgIf, NgFor,    MatFormFieldModule,
    MatInputModule,FormsModule],
  standalone: true
})
export class CanvasComponent implements AfterViewInit {
  @Input() projectId!: string;

  /**
   * Référence au canvas HTML
   */
  private canvas = viewChild<ElementRef>('canvas');

  /**
   * Contexte 2D du canvas pour le dessin
   */
  private cx!: CanvasRenderingContext2D;

  /**
   * État du dessin en cours
   */
  private isDrawing = signal(false);

  /**
   * Position de départ pour le dessin en cours
   */
  private startPosition = signal<Point>({ x: 0, y: 0 });

  /**
   * Chemin en cours pour l'outil de dessin à main levée
   */
  private currentPath = signal<Point[]>([]);

  /**
   * Liste des annotations actuelles sur le canvas
   */
  private currentAnnotations = signal<Annotation[]>([]);

  /**
   * Outil de dessin sélectionné
   */
  selectedTool = signal<string>('boundingBox');

  /**
   * Couleur actuelle pour le dessin
   */
   currentColor = signal<string>('#000000');

  // Signaux pour les dimensions
  readonly width = signal<number>(400);
  readonly height = signal<number>(400);

  annotations = signal<Annotation[]>([]);

  JSON: any;

   selectedAnnotationIndex = signal<number | null>(null);

  protected selectedAnnotation = computed(() => {
    const index = this.selectedAnnotationIndex();
    return index !== null ? this.annotations()[index] : null;
  });

  public newComment: string = '';

  @Output() annotationsChange = new EventEmitter<Annotation[]>();

  constructor(private annotationService: AnnotationService) {
    // Effect pour le rendu automatique quand les annotations changent
    effect(() => {
      if (this.cx) {
        this.render();
      }
    });
  }

  /**
   * Initialise le canvas après le chargement de la vue
   */
  public ngAfterViewInit() {
    // Initialisation du contexte du canvas
    const canvasEl = this.canvas()?.nativeElement;
    if (!canvasEl) {
      console.error('Canvas element not found');
      return;
    }
    this.cx = canvasEl.getContext('2d')!;

    // Définir les dimensions du canvas
    canvasEl.width = canvasEl.offsetWidth;
    canvasEl.height = canvasEl.offsetHeight;

    // Configuration du style par défaut
    this.cx.lineWidth = 2;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = this.currentColor();
  }

  /**
   * Convertit les coordonnées de la souris en coordonnées relatives au canvas
   * @param event - L'événement souris à convertir
   * @returns Point - Les coordonnées {x, y} relatives au canvas
   */
  private getMousePos(event: MouseEvent): Point {
    const rect = this.canvas()!.nativeElement.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  /**
   * Calcule les dimensions d'une boundingBox à partir des points de début et de fin
   * @param startPos - Point de départ {x, y}
   * @param endPos - Point d'arrivée {x, y}
   * @returns BoundingBoxCoordinates - Les coordonnées et dimensions de la boîte
   */
  private calculateBoundingBox(startPos: Point, endPos: Point): BoundingBoxCoordinates {
    return {
      x: Math.min(startPos.x, endPos.x),      // Position X la plus à gauche
      y: Math.min(startPos.y, endPos.y),      // Position Y la plus haute
      width: Math.abs(endPos.x - startPos.x),  // Largeur positive
      height: Math.abs(endPos.y - startPos.y)  // Hauteur positive
    };
  }

  /**
   * Calcule les points d'un polygone triangulaire
   * @param startPos - Point de départ {x, y}
   * @param endPos - Point d'arrivée {x, y}
   * @returns Point[] - Tableau des points formant le triangle
   */
  private calculatePolygonPoints(startPos: Point, endPos: Point): Point[] {
    return [
      { x: startPos.x, y: startPos.y },           // Sommet du triangle
      { x: endPos.x, y: startPos.y },             // Point droit
      { x: endPos.x, y: endPos.y }                // Point bas
    ];
  }

  /**
   * Calcule l'échelle du canvas par rapport à sa taille d'affichage
   * @returns {width: number, height: number} - Facteurs d'échelle
   */
  private getCanvasScale(): { width: number; height: number } {
    const canvas = this.canvas()!.nativeElement;
    return {
      width: canvas.width / canvas.offsetWidth,
      height: canvas.height / canvas.offsetHeight
    };
  }

  /**
   * Ajuste les coordonnées en fonction de l'échelle du canvas
   * @param point - Point à ajuster {x, y}
   * @returns Point - Coordonnées ajustées à l'échelle
   */
  private scaleCoordinates(point: Point): Point {
    const scale = this.getCanvasScale();
    return {
      x: point.x * scale.width,
      y: point.y * scale.height
    };
  }

  /**
   * Calcule la distance entre deux points
   * @param p1 - Premier point {x, y}
   * @param p2 - Second point {x, y}
   * @returns number - Distance en pixels
   */
  private calculateDistance(p1: Point, p2: Point): number {
    return Math.sqrt(
      Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
    );
  }

  /**
   * Vérifie si un point est à l'intérieur d'une boundingBox
   * @param point - Point à vérifier {x, y}
   * @param box - BoundingBox à tester
   * @returns boolean - true si le point est dans la boîte
   */
  private isPointInBox(point: Point, box: BoundingBoxCoordinates): boolean {
    return (
      point.x >= box.x &&
      point.x <= box.x + box.width &&
      point.y >= box.y &&
      point.y <= box.y + box.height
    );
  }

  /**
   * Calcule le centre d'une boundingBox
   * @param box - BoundingBox dont on veut le centre
   * @returns Point - Coordonnées du centre
   */
  private calculateBoxCenter(box: BoundingBoxCoordinates): Point {
    return {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2
    };
  }

  /**
   * Définit l'outil de dessin à utiliser
   * @param tool - Nom de l'outil ('boundingBox', 'polygonMask', 'draw')
   */
  public setTool(tool: string) {
    this.selectedTool.set(tool);
    if (tool !== 'draw') {
      this.isDrawing.set(false);
      this.currentPath.set([]);
    }
  }

  /**
   * Gère l'événement mousedown sur le canvas
   * Initialise le début d'un dessin
   * @param event - Événement souris
   */
  onMouseDown(event: MouseEvent) {
    const pos = this.getMousePos(event);
    this.isDrawing.set(true);
    this.startPosition.set(pos);

    if (this.selectedTool() === 'draw') {
      // Commencer un nouveau chemin avec le point initial
      this.currentPath.set([pos]);
    }
  }

  /**
   * Gère l'événement mousemove sur le canvas
   * Met à jour le dessin en cours
   * @param event - Événement souris
   */
  onMouseMove(event: MouseEvent) {
    if (!this.isDrawing()) return;

    const pos = this.getMousePos(event);

    // Effacer et redessiner tout
    this.cx.clearRect(0, 0, this.canvas()!.nativeElement.width, this.canvas()!.nativeElement.height);

    // Redessiner toutes les annotations existantes
    this.renderExistingAnnotations();

    // Dessiner l'annotation en cours
    this.cx.beginPath();
    this.cx.strokeStyle = this.currentColor();

    switch (this.selectedTool()) {
      case 'draw':
        // Ajouter le point au chemin courant
        this.currentPath.update(path => [...path, pos]);

        // Dessiner le chemin courant
        const points = this.currentPath();
        if (points.length > 0) {
          this.cx.moveTo(points[0].x, points[0].y);
          points.forEach(point => this.cx.lineTo(point.x, point.y));
        }
        break;

      case 'boundingBox':
        const start = this.startPosition();
        this.cx.strokeRect(
          Math.min(start.x, pos.x),
          Math.min(start.y, pos.y),
          Math.abs(pos.x - start.x),
          Math.abs(pos.y - start.y)
        );
        break;

      case 'polygonMask':
        const startPos = this.startPosition();
        this.cx.moveTo(startPos.x, startPos.y);
        this.cx.lineTo(pos.x, startPos.y);
        this.cx.lineTo(pos.x, pos.y);
        this.cx.lineTo(startPos.x, startPos.y);
        break;

    }

    this.cx.stroke();
  }

  /**
   * Gère l'événement mouseup sur le canvas
   * Finalise le dessin en cours et crée l'annotation
   * @param event - Événement souris
   */
  onMouseUp(event: MouseEvent) {
    if (!this.isDrawing()) return;

    const pos = this.getMousePos(event);
    let newAnnotation: Annotation | null = null;

    switch (this.selectedTool()) {
      case 'draw':
        // Ajouter le dernier point et créer l'annotation
        this.currentPath.update(path => [...path, pos]);
        if (this.currentPath().length > 1) {
          newAnnotation = {
            type: 'draw',
            coordinates: [...this.currentPath()],
            color: this.currentColor()
          };
        }
        this.currentPath.set([]); // Réinitialiser le chemin
        break;

      case 'boundingBox':
        const start = this.startPosition();
        const coordinates: BoundingBoxCoordinates = this.calculateBoundingBox(start, pos);

        newAnnotation = {
          type: 'boundingBox',
          coordinates,
          color: this.currentColor()
        };
        break;

      case 'polygonMask':
        const startPos = this.startPosition();
        const points = this.calculatePolygonPoints(startPos, pos);
        newAnnotation = {
          type: 'polygonMask',
          coordinates: points,
          color: this.currentColor()
        };
        break;
    }

    if (newAnnotation) {
      console.log('Nouvelle annotation créée:', newAnnotation);
      this.currentAnnotations.update(annotations => [...annotations, newAnnotation!]);
    }

    this.isDrawing.set(false);
  }

  /**
   * Dessine toutes les annotations existantes sur le canvas
   */
  private renderExistingAnnotations() {
    this.currentAnnotations().forEach(annotation => {
    this.cx.beginPath();
      this.cx.strokeStyle = annotation.color;

      switch (annotation.type) {
        case 'boundingBox':
          const box = annotation.coordinates as BoundingBoxCoordinates;
          if (box && typeof box.x === 'number') {
            this.cx.strokeRect(box.x, box.y, box.width, box.height);
          }
          break;

        case 'draw':
          const points = annotation.coordinates as Point[];
          if (points && points.length > 0) {
            this.cx.moveTo(points[0].x, points[0].y);
            points.forEach(point => this.cx.lineTo(point.x, point.y));
          }
          break;

        case 'polygonMask':
          const coords = annotation.coordinates as Point[];
          if (coords && coords.length > 0) {
            this.cx.moveTo(coords[0].x, coords[0].y);
            coords.forEach(point => this.cx.lineTo(point.x, point.y));
            this.cx.lineTo(coords[0].x, coords[0].y); // Fermer le polygone
          }
          break;
      }

      this.cx.stroke();
    });
  }

  /**
   * Ajoute des métadonnées à la dernière annotation
   * @param metadata - Métadonnées à ajouter (labels, confidence, etc.)
   */
  public addMetadata(metadata: any) {
    const currentAnnotations = this.currentAnnotations();
    if (currentAnnotations.length === 0) {
      console.warn('Aucune annotation à modifier');
      return;
    }

    // Mise à jour de la dernière annotation avec les métadonnées
    const lastIndex = currentAnnotations.length - 1;
    this.currentAnnotations.update(annotations => {
      const updatedAnnotations = [...annotations];
      updatedAnnotations[lastIndex] = {
        ...updatedAnnotations[lastIndex],
        metadata: {
          ...updatedAnnotations[lastIndex].metadata,
          ...metadata,
          timestamp: new Date()
        }
      };
      console.log('Métadonnées ajoutées:', updatedAnnotations[lastIndex]);
      return updatedAnnotations;
    });
  }

  /**
   * Sauvegarde le groupe d'annotations actuel
   * @returns Observable du résultat de la sauvegarde
   */
  async saveAnnotations() {
    console.log('Canvas - Starting save with projectId:', this.projectId);

    if (!this.projectId) {
      console.error('Canvas - Project ID is required');
      return;
    }

    const currentAnnotations = this.currentAnnotations();
    console.log('Canvas - Current annotations before save:', currentAnnotations);

    if (currentAnnotations.length === 0) {
      console.warn('Canvas - No annotations to save');
      return;
    }

    const groupData = {
      name: `Groupe ${new Date().toLocaleString('fr-FR')}`,
      projectId: this.projectId,
      annotations: currentAnnotations
    };

    console.log('Canvas - Sending group data:', groupData);

    try {
      const result = await firstValueFrom(this.annotationService.createGroup(groupData));
      console.log('Canvas - Group saved successfully:', result);
      return result;
    } catch (error) {
      console.error('Canvas - Error saving group:', error);
      throw error;
    }
  }

  public setColor(event: Event) {
    const color = (event.target as HTMLInputElement).value;
    this.currentColor.set(color);
  }

  render() {
    if (!this.cx) return;

    const canvas: HTMLCanvasElement = this.canvas()!.nativeElement;
    this.cx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner toutes les annotations existantes
    this.annotations().forEach(annotation => {
      this.cx.beginPath();
      this.cx.strokeStyle = annotation.color;

      switch (annotation.type) {
        case 'draw':
          annotation.coordinates.forEach((point: Point, index: number) => {
            if (index === 0) {
              this.cx.moveTo(point.x, point.y);
            } else {
              this.cx.lineTo(point.x, point.y);
            }
          });
          break;

        case 'boundingBox':
          const box = annotation.coordinates as BoundingBoxCoordinates;
          if (box && typeof box.x === 'number') {
            this.cx.rect(box.x, box.y, box.width, box.height);
          } else {
            console.error('Coordonnées de boundingBox invalides:', box);
          }
          break;

        case 'polygonMask':
          const points = annotation.coordinates as Point[];
          this.cx.moveTo(points[0].x, points[0].y);
          points.forEach((point: Point, index: number) => {
            if (index > 0) {
              this.cx.lineTo(point.x, point.y);
            }
          });
          this.cx.closePath();
          break;
      }
      this.cx.stroke();
    });

    // Dessiner l'annotation en cours
    if (this.isDrawing()) {
      const pos = this.getMousePos(event as MouseEvent);
      this.cx.beginPath();
      this.cx.strokeStyle = this.currentColor();

      switch (this.selectedTool()) {
        case 'draw':
          const currentPath = this.currentPath();
          if (currentPath.length > 1) {
            currentPath.forEach((point: Point, index: number) => {
              if (index === 0) {
                this.cx.moveTo(point.x, point.y);
              } else {
                this.cx.lineTo(point.x, point.y);
              }
            });
          }
          break;

        case 'boundingBox':
          const start = this.startPosition();
          this.cx.rect(start.x, start.y, pos.x - start.x, pos.y - start.y);
          break;

        case 'polygonMask':
          const startPos = this.startPosition();
          this.cx.moveTo(startPos.x, startPos.y);
          this.cx.lineTo(pos.x, startPos.y);
          this.cx.lineTo(pos.x, startPos.y + (pos.y - startPos.y) / 2);
      this.cx.closePath();
          break;
      }
      this.cx.stroke();
    }
  }

  /**
   * Réinitialise le canvas et tous les états
   */
  public resetCanvas() {
    console.log('Canvas - Resetting canvas');
    this.currentAnnotations.set([]);
    if (this.cx) {
      this.cx.clearRect(0, 0, this.width(), this.height());
    }
    console.log('Canvas - Canvas reset complete');
  }

  protected formatMetadata(metadata: any): string {
    if (!metadata) return 'Pas de métadonnées';
    try {
      return 'Meta: ' + JSON.stringify(metadata);
    } catch (e) {
      return 'Métadonnées invalides';
    }
  }

  selectAnnotation(index: number) {
    this.selectedAnnotationIndex.set(index);
    console.log('Annotation sélectionnée:', this.selectedAnnotation());
  }

  addLabel(label: string) {
    if (!label.trim()) return;

    this.updateSelectedAnnotation(annotation => {
      const metadata = annotation.metadata || {};
      const labels = metadata.labels || [];
      return {
        ...annotation,
        metadata: {
          ...metadata,
          labels: [...labels, label.trim()]
        }
      };
    });
  }

  removeLabel(label: string) {
    this.updateSelectedAnnotation(annotation => {
      const metadata = annotation.metadata || {};
      return {
        ...annotation,
        metadata: {
          ...metadata,
          labels: (metadata.labels || []).filter(l => l !== label)
        }
      };
    });
  }

  public updateConfidence(event: Event) {
    const confidence = parseFloat((event.target as HTMLInputElement).value);
    const selectedIndex = this.selectedAnnotationIndex();
    if (selectedIndex !== null) {
        this.currentAnnotations.update(annotations => {
            const updatedAnnotations = [...annotations];
            if (!updatedAnnotations[selectedIndex].metadata) {
                updatedAnnotations[selectedIndex].metadata = {};
            }
            updatedAnnotations[selectedIndex].metadata.confidence = confidence;
            return updatedAnnotations;
        });
    }
  }

  public addKeyword(keyword: string) {
    if (!keyword.trim()) return;
    const selectedIndex = this.selectedAnnotationIndex();
    if (selectedIndex !== null) {
      this.currentAnnotations.update(annotations => {
        const updatedAnnotations = [...annotations];
        if (!updatedAnnotations[selectedIndex].metadata) {
          updatedAnnotations[selectedIndex].metadata = {};
        }
        if (!updatedAnnotations[selectedIndex].metadata.keywords) {
          updatedAnnotations[selectedIndex].metadata.keywords = [];
        }
        updatedAnnotations[selectedIndex].metadata.keywords.push(keyword.trim());
        return updatedAnnotations;
      });
    }
  }

  removeKeyword(keyword: string) {
    this.updateSelectedAnnotation(annotation => {
      const metadata = annotation.metadata || {};
      return {
        ...annotation,
        metadata: {
          ...metadata,
          keywords: (metadata.keywords || []).filter(k => k !== keyword)
        }
      };
    });
  }

  private updateSelectedAnnotation(updateFn: (annotation: Annotation) => Annotation) {
    const index = this.selectedAnnotationIndex();
    if (index === null) return;

    this.annotations.update(annotations => {
      const newAnnotations = [...annotations];
      newAnnotations[index] = updateFn(newAnnotations[index]);
      return newAnnotations;
    });
  }

  loadAnnotation(annotation: any) {
    // Réinitialiser le canvas
    this.resetCanvas();

    // Ajouter l'annotation à la liste
    this.annotations.update(annotations => [...annotations, annotation]);

    // Redessiner le canvas
    this.render();

    console.log('✅ Annotation chargée:', annotation);
  }

  /**
   * Charge un groupe d'annotations sur le canvas
   * @param group - Groupe d'annotations à charger
   */
  public loadAnnotationGroup(group: AnnotationGroup) {
    console.log('Chargement du groupe:', group);

    if (!this.cx) {
      console.error('Canvas context not initialized');
      return;
    }

    // Réinitialiser complètement avant de charger
    this.resetCanvas();

    // Définir les nouvelles annotations
    this.currentAnnotations.set(group.annotations);

    // Redessiner les annotations chargées
    this.renderExistingAnnotations();

    console.log('✅ Groupe chargé et dessiné');
  }

  /**
   * Retourne les annotations actuelles
   * @returns Tableau des annotations courantes
   */
  public getCurrentAnnotations() {
    return this.currentAnnotations();
  }

  /**
   * Retourne la couleur actuelle
   * @returns Couleur au format hexadécimal
   */
  public getCurrentColor() {
    return this.currentColor();
  }

  /**
   * Vérifie si un dessin est en cours
   * @returns true si un dessin est en cours
   */
  private isDrawingInProgress(): boolean {
    return this.isDrawing();
  }

  /**
   * Ajoute des métadonnées à une annotation spécifique
   * @param index - Index de l'annotation à modifier
   * @param metadata - Métadonnées à ajouter
   */
  public addMetadataToAnnotation(index: number, metadata: any) {
    this.currentAnnotations.update(annotations => {
      const updatedAnnotations = [...annotations];
      updatedAnnotations[index] = {
        ...updatedAnnotations[index],
        metadata: {
          ...updatedAnnotations[index].metadata,
          labels: [
            ...(updatedAnnotations[index].metadata?.labels || []),
            ...metadata.labels
          ],
          timestamp: new Date()
        }
      };
      console.log('Métadonnées ajoutées à l\'annotation', index, ':', updatedAnnotations[index]);
      return updatedAnnotations;
    });
  }

  public addComment() {
    const selectedIndex = this.selectedAnnotationIndex();
    if (selectedIndex !== null && this.newComment.trim()) {
      const comment: Comment = {
        content: this.newComment,
        author: 'User Name', // Replace with actual user data
        timestamp: new Date(),
      };
      this.currentAnnotations.update(annotations => {
        const updatedAnnotations = [...annotations];
        if (!updatedAnnotations[selectedIndex].metadata) {
          updatedAnnotations[selectedIndex].metadata = {};
        }
        if (!updatedAnnotations[selectedIndex].metadata.comments) {
          updatedAnnotations[selectedIndex].metadata.comments = [];
        }
        updatedAnnotations[selectedIndex].metadata.comments.push(comment);
        return updatedAnnotations;
      });
      this.newComment = ''; // Clear the input
    }
  }

  ngOnChanges() {
    this.annotationsChange.emit(this.currentAnnotations());
  }
}
