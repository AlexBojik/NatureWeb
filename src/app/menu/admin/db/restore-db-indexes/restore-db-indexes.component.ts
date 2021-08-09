import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-restore-db-indexes',
  templateUrl: './restore-db-indexes.component.html',
  styleUrls: ['./restore-db-indexes.component.scss']
})
export class RestoreDbIndexesComponent implements OnInit {
  rebuilding = false;
  rebuilded = false;

  constructor() { }

  ngOnInit(): void {
  }

  rebuild(): void {
    this.rebuilding = true;
    this.rebuilded = false;
    setTimeout(_ => {
      this.rebuilding = false;
      this.rebuilded = true;
    }, 20000);
  }
}
