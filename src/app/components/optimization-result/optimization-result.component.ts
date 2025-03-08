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

      <div class="profiles-container">
        <div *ngFor="let profile of profiles; let i = index" class="profile-container">
          <div class="profile-header">
            <h3>Profile {{i + 1}}</h3>
            <div class="profile-stats">
              <span>Length: {{profile.originalLength}}{{profile.unit}}</span>
              <span>Waste: {{profile.wasteLength}}{{profile.unit}}</span>
              <span>Utilization: {{calculateUtilization(profile)}}%</span>
            </div>
          </div>
          
          <div class="profile-bar">
            <div *ngFor="let cut of profile.cuts" 
                class="cut-piece"
                [style.width.%]="(cut.length / profile.originalLength) * 100"
                [style.left.%]="calculatePosition(profile, cut)">
              <div class="cut-label">
                {{cut.refNo}} - {{cut.length}}{{cut.unit}}
                <span *ngIf="cut.propertyName" class="property-name">({{cut.propertyName}})</span>
              </div>
              <div class="cut-position">{{getPositionLabel(cut.position)}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .visualization {
      margin-top: 2rem;
      padding: 1.5rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 8px;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
    }
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .stat-label {
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
    }
    .stat-value {
      font-size: 1.25rem;
      color: #212529;
      font-weight: 500;
    }
    .profiles-container {
      display: grid;
      gap: 1.5rem;
    }
    .profile-container {
      background: #fff;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e9ecef;
    }
    .profile-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
      color: #6c757d;
    }
    .profile-bar {
      height: 60px;
      background: linear-gradient(to right, #e9ecef 0%, #dee2e6 100%);
      margin: 1rem 0;
      position: relative;
      border-radius: 4px;
      overflow: hidden;
    }
    .cut-piece {
      position: absolute;
      height: 100%;
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      border: 1px solid rgba(0,0,0,0.1);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .cut-piece:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .cut-label {
      font-weight: 600;
      text-align: center;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
      padding: 0 0.5rem;
    }
    .property-name {
      font-size: 0.8rem;
      opacity: 0.9;
    }
    .cut-position {
      font-size: 0.75rem;
      opacity: 0.9;
    }
    h2 {
      color: #343a40;
      margin-bottom: 1.5rem;
      font-weight: 600;
    }
    h3 {
      color: #495057;
      margin: 0;
      font-weight: 500;
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
    return Number(position.toFixed(2));
  }

  formatTotalLength(): string {
    const mmProfiles = this.profiles.filter(p => p.unit === 'mm');
    const ftProfiles = this.profiles.filter(p => p.unit === 'ft');

    const mmTotal = mmProfiles.reduce((total, profile) => total + profile.originalLength, 0);
    const ftTotal = ftProfiles.reduce((total, profile) => total + profile.originalLength, 0);

    const parts = [];
    if (mmTotal > 0) parts.push(`${mmTotal.toFixed(1)}mm`);
    if (ftTotal > 0) parts.push(`${ftTotal.toFixed(2)}ft`);
    return parts.join(' + ') || '0';
  }

  formatTotalWaste(): string {
    const mmProfiles = this.profiles.filter(p => p.unit === 'mm');
    const ftProfiles = this.profiles.filter(p => p.unit === 'ft');

    const mmWaste = mmProfiles.reduce((total, profile) => total + profile.wasteLength, 0);
    const ftWaste = ftProfiles.reduce((total, profile) => total + profile.wasteLength, 0);

    const parts = [];
    if (mmWaste > 0) parts.push(`${mmWaste.toFixed(1)}mm`);
    if (ftWaste > 0) parts.push(`${ftWaste.toFixed(2)}ft`);
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

    return Number(((totalWaste / totalLength) * 100).toFixed(1));
  }

  calculateUtilization(profile: OptimizedProfile): number {
    return Number((((profile.originalLength - profile.wasteLength) / profile.originalLength) * 100).toFixed(1));
  }

  getPositionLabel(position: number): string {
    switch (position) {
      case 0: return 'Top';
      case 1: return 'Bottom';
      case 2: return 'Left';
      case 3: return 'Right';
      case 4: return 'Additional';
      default: return '';
    }
  }
}