import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GeoObject} from '../services/objects.service';

class Coordinate {
  lon: number;
  lat: number;
}

@Component({
  selector: 'app-object-coordinates',
  templateUrl: './object-coordinates.component.html',
  styleUrls: ['./object-coordinates.component.scss']
})
export class ObjectCoordinatesComponent implements OnInit {
  @Input() object: GeoObject;
  coordinates: string;

  constructor() {
  }

  ngOnInit(): void {
  }
}
