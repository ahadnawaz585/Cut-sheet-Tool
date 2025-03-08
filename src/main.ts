import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { WindowFrame, ProfileLength, OptimizedProfile } from './app/models/window.model';
import { OptimizerService } from './app/services/optimizer.service';
import { ProfileInputComponent } from './app/components/profile-input/profile-input.component';
import { FrameInputComponent } from './app/components/frame-input/frame-input.component';
import { OptimizationResultComponent } from './app/components/optimization-result/optimization-result.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ProfileInputComponent,
    FrameInputComponent,
    OptimizationResultComponent
  ],
  template: `
    <div class="container">
      <header class="header">
        <h1>Window Profile Cut Sheet Calculator</h1>
        <p class="description">
          Optimize your window frame cutting patterns to minimize waste and maximize efficiency
        </p>
      </header>

      <main class="main-content">
        <app-profile-input
          [(profile)]="standardProfile"
        ></app-profile-input>

        <app-frame-input
          [(frames)]="frames"
        ></app-frame-input>

        <div class="actions">
          <button 
            (click)="calculateOptimization()" 
            class="btn btn-primary btn-large"
            [disabled]="!isValidInput()">
            Calculate Optimization
          </button>
        </div>

        <app-optimization-result
          [profiles]="optimizedProfiles"
        ></app-optimization-result>
      </main>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .description {
      color: #666;
      font-size: 1.1rem;
    }
    .main-content {
      display: grid;
      gap: 2rem;
    }
    .actions {
      display: flex;
      justify-content: center;
      margin: 2rem 0;
    }
    .btn-large {
      padding: 1rem 2rem;
      font-size: 1.2rem;
    }
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f5f5f5;
    }
  `]
})
export class App {
  standardProfile: ProfileLength = {
    id: '1',
    length: 6000,
    unit: 'mm'
  };

  frames: WindowFrame[] = [
    { id: '1', refNo: 'W1', width: 1000, height: 1200, unit: 'mm' }
  ];

  optimizedProfiles: OptimizedProfile[] = [];

  constructor(private optimizerService: OptimizerService) {}

  isValidInput(): boolean {
    return this.standardProfile.length > 0 && 
           this.frames.length > 0 &&
           this.frames.every(f => f.width > 0 && f.height > 0 && f.refNo);
  }

  calculateOptimization() {
    try {
      this.optimizedProfiles = this.optimizerService.optimizeCutSheet(this.frames, this.standardProfile);
    } catch (error: any) {
      alert(error.message);
    }
  }
}

bootstrapApplication(App);