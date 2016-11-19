import {Component}   from '@angular/core';

@Component({
  template: `<router-outlet></router-outlet>`
})
export class EmployeesComponent {

  constructor() {
    window.scrollTo(0, 0)
  }

}
