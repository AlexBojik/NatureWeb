import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {BehaviorSubject, Observable} from 'rxjs';

export class File {
  id: number;
  name: string;
}


@Injectable({
  providedIn: 'root'
})
export class FilesService {
  private _url = environment.baseUrl + 'files';

  private _files = new BehaviorSubject<File[]>([]);
  public readonly files$: Observable<File[]> = this._files.asObservable();

  constructor(private _httpClient: HttpClient) { }

  getFiles(): void {
    this._httpClient.get(this._url).subscribe(files => {
      this._files.next(files as File[]);
    });
  }

  uploadFiles(files: FileList): Promise<any> {
    const formData: FormData = new FormData();
    formData.append('fileKey', files.item(0), files.item(0).name);

    return this._httpClient.post(this._url, formData).toPromise().then( _ => {
      this.getFiles();
    });
  }

  deleteFile(f: File): void {
    this._httpClient.delete(this._url + '/' + f.id.toString()).subscribe(_ => {
      this.getFiles();
    });
  }
}
