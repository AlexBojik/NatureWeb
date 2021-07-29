import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DictionariesService, Dictionary} from '../../../services/dictionaries.service';

@Component({
  selector: 'app-dictionary',
  templateUrl: './dictionary.component.html',
  styleUrls: ['./dictionary.component.scss']
})
export class DictionaryComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Dictionary, private dictService: DictionariesService) { }

  ngOnInit(): void {
  }

  save(): void {
    this.dictService.saveDictionary(this.data);
  }

  delete(): void {
    this.dictService.deleteDictionary(this.data);
  }
}
