import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WindowFrame } from '../../models/window.model';

@Component({
  selector: 'app-frame-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-group">
      <h2>Window Frames</h2>
      <div class="frames-grid">
        <div *ngFor="let frame of frames; let i = index" class="frame-item">
          <div class="input-group">
            <label>Reference No.</label>
            <input type="text" [(ngModel)]="frame.refNo" placeholder="Reference No" class="form-control">
          </div>
          <div class="input-group">
            <label>Width</label>
            <div class="input-with-unit">
              <input type="number" [(ngModel)]="frame.width" placeholder="Width" class="form-control">
              <select [(ngModel)]="frame.unit" class="form-control unit-select">
                <option value="mm">mm</option>
                <option value="ft">ft</option>
              </select>
            </div>
          </div>
          <div class="input-group">
            <label>Height</label>
            <div class="input-with-unit">
              <input type="number" [(ngModel)]="frame.height" placeholder="Height" class="form-control">
              <select [(ngModel)]="frame.unit" class="form-control unit-select" disabled>
                <option value="mm">mm</option>
                <option value="ft">ft</option>
              </select>
            </div>
          </div>
          <button (click)="removeFrame(i)" class="btn btn-danger">Remove</button>
        </div>
      </div>
      <button (click)="addFrame()" class="btn btn-primary">Add Window Frame</button>
      <div class="summary" *ngIf="frames.length > 0">
        <h3>Required Material Summary</h3>
        <p>Total Frames: {{frames.length}}</p>
        <p>Total Required Length: {{calculateTotalRequiredLength()}}</p>
      </div>
    </div>
  `,
  styles: [`
    .frames-grid {
      display: grid;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .frame-item {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr auto;
      gap: 1rem;
      align-items: end;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .input-group {
      display: flex;
      flex-direction: column;
    }
    .input-group label {
      margin-bottom: 0.5rem;
      font-weight: bold;
    }
    .input-with-unit {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 0.5rem;
    }
    .unit-select {
      width: 80px;
    }
    .summary {
      margin-top: 1rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
  `]
})
export class FrameInputComponent {
  @Input() frames: WindowFrame[] = [];
  @Output() framesChange = new EventEmitter<WindowFrame[]>();

  addFrame() {
    this.frames.push({
      id: Date.now().toString(),
      refNo: `W${this.frames.length + 1}`,
      width: 1000,
      height: 1200,
      unit: 'mm'
    });
    this.framesChange.emit(this.frames);
  }

  removeFrame(index: number) {
    this.frames.splice(index, 1);
    this.framesChange.emit(this.frames);
  }

  calculateTotalRequiredLength(): string {
    const mmFrames = this.frames.filter(f => f.unit === 'mm');
    const ftFrames = this.frames.filter(f => f.unit === 'ft');

    const mmTotal = mmFrames.reduce((total, frame) => 
      total + (2 * frame.width) + (2 * frame.height), 0);
    
    const ftTotal = ftFrames.reduce((total, frame) => 
      total + (2 * frame.width) + (2 * frame.height), 0);

    const parts = [];
    if (mmTotal > 0) parts.push(`${mmTotal}mm`);
    if (ftTotal > 0) parts.push(`${ftTotal}ft`);
    return parts.join(' + ') || '0';
  }
}