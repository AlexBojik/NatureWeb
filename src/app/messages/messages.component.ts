import {Component, OnInit} from '@angular/core';
import {Message, MessageService} from '../services/message.service';
import {MatDialog} from '@angular/material/dialog';
import {MessageComponent} from '../message/message.component';


@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  updating = false;
  messages: Message[] = [];
  displayedColumns: string[] = ['id', 'userName', 'text', 'status'];

  constructor(private _msgSrv: MessageService,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.updating = true;
    this._msgSrv.messages$.subscribe(messages => {
      this.messages = messages;
      this.updating = false;
    });
    this._msgSrv.getMessages();
  }

  edit(row: Message): void {
    this._msgSrv.getImages(row.id);
    this.dialog.open(MessageComponent,  {
      width: '400px',
      data: {msg: row}
    });
  }

  sendMessages(): void {
    this._msgSrv.sendMessages();
  }
}
