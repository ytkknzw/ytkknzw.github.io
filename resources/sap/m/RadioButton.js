/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./library','sap/ui/core/Control','sap/ui/core/EnabledPropagator'],function(q,l,C,E){"use strict";var R=C.extend("sap.m.RadioButton",{metadata:{library:"sap.m",properties:{enabled:{type:"boolean",group:"Behavior",defaultValue:true},selected:{type:"boolean",group:"Data",defaultValue:false},groupName:{type:"string",group:"Behavior",defaultValue:'sapMRbDefaultGroup'},text:{type:"string",group:"Appearance",defaultValue:null},textDirection:{type:"sap.ui.core.TextDirection",group:"Appearance",defaultValue:sap.ui.core.TextDirection.Inherit},width:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:''},activeHandling:{type:"boolean",group:"Appearance",defaultValue:true},editable:{type:"boolean",group:"Behavior",defaultValue:true},valueState:{type:"sap.ui.core.ValueState",group:"Data",defaultValue:sap.ui.core.ValueState.None},textAlign:{type:"sap.ui.core.TextAlign",group:"Appearance",defaultValue:sap.ui.core.TextAlign.Begin}},events:{select:{parameters:{selected:{type:"boolean"}}}},associations:{ariaDescribedBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaDescribedBy"},ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}}}});E.call(R.prototype);R.prototype._groupNames={};R.prototype.ontap=function(e){if(!this.getEnabled()||!this.getEditable()){return;}e&&e.setMarked();this.applyFocusInfo();if(!this.getSelected()){this.setSelected(true);var t=this;setTimeout(function(){t.fireSelect({selected:true});},0);}};R.prototype.ontouchstart=function(e){e.originalEvent._sapui_handledByControl=true;if(this.getEnabled()&&this.getActiveHandling()){this.$().toggleClass("sapMRbBTouched",true);}};R.prototype.ontouchend=function(e){this.$().toggleClass("sapMRbBTouched",false);};R.prototype.onsapnext=function(e){this._arrowsHandler("next");e.setMarked();return this;};R.prototype.onsapprevious=function(e){this._arrowsHandler();e.setMarked();return this;};R.prototype._arrowsHandler=function(p){if(this.getParent()instanceof sap.m.RadioButtonGroup){return;}var v=this._groupNames[this.getGroupName()].filter(function(r){return(r.getDomRef()&&r.getEnabled());});var b=v.indexOf(this);if(p==="next"){var n=(b+1)%v.length;v[n].focus();}else{b=b-1;var P=b<0?v.length-1:b;v[P].focus();}};R.prototype.onsapselect=function(e){e.preventDefault();this.ontap(e);};R.prototype.setSelected=function(s){var c,S=this.getSelected(),g=this.getGroupName(),a=this._groupNames[g],L=a&&a.length;this.setProperty("selected",s,true);this._changeGroupName(this.getGroupName());if(!!s&&g&&g!==""){for(var i=0;i<L;i++){c=a[i];if(c instanceof R&&c!==this&&c.getSelected()){c.fireSelect({selected:false});c.setSelected(false);}}}if((S!==!!s)&&this.getDomRef()){this.$().toggleClass("sapMRbSel",s);if(s){this.getDomRef().setAttribute("aria-checked","true");this.getDomRef("RB").checked=true;this.getDomRef("RB").setAttribute("checked","checked");}else{this.getDomRef().removeAttribute("aria-checked");this.getDomRef("RB").checked=false;this.getDomRef("RB").removeAttribute("checked");}}return this;};R.prototype.setText=function(t){this.setProperty("text",t,true);if(this._oLabel){this._oLabel.setText(this.getText());}else{this._createLabel("text",this.getText());}this.addStyleClass("sapMRbHasLabel");return this;};R.prototype.setWidth=function(w){this.setProperty("width",w,true);if(this._oLabel){this._oLabel.setWidth(this.getWidth());}else{this._createLabel("width",this.getWidth());}return this;};R.prototype.setTextDirection=function(d){this.setProperty("textDirection",d,true);if(this._oLabel){this._oLabel.setTextDirection(this.getTextDirection());}else{this._createLabel("textDirection",this.getTextDirection());}return this;};R.prototype.setGroupName=function(g){this._changeGroupName(g,this.getGroupName());return this.setProperty("groupName",g,true);};R.prototype.onBeforeRendering=function(){return this._changeGroupName(this.getGroupName());};R.prototype.exit=function(){var g=this.getGroupName(),c=this._groupNames[g],G=c&&c.indexOf(this);this._iTabIndex=null;if(this._oLabel){this._oLabel.destroy();}if(G&&G!==-1){c.splice(G,1);}};R.prototype._createLabel=function(p,v){this._oLabel=new sap.m.Label(this.getId()+"-label").addStyleClass("sapMRbBLabel").setParent(this,null,true);this._oLabel.setProperty(p,v,false);};R.prototype.setTabIndex=function(t){var f=this.getFocusDomRef();this._iTabIndex=t;if(f){f.setAttribute("tabindex",t);}return this;};R.prototype.setTextAlign=function(a){this.setProperty("textAlign",a,true);if(this._oLabel){this._oLabel.setTextAlign(this.getTextAlign());}else{this._createLabel("textAlign",this.getTextAlign());}return this;};R.prototype._changeGroupName=function(n,o){var N=this._groupNames[n],O=this._groupNames[o];if(O&&O.indexOf(this)!==-1){O.splice(O.indexOf(this),1);}if(!N){N=this._groupNames[n]=[];}if(N.indexOf(this)===-1){N.push(this);}};return R;},true);
