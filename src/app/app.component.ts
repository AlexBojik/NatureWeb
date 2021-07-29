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

    // this.test();
  }

  test(): void {
    const re = /..°.{1,2}΄.{1,7}"/g;
    const coordinates = [];
    let x = 0;
    let y = 0;
    let match;
    const str = ' с.ш., 41°58΄27,3" в.д.';
    do {
      match = re.exec(str);
      if (match) {
        const [g, ms] = match[0].split('°');
        const [m, s] = ms.split('΄');
        if (x === 0) {
          x = parseInt(g, 0) + parseInt(m, 0) / 60 + parseFloat(s.replace('"', '')) / 3600;
        } else {
          y = parseInt(g, 0) + parseInt(m, 0) / 60 + parseFloat(s.replace('"', '')) / 3600;
          if (x > y) {
            coordinates.push([y, x]);
          } else {
            coordinates.push([x, y]);
          }

          x = 0;
          y = 0;
        }
      }
    } while (match);
    console.log(coordinates);
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

  get fieldsActive(): boolean {
    return this.navSrv.fieldsActive;
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
