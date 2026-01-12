import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-decorative-banners',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="banner-decorations">
      <img 
        [src]="leftBannerSrc" 
        [alt]="leftBannerAlt" 
        class="banner-left" 
      />
      <img 
        [src]="leftFlagSrc" 
        [alt]="leftFlagAlt" 
        class="drapeau-left" 
      />
      <img 
        [src]="rightBannerSrc" 
        [alt]="rightBannerAlt" 
        class="banner-right" 
      />
      <img 
        [src]="rightFlagSrc" 
        [alt]="rightFlagAlt" 
        class="drapeau-right" 
      />
    </div>
  `,
  styleUrls: ['./decorative-banners.component.scss']
})
export class DecorativeBannersComponent {
  @Input() leftBannerSrc = 'assets/images/banner-left.png';
  @Input() leftBannerAlt = 'Bannière gauche';
  @Input() leftFlagSrc = 'assets/images/drapeau-left.png';
  @Input() leftFlagAlt = 'Drapeau gauche';
  
  @Input() rightBannerSrc = 'assets/images/banner-right.png';
  @Input() rightBannerAlt = 'Bannière droite';
  @Input() rightFlagSrc = 'assets/images/drapeau-right.png';
  @Input() rightFlagAlt = 'Drapeau droit';
}
