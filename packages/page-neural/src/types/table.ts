export interface TableColumn {
  width: number;
  field: string;
  title: string;
}

export interface TableModelValue {
  columns: TableColumn[];
}
