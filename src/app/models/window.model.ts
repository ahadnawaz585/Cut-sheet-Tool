export interface WindowFrame {
  id: string;
  width: number;
  height: number;
  refNo: string;
  unit: 'mm' | 'ft';
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
}

export interface OptimizedProfile {
  originalLength: number;
  cuts: CutPiece[];
  wasteLength: number;
  unit: 'mm' | 'ft';
}