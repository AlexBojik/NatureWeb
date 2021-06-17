import { Injectable } from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer) { }

  init(): void {
    // капля
    this.matIconRegistry.addSvgIcon('water', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/water.svg'));
    // нефтяная вышка
    this.matIconRegistry.addSvgIcon('oil', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/oil-pump.svg'));
    // лес
    this.matIconRegistry.addSvgIcon('forest', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/forest.svg'));
    // щит
    this.matIconRegistry.addSvgIcon('security', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/security.svg'));
    // олень
    this.matIconRegistry.addSvgIcon('deer', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/deer.svg'));
    // росреестр
    this.matIconRegistry.addSvgIcon('pkk', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/pkk.svg'));

  }
}
