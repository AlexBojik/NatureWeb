import { Component, OnInit } from '@angular/core';
import {News, NewsService} from '../services/news.service';

@Component({
  selector: 'app-warning',
  templateUrl: './warning.component.html',
  styleUrls: ['./warning.component.scss']
})
export class WarningComponent implements OnInit {
  news = [];

  constructor(newsSrv: NewsService) {
    newsSrv.getNews();
    newsSrv.newsList$.subscribe(news => {
      this.news = news;
    });
  }

  ngOnInit(): void {

  }

}
