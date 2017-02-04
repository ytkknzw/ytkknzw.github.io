/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/Control','sap/ui/core/IconPool','sap/ui/core/delegate/ItemNavigation','sap/ui/base/ManagedObject','sap/ui/core/delegate/ScrollEnablement','sap/ui/core/InvisibleText','./AccButton','./TabStripItem','./TabStripSelect','sap/ui/Device'],function(q,C,I,a,M,S,b,A,T,c,D){"use strict";var d=C.extend("sap.m.TabStrip",{metadata:{library:"sap.m",properties:{hasSelect:{type:"boolean",group:"Misc",defaultValue:false}},aggregations:{items:{type:"sap.m.TabStripItem",multiple:true,singularName:"item"},addButton:{type:"sap.m.Button",multiple:false,singularName:"addButton"},_select:{type:'sap.m.TabStripSelect',multiple:false,visibility:"hidden"},_rightArrowButton:{type:'sap.m.AccButton',multiple:false,visibility:"hidden"},_leftArrowButton:{type:'sap.m.AccButton',multiple:false,visibility:"hidden"}},associations:{selectedItem:{type:'sap.m.TabStripItem',group:"Misc"}},events:{itemClose:{allowPreventDefault:true,parameters:{item:{type:"sap.m.TabStripItem"}}},itemPress:{parameters:{item:{type:"sap.m.TabStripItem"}}},itemSelect:{allowPreventDefault:true,parameters:{item:{type:"sap.m.TabContainerItem"}}}}},constructor:function(i,s){var h=false;if(!s&&typeof i==='object'){s=i;}if(s){h=s['hasSelect'];delete s['hasSelect'];}sap.ui.base.ManagedObject.prototype.constructor.apply(this,arguments);this.setProperty('hasSelect',h,true);}});var r=sap.ui.getCore().getLibraryResourceBundle("sap.m");d.ICON_BUTTONS={LeftArrowButton:"slim-arrow-left",RightArrowButton:"slim-arrow-right",DownArrowButton:"slim-arrow-down",AddButton:"add"};d.SELECT_ITEMS_ID_SUFFIX='-SelectItem';d.SCROLL_SIZE=320;d.MIN_DRAG_OFFSET=sap.ui.Device.support.touch?15:5;d.SCROLL_ANIMATION_DURATION=sap.ui.getCore().getConfiguration().getAnimation()?500:0;d.ARIA_STATIC_TEXTS={closable:new b({text:r.getText("TABSTRIP_ITEM_CLOSABLE")}).toStatic(),modified:new b({text:r.getText("TABSTRIP_ITEM_MODIFIED")}).toStatic(),notModified:new b({text:r.getText("TABSTRIP_ITEM_NOT_MODIFIED")}).toStatic()};d.prototype.init=function(){this._bDoScroll=!sap.ui.Device.system.phone;this._bRtl=sap.ui.getCore().getConfiguration().getRTL();this._iCurrentScrollLeft=0;this._iMaxOffsetLeft=null;this._scrollable=null;this._oTouchStartX=null;if(!sap.ui.Device.system.phone){this._oScroller=new S(this,this.getId()+"-tabs",{horizontal:true,vertical:false,nonTouchScrolling:true});}};d.prototype.exit=function(){this._bRtl=null;this._iCurrentScrollLeft=null;this._iMaxOffsetLeft=null;this._scrollable=null;this._oTouchStartX=null;if(this._oScroller){this._oScroller.destroy();this._oScroller=null;}if(this._sResizeListenerId){sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);this._sResizeListenerId=null;}this._removeItemNavigation();};d.prototype.onBeforeRendering=function(){if(this._sResizeListenerId){sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);this._sResizeListenerId=null;}};d.prototype.onAfterRendering=function(){if(this._oScroller){this._oScroller.setIconTabBar(this,q.proxy(this._handleOverflowButtons,this),null);}this._addItemNavigation();if(!sap.ui.Device.system.phone){this._adjustScrolling();this._sResizeListenerId=sap.ui.core.ResizeHandler.register(this.getDomRef(),q.proxy(this._adjustScrolling,this));}};d.prototype.getFocusDomRef=function(){var t=sap.ui.getCore().byId(this.getSelectedItem());if(!t){return null;}return t.getDomRef();};d.prototype.applyFocusInfo=function(f){if(f.focusDomRef){q(f.focusDomRef).focus();}};d.prototype._addItemNavigation=function(){var h=this.getDomRef("tabsContainer"),i=this.getItems(),t=[];i.forEach(function(o){var e=o.getDomRef();q(e).attr("tabindex","-1");t.push(e);});if(!this._oItemNavigation){this._oItemNavigation=new a();}this._oItemNavigation.setRootDomRef(h);this._oItemNavigation.setItemDomRefs(t);this._oItemNavigation.setCycling(false);this._oItemNavigation.setPageSize(5);this.addDelegate(this._oItemNavigation);};d.prototype._checkScrolling=function(){var t=this.getDomRef("tabs"),s=t&&(t.scrollWidth>this.getDomRef("tabsContainer").clientWidth);this.$().toggleClass("sapMTSScrollable",s);return s;};d.prototype._handleOverflowButtons=function(){var t=this.getDomRef("tabs"),o=this.getDomRef("tabsContainer"),s,e,f,g=false,h=false,i=this._checkScrolling();if(i&&!this.getAggregation("_rightArrowButton")&&!this.getAggregation("_leftArrowButton")){this._getLeftArrowButton();this._getRightArrowButton();var R=sap.ui.getCore().createRenderManager();this.getRenderer().renderRightOverflowButtons(R,this,true);this.getRenderer().renderLeftOverflowButtons(R,this,true);R.destroy();}if(i&&t&&o){if(this._bRtl&&D.browser.firefox){s=-o.scrollLeft;}else{s=o.scrollLeft;}e=t.scrollWidth;f=o.clientWidth;if(Math.abs(e-f)===1){e=f;}if(s>0){if(this._bRtl&&D.browser.webkit){h=true;}else{g=true;}}if((e>f)&&(s+f<e)){if(this._bRtl&&D.browser.webkit){g=true;}else{h=true;}}this.$().toggleClass("sapMTSScrollBack",g).toggleClass("sapMTSScrollForward",h);}else{this.$().toggleClass("sapMTSScrollBack",false).toggleClass("sapMTSScrollForward",false);}};d.prototype._adjustScrolling=function(){this._iMaxOffsetLeft=Math.abs(this.$("tabsContainer").width()-this.$("tabs").width());this._handleOverflowButtons();};d.prototype._getLeftArrowButton=function(){return this._getArrowButton("_leftArrowButton",r.getText("TABSTRIP_SCROLL_BACK"),d.ICON_BUTTONS.LeftArrowButton,-d.SCROLL_SIZE);};d.prototype._getRightArrowButton=function(){return this._getArrowButton("_rightArrowButton",r.getText("TABSTRIP_SCROLL_FORWARD"),d.ICON_BUTTONS.RightArrowButton,d.SCROLL_SIZE);};d.prototype._getArrowButton=function(B,t,i,e){var o=this.getAggregation(B),f=this;if(!o){o=new A({type:sap.m.ButtonType.Transparent,icon:I.getIconURI(i),tooltip:t,tabIndex:"-1",ariaHidden:"true",press:function(E){f._scroll(e,d.SCROLL_ANIMATION_DURATION);}});this.setAggregation(B,o,true);}return o;};d.prototype._removeItemNavigation=function(){if(this._oItemNavigation){this.removeDelegate(this._oItemNavigation);this._oItemNavigation.destroy();delete this._oItemNavigation;}};d.prototype._scroll=function(i,e){var s=this.getDomRef("tabsContainer").scrollLeft,f=D.browser.internet_explorer||D.browser.edge,g;if(this._bRtl&&!f){g=s-i;if(D.browser.firefox){if(g<-this._iMaxOffsetLeft){g=-this._iMaxOffsetLeft;}if(g>0){g=0;}}}else{g=s+i;if(g<0){g=0;}if(g>this._iMaxOffsetLeft){g=this._iMaxOffsetLeft;}}this._oScroller.scrollTo(g,0,e);this._iCurrentScrollLeft=g;};d.prototype._scrollIntoView=function(i,e){var $=this.$("tabs"),f=i.$(),t=$.innerWidth()-$.width(),g=f.outerWidth(true),h=f.position().left-t/2,o=this.getDomRef("tabsContainer"),s=o.scrollLeft,j=this.$("tabsContainer").width(),n=s;if(h<0||h>j-g){if(this._bRtl&&D.browser.firefox){if(h<0){n+=h+g-j;}else{n+=h;}}else{if(h<0){n+=h;}else{n+=h+g-j;}}this._iCurrentScrollLeft=n;this._oScroller.scrollTo(n,0,e);}};d.prototype._createSelect=function(t){var s,o,e,f={type:sap.m.SelectType.IconOnly,autoAdjustWidth:true,icon:I.getIconURI(d.ICON_BUTTONS.DownArrowButton),tooltip:r.getText("TABSTRIP_OPENED_TABS"),change:function(E){o=E.getParameters()['selectedItem'];e=this._findTabStripItemFromSelectItem(o);this._activateItem(e,E);}.bind(this)};s=new c(f);this._addItemsToSelect(s,t);return s;};d.prototype.onsapselect=function(e){e.setMarked();e.preventDefault();this._activateItem(e.srcControl,e);};d.prototype.onsapdelete=function(e){var i=q("#"+e.target.id).control(0),s=i.getId()===this.getSelectedItem(),f=function(){this._moveToNextItem(s);};this._removeItem(i,f);};d.prototype._moveToNextItem=function(s){var i=this.getItems().length,e=this._oItemNavigation.getFocusedIndex(),n=i===e?--e:e,N=this.getItems()[n],f=function(){this._oItemNavigation.focusItem(n);};if(s){this.setSelectedItem(N);this.fireItemPress({item:N});}q.sap.delayedCall(0,this,f);};d.prototype._activateItem=function(i,e){if(this.fireItemSelect({item:i})){if(i&&i instanceof sap.m.TabStripItem){if(!this.getSelectedItem()||this.getSelectedItem()!==i.getId()){this.setSelectedItem(i);}this.fireItemPress({item:i});}}else if(e&&!e.isDefaultPrevented()){e.preventDefault();}};d.prototype.addAggregation=function(s,o,e){if(s==='items'){this._handleItemsAggregation(['addAggregation',o,e],true);}return C.prototype.addAggregation.call(this,s,o,e);};d.prototype.insertAggregation=function(s,o,i,e){if(s==='items'){this._handleItemsAggregation(['insertAggregation',o,i,e],true);}return C.prototype.insertAggregation.call(this,s,o,i,e);};d.prototype.removeAggregation=function(s,o,e){if(s==='items'){this._handleItemsAggregation(['removeAggregation',o,e]);}return C.prototype.removeAggregation.call(this,s,o,e);};d.prototype.removeAllAggregation=function(s,e){if(s==='items'){this._handleItemsAggregation(['removeAllAggregation',null,e]);}return C.prototype.removeAllAggregation.call(this,s,e);};d.prototype.destroyAggregation=function(s,e){if(s==='items'){this._handleItemsAggregation(['destroyAggregation',e]);}return C.prototype.destroyAggregation.call(this,s,e);};d.prototype.setSelectedItem=function(s){if(!s){return;}if(s.$().length>0){this._scrollIntoView(s,500);}this._updateAriaSelectedAttributes(this.getItems(),s);this._updateSelectedItemClasses(s.getId());if(this.getHasSelect()){var o=this._findSelectItemFromTabStripItem(s);this.getAggregation('_select').setSelectedItem(o);}return d.prototype.setAssociation.call(this,"selectedItem",s,true);};d.prototype.setProperty=function(p,v,s){var R;R=C.prototype.setProperty.call(this,p,v,s);if(p==='hasSelect'){if(v){if(!this.getAggregation('_select')){R=this.setAggregation('_select',this._createSelect(this.getItems()));}}else{R=this.destroyAggregation('_select');}}return R;};d.prototype._attachItemEventListeners=function(o){if(o instanceof T){var e=['itemClosePressed','itemPropertyChanged'];e.forEach(function(E){E=E.charAt(0).toUpperCase()+E.slice(1);o['detach'+E](this['_handle'+E]);o['attach'+E](this['_handle'+E].bind(this));},this);}};d.prototype._detachItemEventListeners=function(o){if(!o||typeof o!=='object'||!(o instanceof T)){var i=this.getItems();i.forEach(function(e){if(typeof e!=='object'||!(e instanceof T)){return;}return this._detachItemEventListeners(e);}.bind(this));}};d.prototype._handleItemPropertyChanged=function(e){var s=this._findSelectItemFromTabStripItem(e.getSource());s.setProperty(e['mParameters'].propertyKey,e['mParameters'].propertyValue);};d.prototype._handleItemClosePressed=function(e){this._removeItem(e.getSource());};d.prototype._removeItem=function(i,f){var t;if(!(i instanceof T)){q.sap.log.error('Expecting instance of a TabStripSelectItem, given: ',i);}if(i.getId().indexOf(d.SELECT_ITEMS_ID_SUFFIX)!==-1){t=this._findTabStripItemFromSelectItem(i);}else{t=i;}if(this.fireItemClose({item:t})){this.removeAggregation('items',t);this._moveToNextItem(i.getId()===this.getSelectedItem());if(f){f.call(this);}}};d.prototype._handleItemsAggregation=function(e,i){var s='items',f=e[0],o=e[1],n=[s];e.forEach(function(g,h){if(h>0){n.push(g);}});if(i){this._attachItemEventListeners(o);}else{this._detachItemEventListeners(o);}if(s!=="items"){return this;}if(this.getHasSelect()){this._handleSelectItemsAggregation(n,i,f,o);}return this;};d.prototype._handleSelectItemsAggregation=function(e,i,f,o){var s=this.getAggregation('_select'),g;if(f==='destroyAggregation'&&!s){return;}if(o===null||typeof o!=='object'){return s[f]['apply'](s,e);}if(i){g=this._createSelectItemFromTabStripItem(o);}else{g=this._findSelectItemFromTabStripItem(o);}e.forEach(function(h,j){if(typeof h==='object'){e[j]=g;}});return s[f]['apply'](s,e);};d.prototype._addItemsToSelect=function(s,i){i.forEach(function(o){var e=this._createSelectItemFromTabStripItem(o);s.addAggregation('items',e);if(o.getId()===this.getSelectedItem()){s.setSelectedItem(e);}},this);};d.prototype._createSelectItemFromTabStripItem=function(t){var s;if(!t&&!(t instanceof sap.m.TabContainerItem)){q.sap.log.error('Expecting instance of "sap.m.TabContainerItem": instead of '+t+' given.');return;}s=new sap.m.TabStripItem({id:t.getId()+d.SELECT_ITEMS_ID_SUFFIX,text:t.getText(),modified:t.getModified(),itemClosePressed:function(e){this._handleItemClosePressed(e);}.bind(this)}).addEventDelegate({ontap:function(e){var o=e.srcControl;if(o instanceof A){o.fireItemClosePressed({item:o});}else if(o instanceof sap.ui.core.Icon){o=o.getParent&&o.getParent().getParent&&o.getParent().getParent();o.fireItemClosePressed({item:o});}}});return s;};d.prototype._findTabStripItemFromSelectItem=function(t){var i,s=t.getId().replace(d.SELECT_ITEMS_ID_SUFFIX,''),e=this.getItems();for(i=0;i<e.length;i++){if(e[i].getId()===s){return e[i];}}};d.prototype._findSelectItemFromTabStripItem=function(t){var i,s,e=t.getId()+d.SELECT_ITEMS_ID_SUFFIX;if(this.getHasSelect()){s=this.getAggregation('_select').getItems();for(i=0;i<s.length;i++){if(s[i].getId()===e){return s[i];}}}};d.prototype._updateAriaSelectedAttributes=function(i,s){var e="false";i.forEach(function(o){if(o.$()){if(s&&s.getId()===o.getId()){e="true";}o.$().attr("aria-selected",e);}});};d.prototype._updateSelectedItemClasses=function(s){if(this.$("tabs")){this.$("tabs").children(".sapMTabStripItemSelected").removeClass("sapMTabStripItemSelected");q("#"+s).addClass("sapMTabStripItemSelected");}};d.prototype.changeItemState=function(i,s){var $;var e=this.getItems();e.forEach(function(o){if(i===o.getId()){$=q(o.$());if(s===true&&!$.hasClass(T.CSS_CLASS_MODIFIED)){$.addClass(T.CSS_CLASS_MODIFIED);}else{$.removeClass(T.CSS_CLASS_MODIFIED);}}});};d.prototype.ontouchstart=function(e){var t=q(e.target).control(0);if(t instanceof T||t instanceof A||t instanceof sap.ui.core.Icon||t instanceof c){this._oTouchStartX=e.changedTouches[0].pageX;}};d.prototype.ontouchend=function(e){var t,i;if(!this._oTouchStartX){return;}t=q(e.target).control(0);i=Math.abs(e.changedTouches[0].pageX-this._oTouchStartX);if(i<d.MIN_DRAG_OFFSET){if(t instanceof T){this._activateItem(t,e);}else if(t instanceof sap.m.AccButton){if(t&&t.getParent&&t.getParent()instanceof T){t=t.getParent();this._removeItem(t);}}else if(t instanceof sap.ui.core.Icon){if(t&&t.getParent&&t.getParent().getParent&&t.getParent().getParent()instanceof T){t=t.getParent().getParent();this._removeItem(t);}}this._oTouchStartX=null;}};return d;},false);
