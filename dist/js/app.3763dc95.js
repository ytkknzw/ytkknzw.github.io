(function(t){function e(e){for(var a,r,s=e[0],c=e[1],u=e[2],d=0,f=[];d<s.length;d++)r=s[d],Object.prototype.hasOwnProperty.call(i,r)&&i[r]&&f.push(i[r][0]),i[r]=0;for(a in c)Object.prototype.hasOwnProperty.call(c,a)&&(t[a]=c[a]);l&&l(e);while(f.length)f.shift()();return o.push.apply(o,u||[]),n()}function n(){for(var t,e=0;e<o.length;e++){for(var n=o[e],a=!0,s=1;s<n.length;s++){var c=n[s];0!==i[c]&&(a=!1)}a&&(o.splice(e--,1),t=r(r.s=n[0]))}return t}var a={},i={app:0},o=[];function r(e){if(a[e])return a[e].exports;var n=a[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=t,r.c=a,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)r.d(n,a,function(e){return t[e]}.bind(null,a));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="/";var s=window["webpackJsonp"]=window["webpackJsonp"]||[],c=s.push.bind(s);s.push=e,s=s.slice();for(var u=0;u<s.length;u++)e(s[u]);var l=c;o.push([0,"chunk-vendors"]),n()})({0:function(t,e,n){t.exports=n("56d7")},"0a8f":function(t,e,n){},"2e8d":function(t,e,n){"use strict";n("0a8f")},3614:function(t,e,n){},"3a62":function(t,e,n){},"4f49":function(t,e,n){"use strict";n("6a82")},5664:function(t,e,n){"use strict";n("e70b")},"56d7":function(t,e,n){"use strict";n.r(e);n("e260"),n("e6cf"),n("cca6"),n("a79d");var a=n("2b0e"),i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{attrs:{id:"app"}},[n("router-view"),t._v(" "+t._s(t.$store.state.error.message)+" ")],1)},o=[],r=n("2877"),s={},c=Object(r["a"])(s,i,o,!1,null,null,null),u=c.exports,l=(n("4160"),n("b0c0"),n("159b"),function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"ui-overlay"},[n("div",{staticClass:"ui-dialog"},[n("div",{staticClass:"ui-dialog-header"},[n("div",{staticClass:"ui-dialog-title"},[t._v(t._s(t.title))])]),n("div",{staticClass:"ui-dialog-body"},[t._t("default")],2),n("div",{staticClass:"ui-dialog-footer"},[n("button",{staticClass:"ui-button ui-button-full",on:{click:function(e){return t.$emit("close")}}},[n("span",[t._v("Close")])])])])])}),d=[],f={name:"UiAlert",props:{title:String}},p=f,h=Object(r["a"])(p,l,d,!1,null,null,null),v=h.exports,b=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("button",{class:t.classes,on:{click:function(e){return t.$emit("click")}}},[t.icon?n("i",{class:t.icon}):t._e(),t.text?n("span",[t._v(t._s(t.text))]):t._e(),t.iconRight?n("i",{class:t.iconRight}):t._e()])},m=[],g={name:"UiButton",props:{text:String,icon:String,iconRight:String,isFull:Boolean},computed:{classes:function(){return{"ui-button":!0,"ui-button-full":this.isFull}}},methods:{}},x=g,y=(n("8274"),Object(r["a"])(x,b,m,!1,null,null,null)),_=y.exports,w=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"ui-overlay"},[n("div",{staticClass:"ui-dialog"},[n("div",{staticClass:"ui-confirm-header"},[n("div",{staticClass:"ui-dialog-title"},[t._v(t._s(t.title))])]),n("div",{staticClass:"ui-confirm-body"},[t._v(" "+t._s(t.message)+" ")]),n("div",{staticClass:"ui-confirm-footer"},[n("button",{staticClass:"ui-button",on:{click:function(e){return t.$emit("cancel")}}},[n("span",[t._v("Cancel")])]),n("button",{staticClass:"ui-button",on:{click:function(e){return t.$emit("ok")}}},[n("span",[t._v("OK")])])])])])},j=[],k={name:"UiConfirm",props:{title:String,message:String}},C=k,O=(n("5664"),Object(r["a"])(C,w,j,!1,null,null,null)),$=O.exports,E=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"ui-overlay"},[n("div",{staticClass:"ui-dialog"},[n("div",{staticClass:"ui-dialog-header"},[n("div",{staticClass:"ui-dialog-title"},[t._v(t._s(t.title))]),n("div",{staticClass:"ui-dialog-button",on:{click:function(e){return t.$emit("close")}}},[n("span",[t._v("Close")]),n("i",{staticClass:"fas fa-times"})])]),n("div",{staticClass:"ui-dialog-body"},[t._t("default")],2),n("div",{staticClass:"ui-dialog-footer"})])])},S=[],D={name:"UiDialog",props:{title:String}},T=D,R=(n("4f49"),Object(r["a"])(T,E,S,!1,null,null,null)),N=R.exports,A=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"ui-fab",on:{click:function(e){return t.$emit("click")}}},[n("i",{class:t.icon})])},F=[],P={name:"UiFab",props:{icon:String},computed:{},methods:{}},U=P,M=(n("eb56"),Object(r["a"])(U,A,F,!1,null,null,null)),B=M.exports,J=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"ui-message"},[t._v(" "+t._s(t.text)+" ")])},q=[],Y={name:"UiMessage",props:{text:String}},H=Y,L=(n("f87e"),Object(r["a"])(H,J,q,!1,null,null,null)),X=L.exports,z=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("input",{class:t.classes,attrs:{type:t.type,placeholder:t.placeholder},domProps:{value:t.value},on:{input:function(e){return t.$emit("input",e.target.value)}}})},I=[],K=(n("c975"),{name:"UiInput",props:{type:{type:String,default:"text",validator:function(t){return-1!==["text","password","email","url","number","time","date","datetime","datetime-local","color"].indexOf(t)}},value:String,placeholder:String,isFull:Boolean},computed:{classes:function(){return{"ui-input":!0,"ui-input-full":this.isFull}}},methods:{}}),V=K,G=(n("e706"),Object(r["a"])(V,z,I,!1,null,null,null)),Q=G.exports,W=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div")},Z=[],tt={name:"UiRate",props:{text:String},computed:{},methods:{}},et=tt,nt=Object(r["a"])(et,W,Z,!1,null,null,null),at=nt.exports,it=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("select",{staticClass:"ui-select",on:{change:function(e){return t.$emit("select",e.target.value)}}},t._l(t.options,(function(e,a){return n("option",{key:a,domProps:{value:e.value,selected:e.value===t.value}},[t._v(" "+t._s(e.text)+" ")])})),0)},ot=[],rt={name:"UiSelect",props:{value:{type:String},options:{type:Array,required:!0,default:function(){return[]}}},computed:{},methods:{},created:function(){window.console.log({value:this.value})}},st=rt,ct=(n("e851"),Object(r["a"])(st,it,ot,!1,null,null,null)),ut=ct.exports,lt=[v,_,$,N,B,X,Q,at,ut],dt=function(t){lt.forEach((function(e){t.component(e.name,e)}))},ft={install:dt},pt=n("8c4f"),ht=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("h2",[t._v("not found")]),n("p",[t._v(t._s(t.$route.path))])])},vt=[],bt={},mt=Object(r["a"])(bt,ht,vt,!1,null,null,null),gt=mt.exports,xt=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"ui-page"},[n("h2",{staticStyle:{"text-align":"center"}},[t._v("タイム・トラッカー")]),n("div",{staticClass:"ui-spacer-v"}),n("div",{staticClass:"ui-flex"},[n("ui-button",{attrs:{"is-full":"",text:"日記",icon:"far fa-calendar-alt"},on:{click:function(e){return t.$router.push("/date/"+t.date)}}}),n("div",{staticClass:"ui-spacer-h"}),n("ui-button",{attrs:{"is-full":"",text:"統計",icon:"fas fa-chart-line"},on:{click:function(e){return t.$router.push("/stats")}}})],1),n("hr"),n("div",{staticClass:"ui-flex"},[n("ui-button",{attrs:{"is-full":"",text:"データ・インポート"},on:{click:t.importData}}),n("div",{staticClass:"ui-spacer-h"}),n("ui-button",{attrs:{"is-full":"",text:"データ・エクスポート"},on:{click:t.exportData}})],1),n("div",{staticClass:"ui-spacer-v"}),n("ui-button",{attrs:{text:"テーマ設定",icon:"fas fa-wrench"},on:{click:function(e){return t.$router.push("/themes")}}})],1)},yt=[],_t=(n("ac1f"),n("1276"),n("bf19"),n("5530")),wt=n("2f62"),jt={data:function(){return{date:(new Date).toJSON().split("T").shift()}},computed:Object(wt["c"])(["types"]),methods:Object(_t["a"])({},Object(wt["b"])(["importData","exportData"]))},kt=jt,Ct=Object(r["a"])(kt,xt,yt,!1,null,null,null),Ot=Ct.exports,$t=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"ui-page"},[n("div",{staticClass:"ui-header"},[n("ui-button",{attrs:{text:"Back",icon:"fas fa-arrow-left"},on:{click:function(e){return t.$router.back()}}}),n("h2",[t._v("stats")])],1),n("hr"),n("ui-button",{attrs:{text:"1week"}}),n("ui-button",{attrs:{text:"1month"}}),n("ui-button",{attrs:{text:"6months"}}),n("div",{staticClass:"ui-spacer-v"}),n("svg")],1)},Et=[],St=n("5698"),Dt={data:function(){return{}},methods:{draw:function(){var t=280,e=200,n=St["a"]("svg").attr("width",t).attr("height",e);window.console.log(n)}},created:function(){this.draw()}},Tt=Dt,Rt=(n("2e8d"),Object(r["a"])(Tt,$t,Et,!1,null,null,null)),Nt=Rt.exports,At=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"ui-page ui-page-full",on:{touchstart:t.handleTouchStart,touchend:t.handleTouchEnd}},[n("div",{staticClass:"ui-header"},[n("ui-button",{attrs:{text:"Home",icon:"fas fa-arrow-left"},on:{click:function(e){return t.$router.push("/")}}}),n("h2",[t._v(t._s(t.dateString))]),n("ui-button",{attrs:{icon:"fas fa-chevron-left"},on:{click:function(e){return t.changeDate(-1)}}}),n("ui-button",{attrs:{"icon-right":"fas fa-chevron-right"},on:{click:function(e){return t.changeDate(1)}}})],1),t._l(t.timeline,(function(e,a){return n("div",{key:a,staticClass:"ui-row",on:{click:function(n){return t.to(e.id)}}},[n("span",[t._v(t._s(e.t0))]),n("i",{class:e.icon}),n("div",[t._v(t._s(e.text))]),"span"===e.type?n("span",[t._v(t._s(t.duration(e)))]):t._e(),"span"===e.type?n("span",[t._v(t._s(e.t1))]):t._e()])})),n("ui-fab",{attrs:{icon:"fas fa-plus"},on:{click:function(e){return t.to(-1)}}})],2)},Ft=[],Pt=(n("99af"),n("7db0"),n("d81d"),n("a9e3"),n("9129"),n("c35a"),n("b680"),n("2909")),Ut={props:{date:{typs:String,required:!0}},data:function(){return{touch:{x:0,y:0}}},watch:{$route:function(t){this.show(t.params.date)}},computed:Object(_t["a"])(Object(_t["a"])({},Object(wt["c"])(["dates","items"])),{},{dateString:function(){var t=new Date(this.date).getDay(),e="日月火水木金土".split("")[t];return"".concat(this.date," ").concat(e)},timeline:function(){var t=this;return this.dates.map((function(e){return Object(_t["a"])(Object(_t["a"])({},e),t.items.find((function(t){return t.code===e.code})))}))}}),methods:{handleTouchStart:function(t){this.touch.x=t.changedTouches[0].clientX,this.touch.y=t.changedTouches[0].clientY},handleTouchEnd:function(t){var e=this.touch.x-t.changedTouches[0].clientX,n=this.touch.y-t.changedTouches[0].clientY,a=Math.abs(n/e);!Number.isNaN(a)&&Math.abs(n/e)<.3&&this.changeDate(e>0?1:-1)},changeDate:function(t){var e=new Date(this.date);e=new Date(e.getFullYear(),e.getMonth(),e.getDate()+t+1);var n=e.toJSON().split("T").shift();this.$router.push("/date/".concat(n)),window.scrollTo(0,0),this.show(n)},show:function(t){var e=this;this.$store.dispatch("act",{action:"READ",data:{date:t}}).then((function(){window.console.log("show",e.date,Object(Pt["a"])(e.dates))}))},duration:function(t){if("span"!==t.type)return"";var e=new Date("".concat(t.date," ").concat(t.t1))-new Date("".concat(t.date," ").concat(t.t0)),n=Number.parseFloat(e/36e5).toFixed(1);return e>36e5?"".concat(n,"h"):"".concat(e/6e4,"m")},to:function(t){this.$router.push("/date/".concat(this.date,"/").concat(t))}},created:function(){this.show(this.$route.params.date)}},Mt=Ut,Bt=Object(r["a"])(Mt,At,Ft,!1,null,null,null),Jt=Bt.exports,qt=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"ui-page"},[n("div",{staticClass:"ui-header"},[n("ui-button",{attrs:{text:"戻る",icon:"fas fa-arrow-left"},on:{click:function(e){return t.$router.back()}}}),n("h2",[t._v("タイムライン編集")]),t.isNew?t._e():n("ui-button",{attrs:{text:"削除","icon-right":"far fa-trash-alt"},on:{click:function(e){t.confirm.visible=!0}}})],1),n("div",{staticClass:"ui-item"},[n("div",{staticClass:"ui-label"},[t._v("行動")]),n("div",{staticClass:"ui-data"},[n("ui-select",{attrs:{options:t.options},on:{select:t.select},model:{value:t.obj.code,callback:function(e){t.$set(t.obj,"code",e)},expression:"obj.code"}})],1)]),n("div",{staticClass:"ui-item"},[n("div",{staticClass:"ui-label"},[t._v("時間")]),n("div",{staticClass:"ui-data"},[n("div",{staticClass:"ui-flex"},[n("ui-input",{attrs:{type:"time"},model:{value:t.obj.t0,callback:function(e){t.$set(t.obj,"t0",e)},expression:"obj.t0"}}),t.isSpan?n("div",[t._v("〜")]):t._e(),t.isSpan?n("ui-input",{attrs:{type:"time"},model:{value:t.obj.t1,callback:function(e){t.$set(t.obj,"t1",e)},expression:"obj.t1"}}):t._e()],1)])]),t.isForeBack?n("div",{staticClass:"ui-item"},[n("div",{staticClass:"ui-label"},[t._v("開始時間")]),n("div",{staticClass:"ui-data"},[n("div",{staticClass:"ui-flex"},[n("ui-button",{attrs:{text:"前日"}}),n("ui-button",{attrs:{text:"本日"}})],1)])]):t._e(),n("div",[t._v("特記事項")]),n("textarea",{directives:[{name:"model",rawName:"v-model",value:t.obj.desc,expression:"obj.desc"}],domProps:{value:t.obj.desc},on:{input:function(e){e.target.composing||t.$set(t.obj,"desc",e.target.value)}}}),n("div",{staticClass:"ui-spacer-v"}),n("ui-button",{attrs:{"is-full":"",text:"保存",icon:"fas fa-save"},on:{click:function(e){return t.command(t.isNew?"CREATE":"UPDATE")}}}),n("ui-confirm",{directives:[{name:"show",rawName:"v-show",value:t.confirm.visible,expression:"confirm.visible"}],attrs:{title:"Delete",text:"Are you sure to delete this data?"},on:{cancel:function(e){t.confirm.visible=!1},ok:function(e){return t.command("DELETE")}}})],1)},Yt=[],Ht=(n("fb6a"),n("d4ec"));function Lt(){var t=new Date,e="0".concat(t.getHours()).slice(-2),n="0".concat(t.getMinutes()).slice(-2);return"".concat(e,":").concat(n)}var Xt=function t(e){Object(Ht["a"])(this,t);var n=e||{};this.id=n.id||-1,this.date=n.date||"",this.code=n.code||"sleep",this.t0=n.t0||Lt(),this.t1=n.t1||Lt(),this.desc=n.desc||""},zt={data:function(){return{isNew:!1,isSpan:!0,obj:{},confirm:{visible:!1}}},computed:Object(_t["a"])(Object(_t["a"])({},Object(wt["c"])(["dates","items"])),{},{options:function(){return this.items.map((function(t){return{text:t.text,value:t.code}}))},isForeBack:function(){return this.isSpan&&this.obj.t0>this.obj.t1}}),methods:{select:function(t){this.obj.code=t,this.isSpan="span"===this.items.find((function(e){return e.code===t})).type,window.console.log(t,Object(_t["a"])({},this.obj))},command:function(t){var e=this;"CREATE"===t&&delete this.obj.id,this.$store.dispatch("act",{action:t,data:this.obj}).then((function(){e.$router.back()}))}},created:function(){var t=Number(this.$route.params.id);this.isNew=t<0,this.obj=t<0?new Xt:new Xt(this.dates.find((function(e){return e.id===t}))),this.obj.date=this.$route.params.date}},It=zt,Kt=Object(r["a"])(It,qt,Yt,!1,null,null,null),Vt=Kt.exports;a["a"].use(pt["a"]);var Gt=[{path:"/stats",component:Nt},{path:"/date/:date",component:Jt,props:!0},{path:"/date/:date/:id?",component:Vt},{path:"/",component:Ot},{path:"/*",component:gt}],Qt=new pt["a"]({mode:"history",base:"/",routes:Gt}),Wt=Qt,Zt=(n("96cf"),n("1da1")),te=n("bee2"),ee=n("262e"),ne=n("2caf"),ae=n("4dec"),ie=[{type:"span",category:"",code:"sleep",icon:"fas fa-bed",text:"睡眠",color:""},{type:"span",category:"",code:"exercise",icon:"fas fa-running",text:"運動",color:""},{type:"span",category:"",code:"work",icon:"fas fa-briefcase",text:"仕事",color:""},{type:"span",category:"",code:"learn",icon:"fas fa-graduation-cap",text:"勉強",color:""},{type:"span",category:"exercise transit",code:"walk",icon:"fas fa-shoe-prints",text:"移動（徒歩・自転車）",color:""},{type:"span",category:"transit",code:"behicle",icon:"fas fa-subway",text:"移動（乗り物）",color:""},{type:"span",category:"",code:"game",icon:"fas fa-gamepad",text:"ゲーム",color:""},{type:"span",category:"",code:"watch",icon:"fab fa-youtube-square",text:"TV/動画",color:""},{type:"span",category:"",code:"office",icon:"far fa-building",text:"役所・病院等",color:""},{type:"span",category:"",code:"etc",icon:"fas fa-asterisk",text:"その他",color:""},{type:"time",category:"",code:"meal",icon:"fas fa-utensils",text:"食事",color:""},{type:"time",category:"",code:"cafeine",icon:"fas fa-coffee",text:" コーヒー・お茶",color:""},{type:"time",category:"",code:"alcohole",icon:"fas fa-wine-glass-alt",text:"お酒",color:""},{type:"time",category:"",code:"medicine",icon:"fas fa-prescription-bottle-alt",text:"服薬",color:""},{type:"time",category:"",code:"suppliment",icon:"fas fa-pills",text:"サプリメント",color:""},{type:"time",category:"",code:"smoking",icon:"fas fa-smoking",text:"喫煙",color:""},{type:"time",category:"",code:"bathroom",icon:"fas fa-restroom",text:"トイレ",color:""},{type:"time",category:"",code:"shower",icon:"fas fa-bath",text:"シャワー・歯磨き等",color:""}];a["a"].use(wt["a"]),ae["a"].delete("tt");var oe=function(t){Object(ee["a"])(n,t);var e=Object(ne["a"])(n);function n(){var t;return Object(Ht["a"])(this,n),t=e.call(this,"tt3"),t.version(1).stores({dates:"++id,date"}),t.t_dates=t.table("dates"),t}return Object(te["a"])(n,[{key:"read",value:function(){var t=Object(Zt["a"])(regeneratorRuntime.mark((function t(e){var n;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return window.console.log("db.read",e.date),t.next=3,this.t_dates.where("date").equals(e.date).sortBy("t0");case 3:return n=t.sent,t.abrupt("return",n);case 5:case"end":return t.stop()}}),t,this)})));function e(e){return t.apply(this,arguments)}return e}()},{key:"create",value:function(t){this.t_dates.add(t)}},{key:"update",value:function(t){this.t_dates.update(t.id,t)}},{key:"delete",value:function(t){this.t_dates.delete(t.id)}},{key:"serialize",value:function(){var t=Object(Zt["a"])(regeneratorRuntime.mark((function t(){var e;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,this.t_dates.toArray();case 2:return e=t.sent,t.abrupt("return",JSON.stringify(e));case 4:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}()}]),n}(ae["a"]),re=new oe,se=new wt["a"].Store({strict:!0,state:{items:ie,dates:[],error:{}},getters:{},mutations:{closeError:function(t){t.error.visible=!1},setError:function(t,e){t.error=Object(_t["a"])(Object(_t["a"])({},e),{},{visible:!0})},setDates:function(t,e){t.dates=e}},actions:{importData:function(){return Object(Zt["a"])(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:case"end":return t.stop()}}),t)})))()},exportData:function(){return Object(Zt["a"])(regeneratorRuntime.mark((function t(){var e;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.t0=JSON,t.next=3,re.t_dates.toArray();case 3:t.t1=t.sent,e=t.t0.stringify.call(t.t0,t.t1),window.console.log(e.length,e);case 6:case"end":return t.stop()}}),t)})))()},act:function(t,e){return Object(Zt["a"])(regeneratorRuntime.mark((function n(){var a,i,o,r;return regeneratorRuntime.wrap((function(n){while(1)switch(n.prev=n.next){case 0:a=t.commit,i=e.action,o=e.data,r=[],n.prev=3,n.t0=i,n.next="READ"===n.t0?7:"CREATE"===n.t0?12:"UPDATE"===n.t0?15:"DELETE"===n.t0?18:21;break;case 7:return n.next=9,re.read(o);case 9:return r=n.sent,a("setDates",r),n.abrupt("break",22);case 12:return n.next=14,re.create(o);case 14:return n.abrupt("break",22);case 15:return n.next=17,re.update(o);case 17:return n.abrupt("break",22);case 18:return n.next=20,re.delete(o);case 20:return n.abrupt("break",22);case 21:throw new Error('the action "'.concat(i,'" is invalid.'));case 22:n.next=28;break;case 24:n.prev=24,n.t1=n["catch"](3),window.console.log("error",n.t1),a("setError",n.t1);case 28:case"end":return n.stop()}}),n,null,[[3,24]])})))()}}}),ce=(n("becf"),n("3a62"),n("9483"));Object(ce["a"])("".concat("/","service-worker.js"),{ready:function(){console.log("App is being served from cache by a service worker.\nFor more details, visit https://goo.gl/AFskqB")},registered:function(){console.log("Service worker has been registered.")},cached:function(){console.log("Content has been cached for offline use.")},updatefound:function(){console.log("New content is downloading.")},updated:function(){console.log("New content is available; please refresh.")},offline:function(){console.log("No internet connection found. App is running in offline mode.")},error:function(t){console.error("Error during service worker registration:",t)}}),a["a"].config.productionTip=!1,a["a"].use(ft),new a["a"]({router:Wt,store:se,render:function(t){return t(u)}}).$mount("#app")},"6a82":function(t,e,n){},"7e55":function(t,e,n){},8274:function(t,e,n){"use strict";n("d277")},adb6:function(t,e,n){},afbc:function(t,e,n){},d277:function(t,e,n){},e706:function(t,e,n){"use strict";n("7e55")},e70b:function(t,e,n){},e851:function(t,e,n){"use strict";n("3614")},eb56:function(t,e,n){"use strict";n("adb6")},f87e:function(t,e,n){"use strict";n("afbc")}});
//# sourceMappingURL=app.3763dc95.js.map