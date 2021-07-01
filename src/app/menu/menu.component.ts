import {Component, OnInit} from '@angular/core';
import {UsersService} from '../services/users.service';
import {MapService} from '../services/map.service';
import {MessageService} from '../services/message.service';
import {NavigateService} from '../services/navigate.service';
import {MatDialog} from '@angular/material/dialog';
import {WarningComponent} from '../warning/warning.component';
import {ObjectsService} from '../services/objects.service';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  userName = '';
  showLayersButton = false;
  showDictionaries = false;
  showMessages = false;
  showAdmin = false;
  showSearch = false;
  countMessages: number;
  showUsers = false;

  constructor(private userSrv: UsersService,
              private mapSrv: MapService,
              private msgSrv: MessageService,
              private navSrv: NavigateService,
              private objSrv: ObjectsService,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.msgSrv.count$.subscribe(count => {
      this.countMessages = count;
    });
    this.userSrv.user$.subscribe(user => {
      if (user) {
        this.userName = user.name;
        this.showLayersButton = user.layers;
        this.showDictionaries = user.dicts;
        this.showAdmin = user.admin;
        this.showMessages = user.messages;
        this.showSearch = true;
        this.showUsers = user.admin;
      }
    });
  }

  showLayersComponent(): void {
    this.navSrv.showLayersToggle();
  }

  showMapComponent(): void{
    this.navSrv.showMap();
  }

  showDictionaryComponent(): void {
    this.navSrv.showDictionaryToggle();
  }

  showAdminComponent(): void {
    this.navSrv.showAdminToggle();
  }

  showMessageComponent(): void {
    this.navSrv.showMessageToggle();
  }

  showWarning(): void {
    this.dialog.open(WarningComponent, {
      maxHeight: '90vh'
    });
  }

  showAuth(): void {
    if (!this.userName) {
      window.location.href = environment.authUrl;
    }
  }

  search(value: string): void {
    this.objSrv.filterObjects(1, value);
  }

  exit(): void {
    localStorage.clear();
    window.location.reload();
  }

  showUsersComponent(): void {
    this.navSrv.showUsersToggle();
  }
}
