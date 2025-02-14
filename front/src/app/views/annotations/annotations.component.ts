import { Component, ViewChild, OnInit, resource, Input, NgModule } from '@angular/core';
import { CommonModule, DatePipe, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CanvasComponent } from './canvas.component';
import { signal } from '@angular/core';
import { AnnotationService } from '../../services/annotation.service';
import { firstValueFrom } from 'rxjs';
import { AnnotationGroup } from './canvas.component';
import { Annotation } from './canvas.component';
import { MatDialog } from '@angular/material/dialog';
import { ExportDialogComponent } from '../../components/export-dialog/export-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-annotations',
  templateUrl: './annotations.component.html',
  styleUrls: ['./annotations.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    CanvasComponent,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    DatePipe,
  ],
  standalone: true
})
export class AnnotationsComponent implements OnInit {
  tools = [
    { id: 'boundingBox', name: 'Bounding Box' },
    { id: 'polygonMask', name: 'Polygon Mask' },
    { id: 'draw', name: 'Draw' },
    { id: 'highlight', name: 'Highlight' },
    { id: 'keywords', name: 'Mots-clés' },
  ];

  // Signal pour l'outil sélectionné
  selectedTool = signal<string>('boundingBox');
  savedGroups = resource({
    loader: () => {
      if (!this.projectId) {
        console.error('ProjectId required for loading groups');
        return Promise.resolve([]);
      }
      return firstValueFrom(this.annotationService.getAnnotationGroups(this.projectId));
    }
  });

  // Référence au composant Canvas
  @ViewChild(CanvasComponent, { static: false }) canvas?: CanvasComponent;

  private selectedAnnotations = new Map<string, Set<Annotation>>();

  // Ajouter l'input projectId
  @Input({ required: true }) projectId!: string;

  selectedAnnotationIndex: number | null = null;
  private tempMetadata: any = null;

