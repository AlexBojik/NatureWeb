import { Injectable } from '@angular/core';


export enum Path {
  MAP,
  LAYERS,
  DICTIONARY,
  ADMINISTRATION,
  MESSAGES,
  USERS
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
    if (this._currentPath !== Path.LAYERS) {
      this._currentPath = Path.LAYERS;
    } else {
      this.showMap();
    }
  }

  get mapActive(): boolean {
    return this._currentPath === Path.MAP;
  }

  get messageActive(): boolean {
    return this._currentPath === Path.MESSAGES;
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
    if (this._currentPath !== Path.DICTIONARY) {
      this._currentPath = Path.DICTIONARY;
    } else {
      this.showMap();
    }
  }

  showAdminToggle(): void {
    if (this._currentPath !== Path.ADMINISTRATION) {
      this._currentPath = Path.ADMINISTRATION;
    } else {
      this.showMap();
    }
  }

  showMessageToggle(): void {
    if (this._currentPath !== Path.MESSAGES) {
      this._currentPath = Path.MESSAGES;
    } else {
      this.showMap();
    }
  }

  showUsersToggle(): void {
    if (this._currentPath !== Path.USERS) {
      this._currentPath = Path.USERS;
    } else {
      this.showMap();
    }
  }
}
