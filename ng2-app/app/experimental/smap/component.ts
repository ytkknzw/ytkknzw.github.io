import { Component } from '@angular/core';

@Component({
    selector: 'my-ex-smap',
    template: `
<header class="header">
	<div class="header-left">
		<button class="btn btn-link" (click)="goBack()">
			<i class="glyphicon glyphicon-chevron-left"></i>
			<span class="hidden-xs"> Back</span>
		</button>
	</div>
	<div class="header-title">SVG Map</div>
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
export class SvgMapComponent {

	goBack() : void {
		history.back();
	}
}
