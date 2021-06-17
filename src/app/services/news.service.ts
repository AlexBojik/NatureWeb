import { Injectable } from '@angular/core';
import {URL_NEWS, URL_NEWS_LIST} from '../../consts';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';

export class News {
  id: number;
  created: Date;
  start: Date;
  end: Date;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private _http: HttpClient;

  private _news = new BehaviorSubject<News[]>([]);
  public readonly newsList$: Observable<News[]> = this._news.asObservable();

  constructor(http: HttpClient) {
    this._http = http;
  }

  getNews(filtered = true): void {
    let url = URL_NEWS;
    if (filtered) {
      url = URL_NEWS_LIST;
    }
    this._http.get(url).subscribe(news => {
      this._news.next(news as [News]);
    });
  }

  saveNews(news: News): void {
    this._http.post(URL_NEWS, news).subscribe(id => {
      if (id === 0) { }
      this.getNews(false);
    });
  }
  updateNews(news: News): void {
    this._http.put(URL_NEWS, news).subscribe(id => {
      this.getNews(false);
    });
  }
  deleteNews(id: number): void {
    this._http.delete(URL_NEWS + '/' + id.toString()).subscribe(value => {
      this.getNews(false);
    });
  }
}
