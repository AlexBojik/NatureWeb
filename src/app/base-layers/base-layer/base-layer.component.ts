import { Component } from '@angular/core';
import {BaseLayer, BaseLayerService} from '../base-layer.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DEFAULT} from '../../../consts';

@Component({
  selector: 'app-base-layer',
  templateUrl: './base-layer.component.html',
  styleUrls: ['./base-layer.component.scss']
})
export class BaseLayerComponent {
  current: BaseLayer;
  baseLayerForm: FormGroup;

  get default(): boolean {
    return this.current.name === DEFAULT;
  }

  constructor(private _fb: FormBuilder,
              private _bslSrv: BaseLayerService) {
    _bslSrv.current$.subscribe( current => {
      this.current = current
      this.baseLayerForm = _fb.group(this.current);
    });
  }

  save(): void {
    Object.assign(this.current, this.baseLayerForm.getRawValue());
    this._bslSrv.save(this.current);
  }

  delete(): void {
    this._bslSrv.delete(this.current);
  }
}
