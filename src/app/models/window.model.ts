export interface WindowFrame {
  id: string;
  width: number;
  height: number;
  refNo: string;
  unit: 'mm' | 'ft';
  properties: FrameProperty[];
}

export interface FrameProperty {
  id: string;
  name: string;
  length: number;
  quantity: number;
}

export interface ProfileLength {
  id: string;
  length: number;
  unit: 'mm' | 'ft';
}

export interface CutPiece {
  length: number;
  refNo: string;
  frameId: string;
  position: number;
  unit: 'mm' | 'ft';
  propertyName?: string;
}

export interface OptimizedProfile {
  originalLength: number;
  cuts: CutPiece[];
  wasteLength: number;
  unit: 'mm' | 'ft';
}