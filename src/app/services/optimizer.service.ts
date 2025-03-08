import { Injectable } from '@angular/core';
import { cloneDeep, sortBy } from 'lodash-es';
import { WindowFrame, ProfileLength, OptimizedProfile, CutPiece } from '../models/window.model';

@Injectable({
  providedIn: 'root'
})
export class OptimizerService {
  private readonly MM_PER_FOOT = 304.8;

  optimizeCutSheet(frames: WindowFrame[], standardProfile: ProfileLength): OptimizedProfile[] {
    // Validate inputs
    this.validateInputs(frames, standardProfile);

    // Convert all measurements to mm for calculations
    const normalizedFrames = this.normalizeFramesToMm(frames);
    const normalizedProfile = this.normalizeProfileToMm(standardProfile);

    // Create a list of all required pieces
    const pieces: CutPiece[] = this.createPiecesList(normalizedFrames);

    // Sort pieces by length in descending order
    const sortedPieces = sortBy(pieces, piece => -piece.length);

    // Initialize with a reasonable number of profiles
    let availableProfiles: OptimizedProfile[] = [];
    let remainingPieces = [...sortedPieces];

    // Calculate blade size in mm
    const bladeSize = standardProfile.includeBladeSize ? 
      (standardProfile.unit === 'ft' ? standardProfile.bladeSize * this.MM_PER_FOOT : standardProfile.bladeSize) : 
      0;

    // Keep adding profiles until all pieces are placed
    while (remainingPieces.length > 0) {
      const newProfile: OptimizedProfile = {
        originalLength: normalizedProfile.length,
        cuts: [],
        wasteLength: normalizedProfile.length,
        unit: normalizedProfile.unit
      };
      availableProfiles.push(newProfile);

      // Try to fit as many pieces as possible in the current profile
      remainingPieces = this.fillProfile(newProfile, remainingPieces, bladeSize);
    }

    // Convert results back to original units and round values
    return this.convertResultsToOriginalUnits(availableProfiles, standardProfile);
  }

  private fillProfile(profile: OptimizedProfile, pieces: CutPiece[], bladeSize: number): CutPiece[] {
    const remaining: CutPiece[] = [];
    
    for (const piece of pieces) {
      // Add blade size to the required length for each cut except the last one in the profile
      const requiredLength = profile.cuts.length > 0 ? piece.length + bladeSize : piece.length;
      
      if (profile.wasteLength >= requiredLength) {
        profile.cuts.push(piece);
        profile.wasteLength = Number((profile.wasteLength - requiredLength).toFixed(3));
      } else {
        remaining.push(piece);
      }
    }

    return remaining;
  }

  private normalizeFramesToMm(frames: WindowFrame[]): WindowFrame[] {
    return frames.map(frame => ({
      ...frame,
      width: frame.unit === 'ft' ? frame.width * this.MM_PER_FOOT : frame.width,
      height: frame.unit === 'ft' ? frame.height * this.MM_PER_FOOT : frame.height,
      properties: frame.properties.map(prop => ({
        ...prop,
        length: frame.unit === 'ft' ? prop.length * this.MM_PER_FOOT : prop.length
      })),
      unit: 'mm'
    }));
  }

  private normalizeProfileToMm(profile: ProfileLength): ProfileLength {
    return {
      ...profile,
      length: profile.unit === 'ft' ? profile.length * this.MM_PER_FOOT : profile.length,
      unit: 'mm'
    };
  }

  private convertResultsToOriginalUnits(results: OptimizedProfile[], originalProfile: ProfileLength): OptimizedProfile[] {
    return results.map(result => {
      if (originalProfile.unit === 'mm') return result;

      return {
        ...result,
        originalLength: result.originalLength / this.MM_PER_FOOT,
        wasteLength: result.wasteLength / this.MM_PER_FOOT,
        cuts: result.cuts.map(cut => ({
          ...cut,
          length: cut.length / this.MM_PER_FOOT,
          unit: 'ft'
        })),
        unit: 'ft'
      };
    });
  }

  private validateInputs(frames: WindowFrame[], standardProfile: ProfileLength): void {
    if (!frames.length) {
      throw new Error('No frames provided');
    }
    if (!standardProfile.length || standardProfile.length <= 0) {
      throw new Error('Invalid profile length');
    }

    const invalidFrames = frames.filter(frame => !frame.width || !frame.height || !frame.refNo);
    if (invalidFrames.length) {
      throw new Error('All frames must have valid dimensions and reference numbers');
    }

    // Validate properties
    frames.forEach(frame => {
      const invalidProps = frame.properties.filter(
        prop => !prop.name || prop.length <= 0 || prop.quantity <= 0
      );
      if (invalidProps.length) {
        throw new Error(`Invalid properties in frame ${frame.refNo}`);
      }
    });

    // Validate that no piece is longer than the standard profile
    frames.forEach(frame => {
      const maxLength = standardProfile.unit === frame.unit ? 
        standardProfile.length : 
        (standardProfile.unit === 'mm' ? frame.unit === 'ft' ? standardProfile.length / this.MM_PER_FOOT : standardProfile.length : standardProfile.length * this.MM_PER_FOOT);
      
      if (frame.width > maxLength || frame.height > maxLength) {
        throw new Error(`Frame ${frame.refNo} has dimensions larger than the standard profile length`);
      }

      frame.properties.forEach(prop => {
        if (prop.length > maxLength) {
          throw new Error(`Property "${prop.name}" in frame ${frame.refNo} is longer than the standard profile length`);
        }
      });
    });
  }

  private createPiecesList(frames: WindowFrame[]): CutPiece[] {
    const pieces: CutPiece[] = [];
    frames.forEach(frame => {
      // Add horizontal pieces (width * 2)
      pieces.push(
        { length: frame.width, refNo: frame.refNo, frameId: frame.id, position: 0, unit: frame.unit },
        { length: frame.width, refNo: frame.refNo, frameId: frame.id, position: 1, unit: frame.unit }
      );
      // Add vertical pieces (height * 2)
      pieces.push(
        { length: frame.height, refNo: frame.refNo, frameId: frame.id, position: 2, unit: frame.unit },
        { length: frame.height, refNo: frame.refNo, frameId: frame.id, position: 3, unit: frame.unit }
      );
      
      // Add additional properties
      frame.properties.forEach(prop => {
        for (let i = 0; i < prop.quantity; i++) {
          pieces.push({
            length: prop.length,
            refNo: frame.refNo,
            frameId: frame.id,
            position: 4, // Additional property
            unit: frame.unit,
            propertyName: prop.name
          });
        }
      });
    });
    return pieces;
  }
}