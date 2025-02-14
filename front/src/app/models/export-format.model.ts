export interface ExportFormatOption {
  value: 'JSON' | 'CSV' | 'PASCAL_VOC' | 'COCO';
  label: string;
  icon: string;
  description: string;
}

export const EXPORT_FORMATS: ExportFormatOption[] = [
  {
    value: 'JSON',
    label: 'JSON',
    icon: 'code',
    description: 'Format standard pour les données structurées'
  },
  {
    value: 'CSV',
    label: 'CSV',
    icon: 'table_chart',
    description: 'Format tabulaire compatible Excel'
  },
  {
    value: 'PASCAL_VOC',
    label: 'PASCAL VOC',
    icon: 'description',
    description: 'Format XML standard pour l\'annotation d\'images'
  },
  {
    value: 'COCO',
    label: 'COCO',
    icon: 'dataset',
    description: 'Format standard pour les datasets d\'annotations'
  }
];
