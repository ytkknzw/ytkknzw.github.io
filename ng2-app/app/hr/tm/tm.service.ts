import { Injectable } from '@angular/core';
import {Http} from '@angular/http'

import 'rxjs/add/operator/toPromise'

export interface DailyReport {
  seq : number
  created : string
  modified : string
  modifiedby : number
  company_code : string
  employee_code : string
  employee_name : string
  time_zone : string
  ymd : string
  calendar_code : string
  calendar_text : string
  category_code : string
  category_text : string
  time0 : string
  time1 : string
  time2 : string
  time3 : string
  rest0 : number
  rest1 : number
  rest2 : number
  work_hours : number
  deduction : number
  overtime0 : number
  overtime1 : number
  overtime2 : number
  overtime3 : number
  signal_code : string
  signal_text : string
  reason_code : string
  reason_text : string
  memo : string
  note : string
  applied : string
  appliedby : number
  approved : string
  approvedby : number
  settled : string
  settledby : string
}

@Injectable()
export class TimeManagementService {

  private URL = 'http://localhost/slim-app/public/index.php'

  constructor(
    private http: Http) {
  }

  getTmSheet() : Promise<DailyReport[]> {
    let url = this.URL + '/tm'
    return this.http.get(url).toPromise()
      .then(dat => dat.json() as DailyReport[])
      .catch(err => err)
  }

}

