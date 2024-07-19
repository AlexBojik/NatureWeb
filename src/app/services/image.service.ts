import { Injectable } from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';


export class ImageRecord {
  id: string;
  name?: string;
  url?: string;
}
@Injectable({
  providedIn: 'root'
})
export class ImageService {

  images: ImageRecord[] = [
    { id: 'water', name: 'Синяя капля', url: './assets/water.svg' },
    { id: 'oil', name: 'Нефтяная вышка', url: './assets/oil-pump.svg' },
    { id: 'forest', name: 'Лес', url: './assets/forest.svg' },
    { id: 'security', name: 'Щит', url: './assets/security.svg' },
    { id: 'deer', name: 'Олень', url: './assets/deer.svg' },
    { id: 'pkk', name: 'Росреестр', url: './assets/pkk.svg' },
    { id: 'contacts', name: 'Контакты', url: './assets/contacts.svg' },
  ];
  constructor(private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer) { }

  init(): void {
    this.images.forEach( i => {
      this.matIconRegistry.addSvgIcon(i.id, this.domSanitizer.bypassSecurityTrustResourceUrl(i.url));
    });
  }

  getImages(): ImageRecord[] {
    return this.images;
  }
}
