import { Injectable } from '@angular/core';


export enum Path {
  MAP,
  LAYERS,
  DICTIONARY,
  ADMINISTRATION,
  MESSAGES,
  USERS,
  FIELDS
}


@Injectable({
  providedIn: 'root'
})
export class NavigateService {
  private _currentPath: Path;

  constructor() {
    this.showMap();
  }

  showMap(): void {
    this._currentPath = Path.MAP;
  }

  showLayersToggle(): void {
    this._togglePath(Path.LAYERS);
  }

  get mapActive(): boolean {
    return this._currentPath === Path.MAP;
  }

  get messageActive(): boolean {
    return this._currentPath === Path.MESSAGES;
  }

  get fieldsActive(): boolean {
    return this._currentPath === Path.FIELDS;
  }

  get layersActive(): boolean {
    return this._currentPath === Path.LAYERS;
  }

  get dictionaryActive(): boolean {
    return this._currentPath === Path.DICTIONARY;
  }

  get adminActive(): boolean {
    return this._currentPath === Path.ADMINISTRATION;
  }

  get usersActive(): boolean {
    return this._currentPath === Path.USERS;
  }


  showDictionaryToggle(): void {
    this._togglePath(Path.DICTIONARY);
  }

  showAdminToggle(): void {
    this._togglePath(Path.ADMINISTRATION);
  }

  showMessageToggle(): void {
    this._togglePath(Path.MESSAGES);
  }

  showUsersToggle(): void {
    this._togglePath(Path.USERS);
  }

  showFieldsToggle(): void {
    this._togglePath(Path.FIELDS);
  }

  private _togglePath(value: Path): void {
    if (this._currentPath !== value) {
      this._currentPath = value;
    } else {
      this.showMap();
    }
  }
}
