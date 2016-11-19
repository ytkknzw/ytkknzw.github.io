import { Component } from '@angular/core';

@Component({
    template: `
<header class="header">
	<div class="header-left">
		<button class="btn btn-link" (click)="goBack()">
			<i class="glyphicon glyphicon-chevron-left"></i>
			<span class="hidden-xs"> Back</span>
		</button>
	</div>
	<div class="header-title">Forms</div>
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
export class ExFormsComponent {

	goBack() : void {
		history.back();
	}

	showAction() : void {

	}
}
