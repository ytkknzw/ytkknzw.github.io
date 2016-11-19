import { Component, OnInit } from '@angular/core';
declare var $:any;

@Component({
    selector: 'my-ex-charts',
    template: `
<header class="header">
	<div class="header-left">
		<button class="btn btn-link" (click)="goBack()">
			<i class="glyphicon glyphicon-chevron-left"></i>
			<span class="hidden-xs"> Back</span>
		</button>
	</div>
	<div class="header-title">Charts</div>
	<div class="header-right">
		<button class="btn btn-link" (click)="goBack()">
			<i class="glyphicon glyphicon-option-vertical"></i>
			<span class="hidden-xs"> Actions</span>
		</button>
	</div>
</header>
<section>
	<h1> Page Body </h1>
</section>
`
})
export class ChartsComponent implements OnInit {

	constructor(){}

	ngOnInit() : void {
		var $h1 = $('h1')
		console.log($h1)
		alert($h1.text())
	}

	goBack() : void {
		history.back();
	}
}
