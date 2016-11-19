import {Injectable} from '@angular/core'
import {Http} from '@angular/http'

// import 'rxjs'
// import '../../rxjs-extensions'
import 'rxjs/add/operator/toPromise'

export interface Employee {
	seq : number
	created : string
	modified : string
	modifiedby : number
	start_date : string
	end_date : string
	user_id : number
	company_code : string
	employee_code : string
	employee_type_code : string
	name_first_local : string
	name_first_en : string
	name_first_phonetic : string
	name_last_local : string
	name_last_en : string
	name_last_phonetic : string
	name_other_local : string
	name_other_en : string
	name_other_phonetic : string
	sexuality : string
	date_of_birth : string
	nationalities : string
	email : string
	limit_over_time : number
}
@Injectable()
export class EmployeesService {

	private URL = 'http://localhost/slim-app/public/index.php'

	constructor(
		private http: Http) {
	}

	getEmployees() : Promise<Employee[]> {
		let url = this.URL + '/employees'
		return this.http.get(url).toPromise()
			.then(dat => dat.json() as Employee[])
			.catch(err => err)
	}

	getEmployee(code: string) : Promise<Employee> {
		let url = this.URL + '/employees/' + code
		return this.http.get(url).toPromise()
			.then(dat => dat.json() as Employee)
			.catch(err => err)
	}
}

