import {Component, Inject, OnInit} from '@angular/core';
import {Message, MessageService} from '../../services/message.service';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {ImagesComponent} from '../../images/images.component';
import {environment} from '../../../environments/environment';
import {MESSAGE_STATUSES} from '../../../consts';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {
  messageStatus = MESSAGE_STATUSES;

  msg: Message;
  imageCatalog = environment.baseUrl + 'image/';
  constructor(@Inject(MAT_DIALOG_DATA) public data: {msg: Message},
              public dialog: MatDialog,
              private _msgSrv: MessageService) {
    this.msg = data.msg;
  }

  ngOnInit(): void {
  }

  openImages(img: string): void {
    this.dialog.open(ImagesComponent, {
      data: {image: img}
    });
  }

  save(): void {
    this._msgSrv.putMessage(this.msg);
  }
}
