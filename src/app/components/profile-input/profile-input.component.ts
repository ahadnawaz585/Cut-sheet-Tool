import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileLength } from '../../models/window.model';

@Component({
  selector: 'app-profile-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-group">
      <h2>Standard Profile Length</h2>
      <div class="profile-input">
        <div class="input-group">
          <label>Length</label>
          <div class="input-with-unit">
            <input 
              type="number" 
              [(ngModel)]="profile.length" 
              placeholder="Length" 
              class="form-control"
              (ngModelChange)="onChange()">
            <select 
              [(ngModel)]="profile.unit" 
              class="form-control unit-select"
              (ngModelChange)="onChange()">
              <option value="mm">mm</option>
              <option value="ft">ft</option>
            </select>
          </div>
        </div>

        <div class="blade-size-section">
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                [(ngModel)]="profile.includeBladeSize"
                (ngModelChange)="onChange()">
              Include blade size in calculations
            </label>
          </div>
          
          <div class="input-group" *ngIf="profile.includeBladeSize">
            <label>Blade Size</label>
            <div class="input-with-unit">
              <input 
                type="number" 
                [(ngModel)]="profile.bladeSize" 
                placeholder="Blade Size" 
                class="form-control"
                (ngModelChange)="onChange()">
              <select 
                [(ngModel)]="profile.unit" 
                class="form-control unit-select"
                (ngModelChange)="onChange()" 
                disabled>
                <option value="mm">mm</option>
                <option value="ft">ft</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-input {
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: #fff;
    }
    .input-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
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
    .blade-size-section {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #ddd;
    }
    .checkbox-group {
      margin-bottom: 1rem;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }
    .checkbox-label input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
    }
  `]
})
export class ProfileInputComponent {
  @Input() profile: ProfileLength = {
    id: '1',
    length: 6000,
    unit: 'mm',
    bladeSize: 3,
    includeBladeSize: false
  };
  @Output() profileChange = new EventEmitter<ProfileLength>();

  onChange() {
    this.profileChange.emit(this.profile);
  }
}