import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WindowFrame, FrameProperty } from '../../models/window.model';

@Component({
  selector: 'app-frame-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-group">
      <h2>Window Frames</h2>
      <div class="frames-grid">
        <div *ngFor="let frame of frames; let i = index" class="frame-item">
          <div class="frame-header">
            <h3>Frame {{i + 1}}</h3>
            <button (click)="removeFrame(i)" class="btn btn-danger btn-sm">Remove Frame</button>
          </div>
          
          <div class="frame-main">
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
          </div>

          <div class="properties-section">
            <h4>Additional Properties</h4>
            <div class="properties-grid">
              <div *ngFor="let prop of frame.properties; let j = index" class="property-item">
                <div class="input-group">
                  <label>Name</label>
                  <input type="text" [(ngModel)]="prop.name" placeholder="Property Name" class="form-control">
                </div>
                <div class="input-group">
                  <label>Length</label>
                  <input type="number" [(ngModel)]="prop.length" placeholder="Length" class="form-control">
                </div>
                <div class="input-group">
                  <label>Quantity</label>
                  <input type="number" [(ngModel)]="prop.quantity" placeholder="Quantity" class="form-control">
                </div>
                <button (click)="removeProperty(frame, j)" class="btn btn-danger btn-sm">Remove</button>
              </div>
            </div>
            <button (click)="addProperty(frame)" class="btn btn-secondary">Add Property</button>
          </div>
        </div>
      </div>
      <button (click)="addFrame()" class="btn btn-primary">Add Window Frame</button>
    </div>
  `,
  styles: [`
    .frames-grid {
      display: grid;
      gap: 1.5rem;
      margin-bottom: 1rem;
    }
    .frame-item {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 1.5rem;
      background-color: #fff;
    }
    .frame-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .frame-main {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
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
    .properties-section {
      border-top: 1px solid #ddd;
      padding-top: 1rem;
      margin-top: 1rem;
    }
    .properties-grid {
      display: grid;
      gap: 1rem;
      margin: 1rem 0;
    }
    .property-item {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr auto;
      gap: 1rem;
      align-items: end;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
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
      unit: 'mm',
      properties: []
    });
    this.framesChange.emit(this.frames);
  }

  removeFrame(index: number) {
    this.frames.splice(index, 1);
    this.framesChange.emit(this.frames);
  }

  addProperty(frame: WindowFrame) {
    frame.properties.push({
      id: Date.now().toString(),
      name: '',
      length: 0,
      quantity: 1
    });
    this.framesChange.emit(this.frames);
  }

  removeProperty(frame: WindowFrame, index: number) {
    frame.properties.splice(index, 1);
    this.framesChange.emit(this.frames);
  }
}