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

    // Calculate total length needed and number of profiles required
    const totalLengthNeeded = sortedPieces.reduce((sum, piece) => sum + piece.length, 0);
    const numProfilesNeeded = Math.ceil(totalLengthNeeded / normalizedProfile.length);

    // Create available profiles
    const availableProfiles: OptimizedProfile[] = Array(numProfilesNeeded).fill(null).map(() => ({
      originalLength: normalizedProfile.length,
      cuts: [],
      wasteLength: normalizedProfile.length,
      unit: normalizedProfile.unit
    }));

    // First fit decreasing algorithm with optimization
    const result = this.optimizePlacements(sortedPieces, availableProfiles);

    // Convert results back to original units
    return this.convertResultsToOriginalUnits(result, standardProfile);
  }

  private normalizeFramesToMm(frames: WindowFrame[]): WindowFrame[] {
    return frames.map(frame => ({
      ...frame,
      width: frame.unit === 'ft' ? frame.width * this.MM_PER_FOOT : frame.width,
      height: frame.unit === 'ft' ? frame.height * this.MM_PER_FOOT : frame.height,
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
    });
    return pieces;
  }

  private optimizePlacements(pieces: CutPiece[], profiles: OptimizedProfile[]): OptimizedProfile[] {
    pieces.forEach(piece => {
      let placed = false;
      // Try to find the best fit profile
      for (const profile of profiles) {
        if (profile.wasteLength >= piece.length) {
          profile.cuts.push(piece);
          profile.wasteLength -= piece.length;
          placed = true;
          break;
        }
      }
      if (!placed) {
        throw new Error(`Unable to fit piece of length ${piece.length}${piece.unit}`);
      }
    });

    // Return only used profiles
    return profiles.filter(profile => profile.cuts.length > 0);
  }
}