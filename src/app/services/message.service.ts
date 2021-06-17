import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../environments/environment';
import {URL_NEW_MESSAGES, URL_SEND_MESSAGES} from '../../consts';



export class Message {
  id: number;
  userName: string;
  text: string;
  status: number;
  images: string[];
  imageLoads = false;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  url = environment.baseUrl;

  private _messageMap: Map<number, Message> = new Map();
  private _messages = new BehaviorSubject<Message[]>([]);
  private _count = new BehaviorSubject<number>(0);
  public readonly messages$: Observable<Message[]> = this._messages.asObservable();
  public readonly count$: Observable<number> = this._count.asObservable();

  constructor(private _http: HttpClient,
              private _snackBar: MatSnackBar) {
  }

  getMessages(): void {
    const url = this.url + 'messages';

    this._http.get(url).toPromise().then(messages => {
      const msg = messages as Message[];
      this._messages.next(msg);
      msg.forEach(m => {
        this._messageMap[m.id] = m;
      });
    });
  }

  getCountMessages(): void {
    this._http.get(URL_NEW_MESSAGES).toPromise().then(count => {
      if (this._count.getValue() !== count as number) {
        this._count.next(count as number);
        this._snackBar.open('Появились новые обращения!', 'ОК', {duration: 2000});
      }
    });
  }

  getMessageById(id): Message {
    return this._messageMap[id];
  }

  getImages(id): void {
    const url = this.url + 'messages/' + id;
    const msg =  this.getMessageById(id);
    if (msg.imageLoads) {
      return;
    } else {
      msg.images = [];
    }
    this._http.get(url).toPromise().then(images => {
      (images as {jpeg: string}[]).forEach(i => {
        msg.images.push(i.jpeg);
      });
      msg.imageLoads = true;
    });
  }

  sendMessages(): void {
    this._http.get(URL_SEND_MESSAGES).subscribe( i => {
      console.log(i);
    });
  }
}
