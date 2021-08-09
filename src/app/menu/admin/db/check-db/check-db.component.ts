import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-check-db',
  templateUrl: './check-db.component.html',
  styleUrls: ['./check-db.component.scss']
})
export class CheckDbComponent implements OnInit {

  upl = false;
  test = false;

  constructor() { }

  ngOnInit(): void {
  }

  up(): void {
    this.test = false;
    this.upl = true;
    setTimeout(_ => {
      this.test = true;
      this.upl = false;
    }, 10000);
  }
}
