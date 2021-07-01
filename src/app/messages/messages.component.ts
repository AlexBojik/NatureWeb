import {Component, OnInit} from '@angular/core';
import {Message, MessageService} from '../services/message.service';
import {MatDialog} from '@angular/material/dialog';
import {MessageComponent} from './message/message.component';
import {MESSAGE_STATUSES} from '../../consts';
import {UsersService} from '../services/users.service';


@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  updating = false;
  messages: Message[] = [];
  displayedColumns: string[] = ['id', 'time', 'end', 'userName', 'employerName', 'text', 'status'];
  currentStatuses: number[] = [1];
  newFilter = false;
  sendFilter = true;
  workFilter = false;
  closeFilter = false;
  myFilter = false;

  get filteredMessages(): Message[] {
    return this.messages.filter(m =>
      (this.currentStatuses.includes(m.status) || this.currentStatuses.length === 0) &&
      (m.employerId === this._usrSrv.token.value || !this.myFilter)
    );
  }

  constructor(private _msgSrv: MessageService,
              public dialog: MatDialog,
              private _usrSrv: UsersService) {
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

  date(time: number): string {
    return time === 0 ? '-' : new Date(time * 1000).toLocaleString('ru-RU');
  }

  getStatusById(status: number): string {
    return MESSAGE_STATUSES[status];
  }

  canSendMessages(): boolean {
    return this._usrSrv.hasAdminRole();
  }

  private _changeFilter(): void {
    this.currentStatuses = [];
    if (this.newFilter) {
      this.currentStatuses.push(0);
    }
    if (this.sendFilter) {
      this.currentStatuses.push(1);
    }
    if (this.workFilter) {
      this.currentStatuses.push(2);
    }
    if (this.closeFilter) {
      this.currentStatuses.push(3);
    }
  }

  toggleNew(): void {
    this.newFilter = !this.newFilter;
    this._changeFilter();
  }
  toggleSend(): void {
    this.sendFilter = !this.sendFilter;
    this._changeFilter();
  }
  toggleWork(): void {
    this.workFilter = !this.workFilter;
    this._changeFilter();
  }
  toggleClose(): void {
    this.closeFilter = !this.closeFilter;
    this._changeFilter();
  }

  toggleMy(): void {
    this.myFilter = !this.myFilter;
    this._changeFilter();
  }
}
