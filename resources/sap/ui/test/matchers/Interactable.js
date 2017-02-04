/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./Matcher','./Visible','sap/ui/test/launchers/iFrameLauncher'],function($,M,V,f){"use strict";var v=new V();return M.extend("sap.ui.test.matchers.Interactable",{isMatching:function(c){var h=f._getIXHRCounter().hasPendingRequests();if(h){return false;}var b=v.isMatching(c);if(!b){return false;}if(c.getBusy&&c.getBusy()){$.sap.log.debug("The control "+c+" is busy so it is filtered out",this._sLogPrefix);return false;}if(c.getEnabled&&!c.getEnabled()){$.sap.log.debug("The control '"+c+"' is not enabled",this._sLogPrefix);return false;}var p=c.getParent();while(p){if(p.getBusy&&p.getBusy()){$.sap.log.debug("The control "+c+" has a parent that is busy "+p,this._sLogPrefix);return false;}if(p.getEnabled&&!p.getEnabled()){$.sap.log.debug("The control '"+c+"' has a parent '"+p+"' that is not enabled",this._sLogPrefix);return false;}var n=p.getMetadata().getName();if((n==="sap.m.App"||n==="sap.m.NavContainer")&&p._bNavigating){$.sap.log.debug("The control "+c+" has a parent NavContainer "+p+" that is currently navigating",this._sLogPrefix);return false;}if(n==="sap.ui.core.UIArea"&&p.bNeedsRerendering){$.sap.log.debug("The control "+c+" is currently in an ui area that needs a new rendering",this._sLogPrefix);return false;}p=p.getParent();}if(c.$().closest("#sap-ui-static").length===0){if($("#sap-ui-blocklayer-popup").is(":visible")){$.sap.log.debug("The control "+c+" is hidden behind a blocking layer of a Popup",this._sLogPrefix);return false;}}return true;}});},true);
