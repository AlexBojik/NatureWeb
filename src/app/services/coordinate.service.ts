import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoordinateService {
  private _current = new BehaviorSubject<[number, number]>([0, 0]);
  public readonly current$: Observable<[number, number]> = this._current.asObservable();
  formatXY = true;


  set current(c) {
    this._current.next(c);
  }
  constructor() { }
}
