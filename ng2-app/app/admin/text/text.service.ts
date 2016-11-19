import {Injectable} from '@angular/core';
import {Http}   from '@angular/http'

// import 'rxjs'
// import '../../rxjs-extensions'
import 'rxjs/add/operator/toPromise'

export interface Text {
  locale: string
  page: string
  text_key: string
  text: string
}

@Injectable()
export class TextService {

  private URL = 'http://localhost/slim-app/public/index.php/text'
  private URL2 = 'http://localhost/slim-app/public/index.php/text2'

  constructor(private http: Http){}

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  select2() : Promise<Text[]> {
    return this.http.get(this.URL2).toPromise()
      .then(res => res.json())
      .catch(this.handleError)
  }

  select(locale: string, page?: string) : Promise<Text[]> {
    let url = this.URL + '/' + locale + (page ? '/' + page: '')
    return this.http.get(url).toPromise()
      .then(res => res.json())
      .catch(this.handleError)
  }

  insert(row: Text) : Promise<string> {
    let url = this.URL
    return this.http.get(url).toPromise()
      .then(res => res.json())
      .catch(this.handleError)
  }

  update(row: Text) : Promise<string> {
    let url = this.URL
    return this.http.get(url).toPromise()
      .then(res => res.json())
      .catch(this.handleError)
  }

  delete(id: number) : Promise<string> {
    let url = this.URL + '/' + id
    return this.http.get(url).toPromise()
      .then(res => res.json())
      .catch(this.handleError)
  }

}

