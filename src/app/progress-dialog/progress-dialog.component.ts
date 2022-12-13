import {Component, OnDestroy} from '@angular/core';

@Component({
  selector: 'app-progress-dialog',
  templateUrl: './progress-dialog.component.html',
  styleUrls: ['./progress-dialog.component.scss']
})
export class ProgressDialogComponent implements OnDestroy {

  constructor() {
  }

  ngOnDestroy(): void {
  }
}
