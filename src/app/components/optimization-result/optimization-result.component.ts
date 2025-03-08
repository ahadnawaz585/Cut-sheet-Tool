import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptimizedProfile } from '../../models/window.model';

@Component({
  selector: 'app-optimization-result',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="visualization" *ngIf="profiles.length > 0">
      <h2>Optimization Results</h2>
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">Total Profiles Used:</span>
          <span class="stat-value">{{profiles.length}}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Total Material Length:</span>
          <span class="stat-value">{{formatTotalLength()}}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Total Waste:</span>
          <span class="stat-value">{{formatTotalWaste()}} ({{calculateWastePercentage()}}%)</span>
        </div>
      </div>

      <div *ngFor="let profile of profiles; let i = index" class="profile-container">
        <h3>Profile {{i + 1}} ({{profile.originalLength}}{{profile.unit}})</h3>
        <div class="profile-bar">
          <div *ngFor="let cut of profile.cuts" 
               class="cut-piece"
               [style.width.%]="(cut.length / profile.originalLength) * 100"
               [style.left.%]="calculatePosition(profile, cut)">
            <div class="cut-label">{{cut.refNo}} - {{cut.length}}{{cut.unit}}</div>
            <div class="cut-position">{{getPositionLabel(cut.position)}}</div>
          </div>
        </div>
        <div class="profile-info">
          <span>Utilization: {{calculateUtilization(profile)}}%</span>
          <span>Waste: {{profile.wasteLength}}{{profile.unit}}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .visualization {
      margin-top: 2rem;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    .stat-item {
      display: flex;
      flex-direction: column;
    }
    .stat-label {
      font-weight: bold;
      color: #666;
    }
    .stat-value {
      font-size: 1.2rem;
      color: #333;
    }
    .profile-container {
      margin-bottom: 2rem;
    }
    .profile-bar {
      height: 60px;
      background-color: #e9ecef;
      margin: 1rem 0;
      position: relative;
      border-radius: 4px;
    }
    .cut-piece {
      position: absolute;
      height: 100%;
      background-color: #28a745;
      border: 1px solid #1e7e34;
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      transition: all 0.3s ease;
    }
    .cut-piece:hover {
      background-color: #218838;
      transform: translateY(-2px);
    }
    .cut-label {
      font-weight: bold;
    }
    .cut-position {
      font-size: 10px;
      opacity: 0.9;
    }
    .profile-info {
      display: flex;
      justify-content: space-between;
      color: #666;
    }
  `]
})
export class OptimizationResultComponent {
  @Input() profiles: OptimizedProfile[] = [];

  calculatePosition(profile: OptimizedProfile, cut: any): number {
    let position = 0;
    for (const previousCut of profile.cuts) {
      if (previousCut === cut) break;
      position += (previousCut.length / profile.originalLength) * 100;
    }
    return position;
  }

  formatTotalLength(): string {
    const mmProfiles = this.profiles.filter(p => p.unit === 'mm');
    const ftProfiles = this.profiles.filter(p => p.unit === 'ft');

    const mmTotal = mmProfiles.reduce((total, profile) => total + profile.originalLength, 0);
    const ftTotal = ftProfiles.reduce((total, profile) => total + profile.originalLength, 0);

    const parts = [];
    if (mmTotal > 0) parts.push(`${mmTotal}mm`);
    if (ftTotal > 0) parts.push(`${ftTotal}ft`);
    return parts.join(' + ') || '0';
  }

  formatTotalWaste(): string {
    const mmProfiles = this.profiles.filter(p => p.unit === 'mm');
    const ftProfiles = this.profiles.filter(p => p.unit === 'ft');

    const mmWaste = mmProfiles.reduce((total, profile) => total + profile.wasteLength, 0);
    const ftWaste = ftProfiles.reduce((total, profile) => total + profile.wasteLength, 0);

    const parts = [];
    if (mmWaste > 0) parts.push(`${mmWaste}mm`);
    if (ftWaste > 0) parts.push(`${ftWaste}ft`);
    return parts.join(' + ') || '0';
  }

  calculateWastePercentage(): number {
    const totalLength = this.profiles.reduce((total, profile) => {
      const length = profile.unit === 'ft' ? profile.originalLength * 304.8 : profile.originalLength;
      return total + length;
    }, 0);

    const totalWaste = this.profiles.reduce((total, profile) => {
      const waste = profile.unit === 'ft' ? profile.wasteLength * 304.8 : profile.wasteLength;
      return total + waste;
    }, 0);

    return totalLength > 0 ? Math.round((totalWaste / totalLength) * 100 * 10) / 10 : 0;
  }

  calculateUtilization(profile: OptimizedProfile): number {
    return Math.round(((profile.originalLength - profile.wasteLength) / profile.originalLength) * 100 * 10) / 10;
  }

  getPositionLabel(position: number): string {
    switch (position) {
      case 0: return 'Top';
      case 1: return 'Bottom';
      case 2: return 'Left';
      case 3: return 'Right';
      default: return '';
    }
  }
}