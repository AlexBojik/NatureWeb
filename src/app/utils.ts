import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

export abstract class HasId {
  id: number;
}

export class Utils {
  static saveElement(http: HttpClient, url: string, element: HasId): Observable<any> {
    if (element.id === undefined) {
      element.id = 0;
      return http.post(url, element);
    } else {
      return http.put(url, element);
    }
  }
}
