import { Injectable } from '@angular/core';

// import 'rxjs'
// import '../../rxjs-extensions'
// import 'rxjs/add/operator/toPromise'

export interface Table {
  id: number
  name: string
}

const TEXTS: Table[] = [
  {'id':1, 'name':'Dragon Burning Cities'},
  {'id':2, 'name':'Sky Rains Great White Sharks'},
  {'id':3, 'name':'Giant Asteroid Heading For Earth'},
  {'id':4, 'name':'Procrastinators Meeting Delayed Again'},
];

const FETCH_LATENCY = 100;

@Injectable()
export class TableService {

  getTables() {
    return new Promise<Table[]>(resolve => {
      setTimeout(() => {
        resolve(TEXTS);
      }, FETCH_LATENCY);
    });
  }

  getTable(id: number | string) {
    return this.getTables().then(tables => tables.find(table => table.id === +id));
  }


}

