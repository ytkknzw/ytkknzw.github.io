(function(t){function e(e){for(var a,o,r=e[0],c=e[1],u=e[2],d=0,m=[];d<r.length;d++)o=r[d],n[o]&&m.push(n[o][0]),n[o]=0;for(a in c)Object.prototype.hasOwnProperty.call(c,a)&&(t[a]=c[a]);l&&l(e);while(m.length)m.shift()();return s.push.apply(s,u||[]),i()}function i(){for(var t,e=0;e<s.length;e++){for(var i=s[e],a=!0,r=1;r<i.length;r++){var c=i[r];0!==n[c]&&(a=!1)}a&&(s.splice(e--,1),t=o(o.s=i[0]))}return t}var a={},n={index:0},s=[];function o(e){if(a[e])return a[e].exports;var i=a[e]={i:e,l:!1,exports:{}};return t[e].call(i.exports,i,i.exports,o),i.l=!0,i.exports}o.m=t,o.c=a,o.d=function(t,e,i){o.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},o.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},o.t=function(t,e){if(1&e&&(t=o(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(o.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)o.d(i,a,function(e){return t[e]}.bind(null,a));return i},o.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return o.d(e,"a",e),e},o.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},o.p="/sake/";var r=window["webpackJsonp"]=window["webpackJsonp"]||[],c=r.push.bind(r);r.push=e,r=r.slice();for(var u=0;u<r.length;u++)e(r[u]);var l=c;s.push([0,"chunk-vendors"]),i()})({0:function(t,e,i){t.exports=i("56d7")},"3a62":function(t,e,i){},"56d7":function(t,e,i){"use strict";i.r(e);i("cadf"),i("551c"),i("097d");var a=i("2b0e"),n=i("8c4f"),s=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{attrs:{id:"app"}},[i("router-view")],1)},o=[],r=i("2877"),c={},u=Object(r["a"])(c,s,o,!1,null,null,null);u.options.__file="App.vue";var l=u.exports,d=(i("14b9"),i("2f62")),m=i("74ce");a["a"].use(d["a"]);var v=new m["a"]("db168");v.version(1).stores({memo:"id++"});var f=new d["a"].Store({state:{memo:[],sakeList:[],kuraList:[]},mutations:{},actions:{mock:function(){return new Promise(function(t,e){var i=[1,2,3].map(function(t){return{label:"aaa"+t,sub:"",rate:t%5,description:"Lorem ".repeat(t%5+3),pictures:[],time:""}});v.memo.bulkPut(i).then(function(){t()}).catch(function(t){e(t)})})},getMemo:function(t){t.commit;var e=t.state;v.memo.toArray().then(function(t){e.memo=t})},saveMemo:function(t,e){t.commit,t.state;return new Promise(function(t,i){v.memo.put(e).then(function(){t()}).catch(function(t){i(t)})})},removeMemo:function(t,e){t.commit,t.state;return new Promise(function(t,i){v.memo.where("id").equals(e.id).delete().then(function(){t()}).catch(function(t){i(t)})})}}}),p=i("9483");Object(p["a"])("".concat("/sake/","service-worker.js"),{ready:function(){console.log("App is being served from cache by a service worker.\nFor more details, visit https://goo.gl/AFskqB")},cached:function(){console.log("Content has been cached for offline use.")},updated:function(){console.log("New content is available; please refresh.")},offline:function(){console.log("No internet connection found. App is running in offline mode.")},error:function(t){console.error("Error during service worker registration:",t)}});i("3a62");a["a"].config.productionTip=!1,a["a"].use(n["a"]);var _=new n["a"]({base:"/sake/",routes:[{path:"/memo",component:i("97a8").default},{path:"/memo/:index",component:i("f856").default,props:!0,name:"edit"},{path:"/barcode",component:i("aad1").default},{path:"/search",component:i("c59a").default},{path:"/search/:id",component:i("e83f").default,props:!0,name:"detail"},{path:"/settings",component:i("f4c5").default},{path:"/",redirect:"/memo"},{path:"*",component:i("fb03").default}]});new a["a"]({router:_,store:f,render:function(t){return t(l)}}).$mount("#app")},6991:function(t,e,i){},"97a8":function(t,e,i){"use strict";i.r(e);var a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"ui-page"},[i("div",{staticClass:"ui-header"},[i("div",{staticClass:"ui-header_title"},[t._v("Sake Memo")]),i("button",{on:{click:function(e){t.$router.push("/settings")}}},[i("img",{attrs:{src:"img/gear.png",alt:""}})])]),i("div",{staticClass:"ui-tabbar"},[i("router-link",{attrs:{to:"/search"}},[t._v("Search")]),i("router-link",{attrs:{to:"/memo"}},[i("b",[t._v("Memo")])])],1),i("div",[i("button",{staticClass:"ui-button-full",on:{click:function(e){t.$router.push({name:"edit",params:{index:-1}})}}},[t._v("+ Add")]),i("button",{staticClass:"ui-button-full",on:{click:function(e){t.$router.push("/barcode")}}},[t._v("Barcode")]),t._m(0)]),i("ul",{staticClass:"ui-items"},t._l(t.memoList,function(e,a){return i("li",{key:a,staticClass:"ui-item",on:{click:function(e){t.$router.push({name:"edit",params:{index:a}})}}},[i("img",{staticClass:"ui-item_img",attrs:{src:"/sake/img/noImage.png",alt:""}}),i("div",{staticClass:"ui-item_txt"},[i("div",{staticClass:"ui-item_label"},[t._v(t._s(e.label)+" "+t._s(e.sub))]),i("div",{staticClass:"ui-item_desc"},[t._v(t._s(e.description))]),i("div",{staticClass:"ui-item_time"},[t._v(t._s("2020/12/31 Fri 23:59:59")+"   "+t._s(e.rate))])]),i("div",{staticClass:"ui-item_arrow"},[t._v("»")])])}))])},n=[function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"ui-group",staticStyle:{display:"flex",margin:"16px","align-items":"center"}},[i("div",{staticClass:"ui-button",staticStyle:{"border-radius":"4px 0 0 4px"}},[t._v("Rating")]),i("div",{staticClass:"ui-button"},[t._v("Time")]),i("div",{staticClass:"ui-button",staticStyle:{"border-radius":"0 4px 4px 0"}},[t._v("Kura")])])}],s=(i("cadf"),i("551c"),i("097d"),{data:function(){return{}},computed:{memoList:function(){return this.$store.state.memo}},created:function(){this.$store.dispatch("getMemo")},methods:{}}),o=s,r=i("2877"),c=Object(r["a"])(o,a,n,!1,null,null,null);c.options.__file="Memo.vue";e["default"]=c.exports},aad1:function(t,e,i){"use strict";i.r(e);var a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"ui-page"},[i("div",{staticClass:"ui-header"},[i("div",{staticClass:"ui-header_back",on:{click:function(e){t.$router.back()}}},[t._v("«")]),i("div",{staticClass:"ui-header_title"},[t._v("Barcode Reader")])]),i("div",{staticStyle:{"font-size":"16px"}},[t._v(t._s(t.result))]),i("video",{staticStyle:{width:"100%"},attrs:{id:"video"}})])},n=[],s=(i("cadf"),i("551c"),i("097d"),i("e588")),o={data:function(){return{result:"Result"}},mounted:function(){var t=this,e=new s["BrowserQRCodeReader"];e.decodeFromInputVideoDevice(void 0,"video").then(function(e){console.log("-- result.text",e.text),t.result=e.text}).catch(function(t){console.error(t)})}},r=o,c=i("2877"),u=Object(c["a"])(r,a,n,!1,null,null,null);u.options.__file="Barcode.vue";e["default"]=u.exports},b956:function(t,e,i){"use strict";var a=i("6991"),n=i.n(a);n.a},c59a:function(t,e,i){"use strict";i.r(e);var a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"ui-page"},[i("div",{staticClass:"ui-header"},[i("div",{staticClass:"ui-header_title"},[t._v("Sake Search")]),i("button",{on:{click:function(e){t.$router.push("/settings")}}},[i("img",{attrs:{src:"img/gear.png",alt:""}})])]),i("div",{staticClass:"ui-tabbar"},[i("router-link",{attrs:{to:"/search"}},[t._v("Search")]),i("router-link",{attrs:{to:"/memo"}},[i("b",[t._v("Memo")])])],1),i("input",{staticClass:"ui-searchbox",attrs:{type:"search"}}),i("ul",{staticClass:"ui-items"},t._l(32,function(e){return i("li",{key:e,staticClass:"ui-item",on:{click:function(i){t.$router.push("/search/d"+e)}}},[i("img",{staticClass:"ui-item_img",attrs:{src:"/sake/img/noImage.png",alt:"no image"}}),t._m(0,!0),i("div",{staticClass:"ui-item_arrow"},[t._v("»")])])}))])},n=[function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"ui-item_txt"},[i("div",{staticClass:"ui-item_label"},[t._v("{Label} {Sub}")]),i("div",{staticClass:"ui-item_desc"},[t._v("{Kura} / {Area}")])])}],s=(i("cadf"),i("551c"),i("097d"),{data:function(){return{}},created:function(){this.prepare()},methods:{prepare:function(){}}}),o=s,r=i("2877"),c=Object(r["a"])(o,a,n,!1,null,null,null);c.options.__file="Search.vue";e["default"]=c.exports},e83f:function(t,e,i){"use strict";i.r(e);var a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"ui-page"},[i("div",{staticClass:"ui-header"},[i("div",{staticClass:"ui-header_back",on:{click:function(e){t.$router.back()}}},[t._v("«")]),i("div",{staticClass:"ui-header_title"},[t._v("Detail : "+t._s(t.id))])]),t._m(0)])},n=[function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("li",{staticClass:"ui-item",staticStyle:{margin:"16px 0 0 0"}},[i("img",{staticClass:"ui-item_img",attrs:{src:"/img/noimage.png",alt:""}}),i("div",{staticClass:"ui-item_txt"},[i("div",{staticClass:"ui-item_label"},[t._v("{Label} {Sub}")]),i("div",{staticClass:"ui-item_desc"},[t._v("{Kura} / {Area}")])])])}],s=(i("cadf"),i("551c"),i("097d"),{props:{id:String},data:function(){return{}},created:function(){this.prepare()},methods:{prepare:function(){}}}),o=s,r=i("2877"),c=Object(r["a"])(o,a,n,!1,null,null,null);c.options.__file="SearchDetail.vue";e["default"]=c.exports},f4c5:function(t,e,i){"use strict";i.r(e);var a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"ui-page"},[i("div",{staticClass:"ui-header"},[i("div",{staticClass:"ui-header_back",on:{click:function(e){t.$router.back()}}},[t._v("«")]),i("div",{staticClass:"ui-header_title"},[t._v("Settings")])]),i("div",{staticStyle:{margin:"16px"}},[i("button",{on:{click:t.mock}},[t._v("MockData")])])])},n=[],s=(i("cadf"),i("551c"),i("097d"),{methods:{mock:function(){this.$store.dispatch("mock").then(function(){alert("OK")}).catch(function(t){alert("NG"),console.log("##",t)})}}}),o=s,r=i("2877"),c=Object(r["a"])(o,a,n,!1,null,null,null);c.options.__file="Settings.vue";e["default"]=c.exports},f856:function(t,e,i){"use strict";i.r(e);var a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("transition",{attrs:{appear:"",name:"slide"}},[i("div",{staticClass:"ui-page"},[i("div",{staticClass:"ui-header"},[i("div",{staticClass:"ui-header_back",on:{click:t.save}},[t._v("«")]),i("div",{staticClass:"ui-header_title"},[t._v("Memo Edit : "+t._s(t.index))]),i("div",{directives:[{name:"show",rawName:"v-show",value:t.index>-1,expression:"index > -1"}],staticClass:"ui-header_btn",on:{click:function(e){t.dialog.remove.visible=!0}}},[t._v("Remove")])]),i("div",{staticClass:"ui-body",staticStyle:{padding:"16px 0 0 0"}},[i("input",{directives:[{name:"model",rawName:"v-model",value:t.memo.label,expression:"memo.label"}],staticClass:"ui-input",attrs:{type:"text",placeholder:"label"},domProps:{value:t.memo.label},on:{input:function(e){e.target.composing||t.$set(t.memo,"label",e.target.value)}}}),i("input",{directives:[{name:"model",rawName:"v-model",value:t.memo.sub,expression:"memo.sub"}],staticClass:"ui-input",attrs:{type:"text",placeholder:"label"},domProps:{value:t.memo.sub},on:{input:function(e){e.target.composing||t.$set(t.memo,"sub",e.target.value)}}}),i("div",{staticClass:"ui-group"},[i("div",[t._v("★")]),i("div",[t._v("★")]),i("div",[t._v("★")]),i("div",[t._v("★")]),i("div",[t._v("★")])]),i("textarea",{directives:[{name:"model",rawName:"v-model",value:t.memo.description,expression:"memo.description"}],staticClass:"ui-input",staticStyle:{height:"128px"},attrs:{rows:"10"},domProps:{value:t.memo.description},on:{input:function(e){e.target.composing||t.$set(t.memo,"description",e.target.value)}}}),i("input",{staticStyle:{display:"none"},attrs:{type:"file",accept:"image/*;capture=camera"},on:{change:t.handleFileSelect}}),t._l(t.memo.pictures,function(t,e){return i("img",{key:e,staticStyle:{width:"100vw"},attrs:{src:t}})}),i("button",{staticClass:"ui-button-full",on:{click:t.openMedia}},[t._v("Add Picture")])],2),i("div",{directives:[{name:"show",rawName:"v-show",value:t.dialog.remove.visible,expression:"dialog.remove.visible"}],staticClass:"ui-dialog_overlay"},[i("div",{staticClass:"ui-dialog"},[i("h1",{staticStyle:{"text-align":"center"}},[t._v("Remove Memo")]),i("button",{staticClass:"ui-dialog_button",on:{click:t.remove}},[t._v("Remove")]),i("button",{staticClass:"ui-dialog_button",on:{click:function(e){t.dialog.remove.visible=!1}}},[t._v("Cancel")])])])])])},n=[],s=(i("c5f6"),i("cadf"),i("551c"),i("097d"),{props:{index:Number},data:function(){return{dialog:{remove:{visible:!1}},memo:{label:"",sub:"",rate:0,description:"",pictures:[],time:""}}},created:function(){this.index>=0&&(this.memo=this.$store.state.memo[this.index])},methods:{openMedia:function(){document.querySelector("input[type=file]").click()},handleFileSelect:function(t){t.stopPropagation(),t.preventDefault();var e=t.target.files[0],i=this,a=new FileReader;a.onload=function(t){i.memo.pictures.push(t.target.result),console.log("-- file",t)},a.readAsDataURL(e)},save:function(){this.$router.back()},remove:function(){var t=this;console.log("-- remove"),this.$store.dispatch("removeMemo",this.memo).then(function(){t.$router.back()}).catch(function(t){alert("NG"),console.log("## ",t)})}}}),o=s,r=(i("b956"),i("2877")),c=Object(r["a"])(o,a,n,!1,null,null,null);c.options.__file="MemoEdit.vue";e["default"]=c.exports},fb03:function(t,e,i){"use strict";i.r(e);var a=function(){var t=this,e=t.$createElement;t._self._c;return t._m(0)},n=[function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"ui-page"},[i("h1",[t._v("Not Found")])])}],s=i("2877"),o={},r=Object(s["a"])(o,a,n,!1,null,null,null);r.options.__file="NotFound.vue";e["default"]=r.exports}});