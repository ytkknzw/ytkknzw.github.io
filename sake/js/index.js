(function(e){function t(t){for(var n,r,s=t[0],c=t[1],u=t[2],l=0,d=[];l<s.length;l++)r=s[l],o[r]&&d.push(o[r][0]),o[r]=0;for(n in c)Object.prototype.hasOwnProperty.call(c,n)&&(e[n]=c[n]);m&&m(t);while(d.length)d.shift()();return a.push.apply(a,u||[]),i()}function i(){for(var e,t=0;t<a.length;t++){for(var i=a[t],n=!0,r=1;r<i.length;r++){var c=i[r];0!==o[c]&&(n=!1)}n&&(a.splice(t--,1),e=s(s.s=i[0]))}return e}var n={},o={index:0},a=[];function r(e){return s.p+"js/"+({about:"about"}[e]||e)+".js"}function s(t){if(n[t])return n[t].exports;var i=n[t]={i:t,l:!1,exports:{}};return e[t].call(i.exports,i,i.exports,s),i.l=!0,i.exports}s.e=function(e){var t=[],i=o[e];if(0!==i)if(i)t.push(i[2]);else{var n=new Promise(function(t,n){i=o[e]=[t,n]});t.push(i[2]=n);var a,c=document.getElementsByTagName("head")[0],u=document.createElement("script");u.charset="utf-8",u.timeout=120,s.nc&&u.setAttribute("nonce",s.nc),u.src=r(e),a=function(t){u.onerror=u.onload=null,clearTimeout(l);var i=o[e];if(0!==i){if(i){var n=t&&("load"===t.type?"missing":t.type),a=t&&t.target&&t.target.src,r=new Error("Loading chunk "+e+" failed.\n("+n+": "+a+")");r.type=n,r.request=a,i[1](r)}o[e]=void 0}};var l=setTimeout(function(){a({type:"timeout",target:u})},12e4);u.onerror=u.onload=a,c.appendChild(u)}return Promise.all(t)},s.m=e,s.c=n,s.d=function(e,t,i){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},s.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(s.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)s.d(i,n,function(t){return e[t]}.bind(null,n));return i},s.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="/sake/",s.oe=function(e){throw console.error(e),e};var c=window["webpackJsonp"]=window["webpackJsonp"]||[],u=c.push.bind(c);c.push=t,c=c.slice();for(var l=0;l<c.length;l++)t(c[l]);var m=u;a.push([0,"chunk-vendors"]),i()})({0:function(e,t,i){e.exports=i("56d7")},"3a62":function(e,t,i){},"56d7":function(e,t,i){"use strict";i.r(t);i("cadf"),i("551c"),i("097d");var n=i("2b0e"),o=i("8c4f"),a=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{attrs:{id:"app"}},[i("router-view")],1)},r=[],s=i("2877"),c={},u=Object(s["a"])(c,a,r,!1,null,null,null);u.options.__file="App.vue";var l=u.exports,m=(i("14b9"),i("2f62")),d=i("74ce");n["a"].use(m["a"]);var v=new d["a"]("db168");v.version(1).stores({memo:"++key"});var p=new m["a"].Store({state:{memo:[],sakeList:[],kuraList:[]},mutations:{},actions:{mock:function(){return new Promise(function(e,t){var i=[1,2,3].map(function(e){return{label:"aaa"+e,sub:"",rate:e%5,description:"Lorem ".repeat(e%5+3),pictures:[]}});v.memo.bulkPut(i),e()})},getMemo:function(e){e.commit;var t=e.state;v.memo.toArray().then(function(e){t.memo=e})},saveMemo:function(e,t){e.commit,e.state;return new Promise(function(e,i){v.memo.put(t).then(function(){e()}).catch(function(e){i(e)})})},removeMemo:function(e,t){e.commit,e.state;return new Promise(function(e,i){v.memo.where("key").equals(t.key).delete().then(function(){e()}).catch(function(e){i(e)})})}}}),f=i("9483");Object(f["a"])("".concat("/sake/","service-worker.js"),{ready:function(){console.log("App is being served from cache by a service worker.\nFor more details, visit https://goo.gl/AFskqB")},cached:function(){console.log("Content has been cached for offline use.")},updated:function(){console.log("New content is available; please refresh.")},offline:function(){console.log("No internet connection found. App is running in offline mode.")},error:function(e){console.error("Error during service worker registration:",e)}});i("3a62");n["a"].config.productionTip=!1,n["a"].use(o["a"]);var h=new o["a"]({mode:"history",base:"/sake/",routes:[{path:"/memo",component:i("97a8").default},{path:"/memo/:index",component:i("f856").default,props:!0,name:"edit"},{path:"/search",component:i("c59a").default},{path:"/settings",component:function(){return i.e("about").then(i.bind(null,"f4c5"))}},{path:"/",redirect:"/memo"},{path:"*",component:i("fb03").default}]});new n["a"]({router:h,store:p,render:function(e){return e(l)}}).$mount("#app")},"97a8":function(e,t,i){"use strict";i.r(t);var n=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"ui-page"},[i("div",{staticClass:"ui-header"},[i("div",{staticClass:"ui-header_title"},[e._v("Sake Memo")]),i("button",{on:{click:function(t){e.$router.push("/settings")}}},[i("img",{attrs:{src:"img/gear.png",alt:""}})])]),i("div",{staticClass:"ui-tabbar"},[i("router-link",{attrs:{to:"/search"}},[e._v("Search")]),i("router-link",{attrs:{to:"/memo"}},[i("b",[e._v("Memo")])])],1),i("div",[i("button",{staticClass:"ui-button-full",on:{click:function(t){e.$router.push({name:"edit",params:{index:-1}})}}},[e._v("+ Add")]),e._m(0)]),i("ul",{staticClass:"ui-items"},e._l(e.memoList,function(t,n){return i("li",{key:n,staticClass:"ui-item",on:{click:function(t){e.$router.push({name:"edit",params:{index:n}})}}},[i("img",{staticClass:"ui-item_img",attrs:{src:"",alt:""}}),i("div",{staticClass:"ui-item_txt"},[i("div",{staticClass:"ui-item_label"},[e._v(e._s(t.label)+" "+e._s(t.sub))]),i("div",{staticClass:"ui-item_desc"},[e._v(e._s(t.description))]),i("div",{staticClass:"ui-item_time"},[e._v(e._s("2020/12/31 Fri 23:59:59")+"   "+e._s(t.rate))])]),i("div",{staticClass:"ui-item_arrow"},[e._v("»")])])}))])},o=[function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"ui-group",staticStyle:{display:"flex",margin:"16px","align-items":"center"}},[i("div",{staticClass:"ui-button",staticStyle:{"border-radius":"4px 0 0 4px"}},[e._v("Rating")]),i("div",{staticClass:"ui-button"},[e._v("Time")]),i("div",{staticClass:"ui-button",staticStyle:{"border-radius":"0 4px 4px 0"}},[e._v("Kura")])])}],a=(i("cadf"),i("551c"),i("097d"),{data:function(){return{}},computed:{memoList:function(){return this.$store.state.memo}},created:function(){this.$store.dispatch("getMemo")},methods:{}}),r=a,s=i("2877"),c=Object(s["a"])(r,n,o,!1,null,null,null);c.options.__file="Memo.vue";t["default"]=c.exports},c59a:function(e,t,i){"use strict";i.r(t);var n=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"ui-page"},[i("div",{staticClass:"ui-header"},[i("div",{staticClass:"ui-header_title"},[e._v("Sake Search")]),i("button",{on:{click:function(t){e.$router.push("/settings")}}},[i("img",{attrs:{src:"img/gear.png",alt:""}})])]),i("div",{staticClass:"ui-tabbar"},[i("router-link",{attrs:{to:"/search"}},[e._v("Search")]),i("router-link",{attrs:{to:"/memo"}},[i("b",[e._v("Memo")])])],1),i("input",{staticClass:"searchbox",attrs:{type:"search"}}),i("ul",{staticClass:"ui-items"},e._l(32,function(t){return i("li",{key:t,staticClass:"ui-item"},[i("img",{staticClass:"ui-item_img",attrs:{src:"",alt:""}}),e._m(0,!0)])}))])},o=[function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",[i("div",[e._v("Label")]),i("div",[e._v("Rating")]),i("div",[e._v("Description")])])}],a=(i("cadf"),i("551c"),i("097d"),{data:function(){return{}},created:function(){this.prepare()},methods:{prepare:function(){}}}),r=a,s=i("2877"),c=Object(s["a"])(r,n,o,!1,null,null,null);c.options.__file="Search.vue";t["default"]=c.exports},f856:function(e,t,i){"use strict";i.r(t);var n=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"ui-page"},[i("div",{staticClass:"ui-header"},[i("div",{staticClass:"ui-header_back",on:{click:e.save}},[e._v("«")]),i("div",{staticClass:"ui-header_title"},[e._v("Memo Edit : "+e._s(e.index))]),i("div",{directives:[{name:"show",rawName:"v-show",value:e.index>-1,expression:"index > -1"}],staticClass:"ui-header_btn",on:{click:function(t){e.dialog.remove.visible=!0}}},[e._v("Remove")])]),i("div",[i("input",{directives:[{name:"model",rawName:"v-model",value:e.memo.label,expression:"memo.label"}],staticClass:"ui-input",attrs:{type:"text",placeholder:"label"},domProps:{value:e.memo.label},on:{input:function(t){t.target.composing||e.$set(e.memo,"label",t.target.value)}}}),i("input",{directives:[{name:"model",rawName:"v-model",value:e.memo.sub,expression:"memo.sub"}],staticClass:"ui-input",attrs:{type:"text",placeholder:"label"},domProps:{value:e.memo.sub},on:{input:function(t){t.target.composing||e.$set(e.memo,"sub",t.target.value)}}}),e._m(0),i("textarea",{directives:[{name:"model",rawName:"v-model",value:e.memo.description,expression:"memo.description"}],staticClass:"ui-input",staticStyle:{height:"128px"},attrs:{rows:"10"},domProps:{value:e.memo.description},on:{input:function(t){t.target.composing||e.$set(e.memo,"description",t.target.value)}}}),i("input",{staticStyle:{display:"none"},attrs:{type:"file",accept:"image/*;capture=camera"},on:{change:e.handleFileSelect}}),e._l(e.memo.pictures,function(e,t){return i("img",{key:t,staticStyle:{width:"100vw"},attrs:{src:e}})}),i("button",{staticClass:"ui-button-full",on:{click:e.openMedia}},[e._v("Add Picture")])],2),i("div",{directives:[{name:"show",rawName:"v-show",value:e.dialog.remove.visible,expression:"dialog.remove.visible"}],staticClass:"ui-dialog_overlay"},[i("div",{staticClass:"ui-dialog"},[i("h1",{staticStyle:{"text-align":"center"}},[e._v("Remove Memo")]),i("button",{staticClass:"ui-dialog_button",on:{click:e.remove}},[e._v("Remove")]),i("button",{staticClass:"ui-dialog_button",on:{click:function(t){e.dialog.remove.visible=!1}}},[e._v("Cancel")])])])])},o=[function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"ui-group"},[i("div",[e._v("★")]),i("div",[e._v("★")]),i("div",[e._v("★")]),i("div",[e._v("★")]),i("div",[e._v("★")])])}],a=(i("c5f6"),{props:{index:Number},data:function(){return{dialog:{remove:{visible:!1}},memo:{label:"",sub:"",rate:0,description:"",pictures:[],time:""}}},created:function(){this.index>=0&&(this.memo=this.$store.state.memo[this.index])},methods:{openMedia:function(){document.querySelector("input[type=file]").click()},handleFileSelect:function(e){e.stopPropagation(),e.preventDefault();for(var t,i=e.target.files,n=this,o=0;t=i[o];o++){var a=new FileReader;a.onload=function(e){n.memo.pictures.push(e.target.result),console.log("-- file",e)},a.readAsDataURL(t)}},save:function(){var e=this;console.log("-- save"),this.$store.dispatch("saveMemo",this.memo).then(function(){e.$router.back(),alert("OK")}).catch(function(e){console.log("## ",e),alert("NG")})},remove:function(){var e=this;console.log("-- remove"),this.$store.dispatch("removeMemo",this.memo).then(function(){alert("OK"),e.$router.back()}).catch(function(e){alert("NG"),console.log("## ",e)})}}}),r=a,s=i("2877"),c=Object(s["a"])(r,n,o,!1,null,null,null);c.options.__file="MemoEdit.vue";t["default"]=c.exports},fb03:function(e,t,i){"use strict";i.r(t);var n=function(){var e=this,t=e.$createElement;e._self._c;return e._m(0)},o=[function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"ui-page"},[i("h1",[e._v("Not Found")])])}],a=i("2877"),r={},s=Object(a["a"])(r,n,o,!1,null,null,null);s.options.__file="NotFound.vue";t["default"]=s.exports}});