  constructor(
    private annotationService: AnnotationService,
    private dialog: MatDialog,
    private exportService: ExportService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.projectId = params['id'];
      console.log('Annotations Component - ProjectId from route:', this.projectId);

      if (!this.projectId) {
        console.error('ProjectId is required for annotations component');
        return;
      }

      // Recharger les groupes avec le nouveau projectId
      this.savedGroups.reload();
    });
  }

  ngAfterViewInit() {
    if (this.canvas && this.projectId) {
      this.canvas.projectId = this.projectId;
      console.log('Canvas projectId set to:', this.projectId);
    }
  }

  loadGroup(group: AnnotationGroup) {
    if (this.canvas) {
      this.canvas.loadAnnotationGroup(group);
      // Scroll vers le haut de la page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'  // Pour un défilement fluide
      });
    }
  }

  // Méthode pour changer l'outil sélectionné
  setTool(tool: string) {
    this.selectedTool.set(tool);
    this.canvas?.setTool(tool);
  }

  // Méthode pour ajouter des métadonnées
  addMetadata() {
    const metadata = {
      labels: ['Label exemple'],
      confidence: 0.9,
      keywords: ['mot-clé'],
      timestamp: new Date()
    };
    if (this.canvas) {
      this.canvas.addMetadata(metadata);
    }
  }

  // Cette méthode est appelée lors du clic sur le bouton "Sauvegarder"
  async saveAnnotations() {
    if (!this.canvas) {
      console.error('Annotations Component - Canvas not found');
      return;
    }

    if (!this.projectId) {
      console.error('Annotations Component - Project ID is required');
      return;
    }

    const currentAnnotations = this.canvas.getCurrentAnnotations();
    console.log('Current annotations to save:', currentAnnotations);

    if (!currentAnnotations || currentAnnotations.length === 0) {
      console.warn('No annotations to save');
      return;
    }

    try {
      const result = await this.canvas.saveAnnotations();
      console.log('Annotations Component - Save successful:', result);
      await this.savedGroups.reload();
      console.log('Annotations Component - Groups reloaded');
    } catch (error: any) {
      console.error('Annotations Component - Error saving:', error);
    }
  }

  deleteGroup(id: string | undefined) {
    if (!id || typeof id !== 'string') {
      console.error('ID required for deletion');
      return;
    }

    console.log('Deleting group:', id);
    this.annotationService.deleteAnnotationGroup(id).subscribe({
      next: () => {
        console.log('✅ Groupe supprimé');
        this.savedGroups.reload();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la suppression:', error);
      }
    });
  }

  getCurrentAnnotations() {
    return this.canvas?.getCurrentAnnotations();
  }

  addLabelToAnnotation(index: number, label: string, event?: Event) {
    event?.stopPropagation();
    if (!label.trim()) return;

    const metadata = {
      labels: [label],
      timestamp: new Date()
    };

    if (this.canvas) {
      this.canvas.addMetadataToAnnotation(index, metadata);
    }
  }

  isAnnotationSelected(groupId: string, annotation: Annotation): boolean {
    return this.selectedAnnotations.get(groupId)?.has(annotation) || false;
  }

  toggleAnnotationSelection(groupId: string, annotation: Annotation) {
    if (!this.selectedAnnotations.has(groupId)) {
      this.selectedAnnotations.set(groupId, new Set());
    }

    const groupSelections = this.selectedAnnotations.get(groupId)!;
    if (groupSelections.has(annotation)) {
      groupSelections.delete(annotation);
    } else {
      groupSelections.add(annotation);
    }
  }

  hasSelectedAnnotations(groupId: string): boolean {
    return (this.selectedAnnotations.get(groupId)?.size || 0) > 0;
  }

  loadSelectedAnnotations(groupId: string) {
    const selectedAnnotations = Array.from(this.selectedAnnotations.get(groupId) || []);
    if (selectedAnnotations.length > 0 && this.canvas) {
      const partialGroup: AnnotationGroup = {
        name: 'Sélection personnalisée',
        annotations: selectedAnnotations
      };
      this.canvas.loadAnnotationGroup(partialGroup);
    }
  }

  clearSelection(groupId: string) {
    this.selectedAnnotations.delete(groupId);
  }

  openExportDialog(groups: AnnotationGroup[]) {
    console.log(this.projectId)
    this.dialog.open(ExportDialogComponent, {
      width: '500px',
      data: {
        projectId: this.projectId,
        groups: groups.map(group => ({
          id: group._id,
          name: group.name,
          selected: true
        }))
      }
    });
  }

  getAnnotationTypes(annotations: Annotation[]): string[] {
    return [...new Set(annotations.map(a => a.type))];
  }

  countAnnotationsByType(annotations: Annotation[], type: string): number {
    return annotations.filter(a => a.type === type).length;
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'boundingBox': '#4CAF50',
      'polygonMask': '#2196F3',
      'draw': '#FF9800',
      'highlight': '#9C27B0',
      'keywords': '#607D8B'
    };
    return colors[type] || '#999999';
  }

  hasMetadata(annotations: Annotation[]): boolean {
    return annotations.some(a => a.metadata && (
      (a.metadata.labels && a.metadata.labels.length > 0) ||
      (a.metadata.keywords && a.metadata.keywords.length > 0) ||
      a.metadata.confidence !== undefined
    ));
  }

  hasLabels(annotations: Annotation[]): boolean {
    return annotations.some(a => a.metadata?.labels && a.metadata.labels.length > 0);
  }

  hasKeywords(annotations: Annotation[]): boolean {
    return annotations.some(a => a.metadata?.keywords && a.metadata.keywords.length > 0);
  }

  getUniqueLabelsCount(annotations: Annotation[]): number {
    const labels = new Set();
    annotations.forEach(a => {
      a.metadata?.labels?.forEach(label => labels.add(label));
    });
    return labels.size;
  }

  getUniqueKeywordsCount(annotations: Annotation[]): number {
    const keywords = new Set();
    annotations.forEach(a => {
      a.metadata?.keywords?.forEach(keyword => keywords.add(keyword));
    });
    return keywords.size;
  }

  selectAnnotation(index: number) {
    if (this.selectedAnnotationIndex !== null) {
      this.cancelEdit(); // Annule l'édition précédente si elle existe
    }
    this.selectedAnnotationIndex = index;
    // Sauvegarde une copie des métadonnées actuelles
    const annotation = this.getCurrentAnnotations()?.[index];
    if (annotation?.metadata) {
      this.tempMetadata = { ...annotation.metadata };
    }
  }

  confirmEdit() {
    this.tempMetadata = null;
    this.selectedAnnotationIndex = null;
  }

  cancelEdit() {
    if (this.selectedAnnotationIndex !== null && this.tempMetadata) {
      // Restaure les métadonnées originales
      const annotation = this.getCurrentAnnotations()?.[this.selectedAnnotationIndex];
      if (annotation) {
        annotation.metadata = { ...this.tempMetadata };
      }
    }
    this.tempMetadata = null;
    this.selectedAnnotationIndex = null;
  }

  updateConfidence(index: number, value: number, event?: Event) {
    event?.stopPropagation();
    if (this.canvas) {
      const currentAnnotation = this.getCurrentAnnotations()?.[index];
      const currentMetadata = currentAnnotation?.metadata || {};
      const metadata = {
        ...currentMetadata,
        labels: currentMetadata.labels || [], // Préserver les labels existants ou initialiser un tableau vide
        confidence: value,
        timestamp: new Date()
      };
      this.canvas.addMetadataToAnnotation(index, metadata);
    }
  }

  removeLabel(index: number, labelToRemove: string, event?: Event) {
    event?.stopPropagation();
    if (this.canvas) {
      const annotation = this.getCurrentAnnotations()?.[index];
      if (annotation?.metadata?.labels) {
        const newLabels = annotation.metadata.labels.filter(label => label !== labelToRemove);
        const metadata = {
          ...annotation.metadata,
          labels: newLabels,
          timestamp: new Date()
        };
        this.canvas.addMetadataToAnnotation(index, metadata);
      }
    }
  }

  async exportGroup(groupId: string) {
    const group = this.savedGroups.value()?.find(g => g._id === groupId);
    if (!group) return;

    this.dialog.open(ExportDialogComponent, {
      width: '500px',
      data: {
        projectId: this.projectId,
        groups: [{
          id: group._id,
          name: group.name,
          selected: true
        }]
      }
    });
  }

}
