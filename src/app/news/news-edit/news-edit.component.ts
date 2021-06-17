import { Component, OnInit } from '@angular/core';
import {News, NewsService} from '../../services/news.service';
import {formatDate} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {NewsEditFormComponent} from './news-edit-form/news-edit-form.component';

@Component({
  selector: 'app-news-edit',
  templateUrl: './news-edit.component.html',
  styleUrls: ['./news-edit.component.scss']
})
export class NewsEditComponent implements OnInit {
  private _dialog: MatDialog;
  private _newsSrv: NewsService;

  news: News[] = [];
  displayedColumns: string[] = ['created', 'description', 'start', 'end', 'delete'];
  current: News;

  constructor(newsSrv: NewsService, dialog: MatDialog) {
    this._dialog = dialog;
    this._newsSrv = newsSrv;
    newsSrv.newsList$.subscribe(news => {
      this.news = news;
    });
    newsSrv.getNews(false);
  }

  ngOnInit(): void {
  }

  formatedDate(date: Date): string {
    if (formatDate(date, 'y', 'ru') === '1') {
      return '-';
    } else {
      return formatDate(date, 'd MMMM y', 'ru');
    }
  }

  addNews(): void {
    this._dialog.open(NewsEditFormComponent, {
      data: new News()
    });
  }

  edit(news: News): void {
    this._dialog.open(NewsEditFormComponent, {
      data: news
    });
  }

  delete(news: News): void {
    this._newsSrv.deleteNews(news.id);
  }
}
