export interface PartOperation {
  id: number;
  partId: number;
  seqNumber: number;
  name: string;
  code: string | null;
  price: number | null;
}

export interface Part {
  id: number;
  name: string;
  description: string | null;
  operations: PartOperation[];
}

export interface PartListItem {
  id: number;
  name: string;
  description: string | null;
  operationCount: number;
}

export interface ProductPart {
  id: number;
  productItemId: number;
  partId: number;
  quantity: number;
  productItemName: string | null;
  partName: string | null;
  partOperations: PartOperation[] | null;
}
