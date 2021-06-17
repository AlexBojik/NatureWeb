import {Component, Inject, OnInit} from '@angular/core';
import {News, NewsService} from '../../../services/news.service';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-news-edit-form',
  templateUrl: './news-edit-form.component.html',
  styleUrls: ['./news-edit-form.component.scss']
})
export class NewsEditFormComponent implements OnInit {
  private _newsSrv: NewsService;

  news: News;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, newsSrv: NewsService) {
    this._newsSrv = newsSrv;
    this.news = data;
  }

  ngOnInit(): void {
  }

  saveNews(): void {
    if (this.news.id === undefined) {
      this._newsSrv.saveNews(this.news);
    } else {
      this._newsSrv.updateNews(this.news);
    }
  }
}
