import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-block" [class]="type">
      <span class="stat-label">{{ label }}</span>
      <div class="bar">
        <div 
          class="fill" 
          [style.width.%]="percentage"
          [class.low]="percentage < 30"
          [class.medium]="percentage >= 30 && percentage < 70"
          [class.high]="percentage >= 70"
        ></div>
      </div>
      <span class="stat-text">{{ current }}/{{ max }}</span>
    </div>
  `,
  styleUrls: ['./stat-bar.component.scss']
})
export class StatBarComponent {
  @Input() label = 'STAT';
  @Input() type: 'hp' | 'mp' | 'xp' = 'hp';
  @Input() current = 0;
  @Input() max = 100;
  @Input() percentage = 0;
}
