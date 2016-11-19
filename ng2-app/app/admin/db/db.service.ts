import {Injectable} from '@angular/core';
import {Http}   from '@angular/http'

// import 'rxjs'
// import '../../rxjs-extensions'
import 'rxjs/add/operator/toPromise'

export interface TableMetadata {
  Field: string
  Type: string
  Null: string
  Key: string
  Default: string
  Extra: string
}

export interface Affected {
  affected: number
}

@Injectable()
export class DbService {

  private URL = 'http://localhost/slim-app/public/index.php/database'

  constructor(private http: Http){}

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  getTables() : Promise<any[]> {
    let url = this.URL
    return this.http.options(url).toPromise()
      .then(res => res.json())
      .catch(this.handleError)
  }

  getTableMetadata(table: string) : Promise<TableMetadata[]> {
    let url = this.URL + '/' + table
    return this.http.options(url).toPromise()
      .then(res => res.json())
      .catch(this.handleError)
  }

  select(table: string) : Promise<any[]> {
    let url = this.URL + '/' + table
    return this.http.get(url).toPromise().catch(this.handleError)
      .then(res => res.json())
  }

  insert(table: string) : Promise<Affected> {
    let url = this.URL + '/' + table
    return this.http.post(url, {}).toPromise()
      .then(res => res.json() as Affected)
      .catch(this.handleError)
  }

  update(table: string, id: number) : Promise<Affected> {
    let url = this.URL + '/' + table + '/' + id
    return this.http.put(url, {}).toPromise().catch(this.handleError)
      .then(res => res.json())
  }

  delete(table: string, id: number) : Promise<Affected> {
    let url = this.URL + '/' + table + '/' + id
    return this.http.delete(url).toPromise().catch(this.handleError)
      .then(res => res.json())
  }

}

