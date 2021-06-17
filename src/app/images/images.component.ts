import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss']
})
export class ImagesComponent implements OnInit {
  img: string;
  imageCatalog = environment.baseUrl + 'image/';

  constructor(@Inject(MAT_DIALOG_DATA) public data: {image: string}) {
    this.img = data.image;
  }

  ngOnInit(): void {

  }

}
