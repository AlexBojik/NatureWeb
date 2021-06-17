import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {DictionariesService} from './services/dictionaries.service';
import {MapService} from './services/map.service';
import {ImageService} from './services/image.service';
import {timer} from 'rxjs';
import {MessageService} from './services/message.service';
import {map} from 'rxjs/operators';
import {NavigateService} from './services/navigate.service';
import {UsersService} from './services/users.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('map', {static: false}) private map: ElementRef;
  path = 'map';

  constructor(private dictService: DictionariesService,
              private mapService: MapService,
              private imgSrv: ImageService,
              private msgSrv: MessageService,
              private navSrv: NavigateService) {
    imgSrv.init();
    UsersService.checkToken();

    // this.dictService.updateDictionaries();
    timer(0, 10000).pipe().subscribe(() => {
      this.msgSrv.getCountMessages();
    });
  }

  get mapActive(): boolean {
    return this.navSrv.mapActive;
  }

  get messageActve(): boolean {
    return this.navSrv.messageActive;
  }

  get layersActive(): boolean {
    return this.navSrv.layersActive;
  }

  get dictionaryActive(): boolean {
    return this.navSrv.dictionaryActive;
  }

  get adminActive(): boolean {
    return this.navSrv.adminActive;
  }

  get usersActive(): boolean {
    return this.navSrv.usersActive;
  }
}
