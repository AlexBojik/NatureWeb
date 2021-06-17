import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {GeoObject, ObjectsService} from '../services/objects.service';
import {MapService} from '../services/map.service';
import {Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {DictionariesService, Value} from '../services/dictionaries.service';
import {MatAutocomplete, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {map, startWith} from 'rxjs/operators';
import {UsersService} from '../services/users.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  coordinates = '';
  fields: Value[] = [];
  visible = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  fieldCtrl = new FormControl();
  filteredFields: Observable<Value[]>;
  allFields: Value[] = [];

  @ViewChild('fieldInput') fieldInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  showFilter = false;

  constructor(private _objSrv: ObjectsService,
              private _mapSrv: MapService,
              private _dictSrv: DictionariesService,
              private _usrSrv: UsersService) {
    this.filteredFields = this.fieldCtrl.valueChanges.pipe(startWith(''),
      map((name: string | null) => name ? this._filter(name) : this.allFields.slice()));
    this._dictSrv.values$.subscribe(values => {
      this.allFields = values;
    });
    this._dictSrv.getAllValues();
    this._usrSrv.user$.subscribe(user => {
      this.showFilter = user.name !== '';
    });
  }

  ngOnInit(): void {
  }

  filterRegion(): void {
    let coordinates = [];
    for (const line of this.coordinates.split(/[\r\n]+/)) {
      const [x, y] = line.split(',');
      coordinates.push([parseFloat(x), parseFloat(y)]);
    }
    const [x1, y1] = coordinates[0];
    const [x2, y2] = coordinates.slice(-1)[0];
    if (x1 !== x2 || y1 !== y2) {
      coordinates.push([x1, y1]);
    }
    coordinates = [coordinates];
    const a = new GeoObject(0, '', 'Polygon', coordinates, '');
    this._mapSrv.drawFilter(a);
    const { stringify } = require('wkt');
    this._objSrv.filterObjects(3, stringify(a.geoJson));
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    // if ((value || '').trim()) {
    //   this.fields.push(value);
    // }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.fieldCtrl.setValue('');
  }

  remove(field): void {
    const index = this.fields.indexOf(field);

    if (index >= 0) {
      this.fields.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.fields.push(event.option.value);
    this.fieldInput.nativeElement.value = '';
    this.fieldCtrl.setValue('');
    this.filteredFields = this.fieldCtrl.valueChanges.pipe(startWith(''),
      map((name: string | null) => name ? this._filter(name) : this.allFields.slice()));
  }

  private _filter(value: string): Value[] {
    if (typeof(value) === 'string') {
      const filterValue = value.toLowerCase();
      return this.allFields.filter(fruit => fruit.name.toLowerCase().indexOf(filterValue) === 0);
    }
  }

  filterFields(): void {
    const fields = [];
    this.fields.forEach(f => fields.push(f.id));
    if (fields.length > 0) {
      this._objSrv.filterObjects(4, fields.join(','));
    }
  }

  drawFilter(): void {
    this._mapSrv.drawFilterPolygon();
  }
}
