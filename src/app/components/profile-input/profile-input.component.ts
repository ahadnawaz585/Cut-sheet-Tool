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
  `]
})
export class ProfileInputComponent {
  @Input() profile: ProfileLength = {
    id: '1',
    length: 6000,
    unit: 'mm'
  };
  @Output() profileChange = new EventEmitter<ProfileLength>();

  onChange() {
    this.profileChange.emit(this.profile);
  }
}