import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-coordinate',
  templateUrl: './coordinate.component.html',
  styleUrls: ['./coordinate.component.scss']
})
export class CoordinateComponent implements OnInit {
  coordinates  = '';
  coordinatesFg = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    if (data.geoJson.type === 'Point') {
      const c = data.geoJson.coordinates;
      this.coordinates += '' + c[1] + ' ' + c[0];
      this.coordinatesFg += '' + this.grad(c[1]) + ' ' + this.grad(c[0]);
    } else if (data.geoJson.type === 'Polygon') {
      data.geoJson.coordinates[0].forEach(c => {
        this.coordinates += '' + c[0] + ' ' + c[1] + '\n';
        this.coordinatesFg += '' + this.grad(c[0]) + ' ' + this.grad(c[1]) + '\n';
      });
    } else if (data.geoJson.type === 'MultiPolygon') {
      data.geoJson.coordinates[0][0].forEach(c => {
        this.coordinates += '' + c[0] + ' ' + c[1] + '\n';
        this.coordinatesFg += '' + this.grad(c[0]) + ' ' + this.grad(c[1]) + '\n';
      });
    }
  }

  grad(dec): string {
    const g = Math.trunc(dec);
    const m = Math.trunc((dec - g) * 60);
    const s = Math.round((dec - g - m / 60) * 36000) / 10;
    return g + '° ' + ('00' + m).slice(-2) + '\' ' + s + '"';
  }

  ngOnInit(): void {
  }

}
