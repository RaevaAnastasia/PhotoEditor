var DragDropTouch;!function(t){"use strict";var e=(Object.defineProperty(i.prototype,"dropEffect",{get:function(){return this._dropEffect},set:function(t){this._dropEffect=t},enumerable:!0,configurable:!0}),Object.defineProperty(i.prototype,"effectAllowed",{get:function(){return this._effectAllowed},set:function(t){this._effectAllowed=t},enumerable:!0,configurable:!0}),Object.defineProperty(i.prototype,"types",{get:function(){return Object.keys(this._data)},enumerable:!0,configurable:!0}),i.prototype.clearData=function(t){null!=t?delete this._data[t]:this._data=null},i.prototype.getData=function(t){return this._data[t]||""},i.prototype.setData=function(t,e){this._data[t]=e},i.prototype.setDragImage=function(t,e,i){var s=o._instance;s._imgCustom=t,s._imgOffset={x:e,y:i}},i);function i(){this._dropEffect="move",this._effectAllowed="all",this._data={}}t.DataTransfer=e;var o=(a.getInstance=function(){return a._instance},a.prototype._touchstart=function(t){var e=this;if(this._shouldHandle(t)){if(Date.now()-this._lastClick<a._DBLCLICK&&this._dispatchEvent(t,"dblclick",t.target))return t.preventDefault(),void this._reset();this._reset();var i=this._closestDraggable(t.target);i&&(this._dispatchEvent(t,"mousemove",t.target)||this._dispatchEvent(t,"mousedown",t.target)||(this._dragSource=i,this._ptDown=this._getPoint(t),(this._lastTouch=t).preventDefault(),setTimeout(function(){e._dragSource==i&&null==e._img&&e._dispatchEvent(t,"contextmenu",i)&&e._reset()},a._CTXMENU),a._ISPRESSHOLDMODE&&(this._pressHoldInterval=setTimeout(function(){e._isDragEnabled=!0,e._touchmove(t)},a._PRESSHOLDAWAIT))))}},a.prototype._touchmove=function(t){var e;this._shouldCancelPressHoldMove(t)?this._reset():(this._shouldHandleMove(t)||this._shouldHandlePressHoldMove(t))&&(e=this._getTarget(t),this._dispatchEvent(t,"mousemove",e)?(this._lastTouch=t).preventDefault():(this._dragSource&&!this._img&&this._shouldStartDragging(t)&&(this._dispatchEvent(t,"dragstart",this._dragSource),this._createImage(t),this._dispatchEvent(t,"dragenter",e)),this._img&&((this._lastTouch=t).preventDefault(),e!=this._lastTarget&&(this._dispatchEvent(this._lastTouch,"dragleave",this._lastTarget),this._dispatchEvent(t,"dragenter",e),this._lastTarget=e),this._moveImage(t),this._isDropZone=this._dispatchEvent(t,"dragover",e))))},a.prototype._touchend=function(t){this._shouldHandle(t)&&(this._dispatchEvent(this._lastTouch,"mouseup",t.target)?t.preventDefault():(this._img||(this._dragSource=null,this._dispatchEvent(this._lastTouch,"click",t.target),this._lastClick=Date.now()),this._destroyImage(),this._dragSource&&(t.type.indexOf("cancel")<0&&this._isDropZone&&this._dispatchEvent(this._lastTouch,"drop",this._lastTarget),this._dispatchEvent(this._lastTouch,"dragend",this._dragSource),this._reset())))},a.prototype._shouldHandle=function(t){return t&&!t.defaultPrevented&&t.touches&&t.touches.length<2},a.prototype._shouldHandleMove=function(t){return!a._ISPRESSHOLDMODE&&this._shouldHandle(t)},a.prototype._shouldHandlePressHoldMove=function(t){return a._ISPRESSHOLDMODE&&this._isDragEnabled&&t&&t.touches&&t.touches.length},a.prototype._shouldCancelPressHoldMove=function(t){return a._ISPRESSHOLDMODE&&!this._isDragEnabled&&this._getDelta(t)>a._PRESSHOLDMARGIN},a.prototype._shouldStartDragging=function(t){t=this._getDelta(t);return a._THRESHOLD<t||a._ISPRESSHOLDMODE&&a._PRESSHOLDTHRESHOLD<=t},a.prototype._reset=function(){this._destroyImage(),this._dragSource=null,this._lastTouch=null,this._lastTarget=null,this._ptDown=null,this._isDragEnabled=!1,this._isDropZone=!1,this._dataTransfer=new e,clearInterval(this._pressHoldInterval)},a.prototype._getPoint=function(t,e){return t&&t.touches&&(t=t.touches[0]),{x:e?t.pageX:t.clientX,y:e?t.pageY:t.clientY}},a.prototype._getDelta=function(t){if(a._ISPRESSHOLDMODE&&!this._ptDown)return 0;t=this._getPoint(t);return Math.abs(t.x-this._ptDown.x)+Math.abs(t.y-this._ptDown.y)},a.prototype._getTarget=function(t){for(var t=this._getPoint(t),e=document.elementFromPoint(t.x,t.y);e&&"none"==getComputedStyle(e).pointerEvents;)e=e.parentElement;return e},a.prototype._createImage=function(t){this._img&&this._destroyImage();var e,i=this._imgCustom||this._dragSource;this._img=i.cloneNode(!0),this._copyStyle(i,this._img),this._img.style.top=this._img.style.left="-9999px",this._imgCustom||(e=i.getBoundingClientRect(),i=this._getPoint(t),this._imgOffset={x:i.x-e.left,y:i.y-e.top},this._img.style.opacity=a._OPACITY.toString()),this._moveImage(t),document.body.appendChild(this._img)},a.prototype._destroyImage=function(){this._img&&this._img.parentElement&&this._img.parentElement.removeChild(this._img),this._img=null,this._imgCustom=null},a.prototype._moveImage=function(i){var s=this;requestAnimationFrame(function(){var t,e;s._img&&(t=s._getPoint(i,!0),(e=s._img.style).position="absolute",e.pointerEvents="none",e.zIndex="999999",e.left=Math.round(t.x-s._imgOffset.x)+"px",e.top=Math.round(t.y-s._imgOffset.y)+"px")})},a.prototype._copyProps=function(t,e,i){for(var s=0;s<i.length;s++){var o=i[s];t[o]=e[o]}},a.prototype._copyStyle=function(t,e){var i,s;a._rmvAtts.forEach(function(t){e.removeAttribute(t)}),t instanceof HTMLCanvasElement&&((s=e).width=(i=t).width,s.height=i.height,s.getContext("2d").drawImage(i,0,0));for(var o=getComputedStyle(t),n=0;n<o.length;n++){var r=o[n];r.indexOf("transition")<0&&(e.style[r]=o[r])}e.style.pointerEvents="none";for(n=0;n<t.children.length;n++)this._copyStyle(t.children[n],e.children[n])},a.prototype._dispatchEvent=function(t,e,i){if(t&&i){var s=document.createEvent("Event"),o=t.touches?t.touches[0]:t;return s.initEvent(e,!0,!0),s.button=0,s.which=s.buttons=1,this._copyProps(s,t,a._kbdProps),this._copyProps(s,o,a._ptProps),s.dataTransfer=this._dataTransfer,i.dispatchEvent(s),s.defaultPrevented}return!1},a.prototype._closestDraggable=function(t){for(;t;t=t.parentElement)if(t.hasAttribute("draggable")&&t.draggable)return t;return null},a);function a(){if(this._lastClick=0,a._instance)throw"DragDropTouch instance already created.";var t,e,i,s,o=!1;document.addEventListener("test",function(){},{get passive(){return o=!0}}),navigator.maxTouchPoints&&(t=document,s=this._touchstart.bind(this),e=this._touchmove.bind(this),i=this._touchend.bind(this),t.addEventListener("touchstart",s,s=!!o&&{passive:!1,capture:!1}),t.addEventListener("touchmove",e,s),t.addEventListener("touchend",i),t.addEventListener("touchcancel",i))}o._instance=new o,o._THRESHOLD=5,o._OPACITY=.5,o._DBLCLICK=500,o._CTXMENU=900,o._ISPRESSHOLDMODE=!1,o._PRESSHOLDAWAIT=400,o._PRESSHOLDMARGIN=25,o._PRESSHOLDTHRESHOLD=0,o._rmvAtts="id,class,style,draggable".split(","),o._kbdProps="altKey,ctrlKey,metaKey,shiftKey".split(","),o._ptProps="pageX,pageY,clientX,clientY,screenX,screenY,offsetX,offsetY".split(","),t.DragDropTouch=o}(DragDropTouch=DragDropTouch||{});
"use strict";window.onload=function(){const t=["sepia(100%)","grayscale(100%)"],o=["Сепия","B&W"];let i=new Map;i.set("isRotateSide",!1),i.set("isMirror",!1);let n=[];const a=document.querySelector(".presets__list");let r="",s=e=>{var t=e.target.dataset.name.split("_").join(" ");localStorage.removeItem(t);let o=e.target.closest("li");o.parentNode.removeChild(o)},l=t=>{if(t.target.dataset.name){var o,t=t.target.dataset.name.split("_").join(" "),a=JSON.parse(localStorage.getItem(t));let e="";for(o in a)e+=` ${o}(${a[o]})`;g.filter=e,i.set("filters",e),v(),X(e)}},c=()=>{r="";const e=/preset./u;for(var t in localStorage){var o;localStorage.hasOwnProperty(t)&&e.test(t)&&(o=t.split(" ").join("_"),t=t.slice(6),o=`<li class="presets__item">
                    <span class="presets__name" data-name=${o}> ${t} </span>
                    <img class="presets__image presets__image--custom" src="img/preset.jpg" alt="Rainbow Image" data-name=${o}>
                    <button class ="preset__delete button" type="button" data-name=${o}>Удалить пресет</button>
                </li>`,r+=o)}a.innerHTML=r,(()=>{const e=document.querySelectorAll(".preset__delete");e.forEach(e=>e.addEventListener("click",s))})(),(()=>{const e=document.querySelectorAll(".presets__item");e.forEach(e=>e.addEventListener("click",l))})(),(()=>{const e=document.querySelectorAll(".presets__image--custom");e.forEach(e=>{var t,o=e.dataset.name.split("_").join(" "),a=JSON.parse(localStorage.getItem(o));let i="";for(t in a)i+=` ${t}(${a[t]})`;e.style.filter=i})})()};c();const d=document.querySelector(".photo__dropbox"),u=document.querySelector(".photo__img"),h=document.querySelector(".photo__wrap"),m=document.querySelector("#canvas"),g=m.getContext("2d");let p=()=>{let e=document.documentElement.clientHeight;var t=u.height/u.width||(()=>{u.style.display="block";let e;return e=u.offsetWidth<u.offsetHeight?u.offsetWidth/u.offsetHeight:u.offsetHeight/u.offsetWidth,u.style.display="none",e})();let o=e/t;o>d.offsetWidth&&(o=d.offsetWidth,e=o*t),m.width=o,m.height=e},v=()=>{i.has("filters")&&(g.filter=i.get("filters")),i.get("isMirror")&&(g.translate(m.width,0),g.scale(-1,1)),i.get("isRotateSide")?(i.get("isMirror")&&g.translate(m.height/2,0),g.drawImage(u,0,0,m.height,m.height*u.height/u.width)):g.drawImage(u,0,0,m.width,m.width*u.height/u.width),0<n.length&&n.forEach(e=>{switch(e[0]){case"text":g.font=`bold ${e[5]}px Roboto`,g.fillStyle=`${e[4]}`,g.textAlign="left",g.filter="none",oe(e[1],e[2],e[3]);break;case"sticker":g.filter="none",g.drawImage(e[1],e[2],e[3],e[4],e[5]);break;case"img":g.filter="none",g.translate(0,0),i.get("isRotateSide")?g.drawImage(e[1],0,0,m.height,m.height*e[1].height/e[1].width):g.drawImage(e[1],0,0,m.width,m.width*e[1].height/e[1].width)}})},e=()=>{p(),v()};p(),v(),window.onresize=e;const _=document.querySelector("#newPhoto");let f=e=>{var t=window.URL.createObjectURL(e);u.src=t,g.clearRect(0,0,m.width,m.height),u.onload=function(){p(),v(),v()},e.onload=function(){window.URL.revokeObjectURL(this.src)}};let y=e=>{e.stopPropagation(),e.preventDefault()};_.addEventListener("change",function(){var e=this.files[0];f(e),R()}),d.addEventListener("dragenter",y),d.addEventListener("dragover",y),d.addEventListener("drop",e=>{y(e);e=e.dataTransfer.files[0];f(e),R()});const w=document.querySelectorAll(".tune__range");let L=new Map,S=(e,t)=>{switch(e){case"blur":t+="px";break;case"brightness":break;case"hue-rotate":t+="deg";break;case"saturate":case"invert":case"contrast":case"grayscale":t+="%"}return t},b=e=>{var t=e.target,e=t.name;let o="";t=S(e,t.value);L.has(e)&&L.delete(e),L.set(e,t),L.forEach((e,t)=>o+=` ${t}(${e})`),g.filter=o,i.set("filters",o),v()},E=e=>{switch(e.id){case"brightness":e.value=1;break;case"saturate":case"contrast":e.value=100;break;case"hue-rotate":case"invert":case"blur":case"grayscale":e.value=0}},k=e=>{var t=e.target;E(t),b(e)};w.forEach(e=>e.addEventListener("input",b)),w.forEach(e=>e.addEventListener("dblclick",k));const q=document.querySelector(".button__reset-tune");let x=()=>{i.delete("filters"),g.filter="none",w.forEach(e=>E(e)),L.clear()};q.addEventListener("click",()=>{x(),e()});const C=document.querySelector(".buttons__reset");function R(){i.clear(),x(),n.length=0,e()}C.addEventListener("click",R);const A=document.querySelector(".buttons__save");A.addEventListener("click",()=>{const e=document.querySelectorAll(".format__radio");let t;e.forEach(e=>{e.checked&&(t=`image/${e.id}`)});var o=m.toDataURL(t);A.href=o});const $=document.querySelector(".filters");let M="";let I=e=>{e=e.target.dataset.name;g.filter=e,i.set("filters",e),v()};t.forEach(e=>{e=`<li class="presets__item filters__item" data-name=${e}>
                <span class="presets__name" data-name=${e}> ${o[t.indexOf(e)]} </span>
                <img class="presets__image filters__image" src="img/preset.jpg" alt="Rainbow Image" data-name=${e}>
            </li>`;M+=e}),$.innerHTML=M,(()=>{const e=document.querySelectorAll(".filters__item");e.forEach(e=>e.addEventListener("click",I))})(),(()=>{const e=document.querySelectorAll(".filters__image");e.forEach(e=>{var t=e.dataset.name;e.style.filter=t})})();const W=document.querySelector(".presets__add-preset"),T=document.querySelector(".modal"),j=T.querySelector("#preset-name"),B=T.querySelector(".modal__close"),H=T.querySelector(".modal__btn-add-name"),O=document.querySelector(".warning"),D=O.querySelector(".warning__button"),U=document.querySelector(".pop-up__overlay");let z="",N=e=>{var t=e.getBoundingClientRect().width,t=document.documentElement.clientWidth/2-t/2;e.style.left=t+"px"};let P=e=>e<10?"0"+e:e,Y=()=>{T.classList.remove("modal--show"),U.classList.remove("pop-up__overlay--show")};D.addEventListener("click",()=>{O.classList.remove("warning--show"),U.classList.remove("pop-up__overlay--show")}),H.addEventListener("click",()=>{var e=Object.fromEntries(L),e=JSON.stringify(e);z=j.value,""==z&&(()=>{let e=new Date;z=`${P(e.getDate())}.${P(e.getMonth())}.${e.getFullYear()}-${P(e.getHours())}:${P(e.getMinutes())}:${P(e.getSeconds())}`})(),localStorage.setItem("preset"+z,e),j.value="",Y(),c()}),B.addEventListener("click",Y),W.addEventListener("click",()=>{0==L.size?(O.classList.add("warning--show"),N(O)):(T.classList.add("modal--show"),N(T)),U.classList.add("pop-up__overlay--show")});let X=e=>{let i=e.split(" ");w.forEach(e=>{for(var t of i){var o,a;-1!==t.indexOf(e.id)&&(a=e.id.length,o=t.slice(0,a),a=parseInt(t.slice(a+1,-1)),e.value=a,L.has(o)&&L.delete(o),a=S(o,a),L.set(o,a))}})};const J=document.querySelector(".text__input"),F=document.querySelector(".text__add"),G=document.querySelector(".text__delete"),K=document.querySelector(".missing-text"),Q=document.querySelector(".missing-text__button"),V=document.querySelector(".text__color"),Z=document.querySelector(".text__size");class ee{createTextModal(){this.text=J.value,this.color=V.value,this.size=Z.value;let e=document.createElement("div");e.style.minWidth="12rem",e.classList.add("photo__modal"),e.setAttribute("draggable",!0),h.appendChild(e);let t=document.createElement("p");t.textContent=this.text,t.style.color=this.color,t.style.display="block",t.style.fontSize=`${this.size}px`,t.style.lineHeight=`${1.4*this.size}px`,e.appendChild(t);let o=document.createElement("button");o.setAttribute("type","button"),o.classList.add("button"),o.classList.add("photo__delete-modal"),e.appendChild(o);let a=document.createElement("button");a.setAttribute("type","button"),a.classList.add("button"),a.classList.add("photo__add-modal"),e.appendChild(a)}}let te=e=>{let t=e.target.closest("div");t.parentNode.removeChild(t),J.value=""},oe=(e,t,o)=>{var a=.8*m.width,i=1.4*Z.value,r=e.split(" ");let s="";for(let e=0;e<r.length;e++){var n=s+r[e]+" ";a<g.measureText(n).width&&0<e?(g.fillText(s,t,o),s=r[e]+" ",o+=i):s=n}g.fillText(s,t,o)},ae=e=>{let t=e.target.closest("div"),o=t.querySelector("p");var a=Z.value,i=o.getBoundingClientRect().x-m.getBoundingClientRect().x,r=o.getBoundingClientRect().y-m.getBoundingClientRect().y,s=V.value;g.font=`bold ${a}px Roboto`,g.fillStyle=s,g.textAlign="left",g.filter="none",oe(J.value,i,r),n.push(["text",`${J.value}`,i,r,s,a]),te(e),J.value=""},ie=()=>{let e=document.querySelectorAll(".photo__delete-modal");e.forEach(e=>e.addEventListener("click",te))},re=t=>{let e=document.querySelectorAll(".photo__add-modal");e.forEach(e=>e.addEventListener("click",t))},se=()=>{let e=document.querySelectorAll(".photo__modal");e.forEach(e=>e.addEventListener("mousedown",ne))},ne=e=>{y(e);let o=e.target.closest("div"),a=e.clientX-o.getBoundingClientRect().left/2,i=e.clientY-o.getBoundingClientRect().top/2;o.ondragstart=function(){return!1};let t=e=>{var t;0<e.buttons&&(t=e.pageX,e=e.pageY,o.style.left=t-a+"px",o.style.top=e-i+"px")};e=()=>{h.removeEventListener("mousemove",t),o.onmouseup=null};h.addEventListener("mousemove",function(e,t){let o=!1,a,i;function r(){if(o)return a=arguments,void(i=this);e.apply(this,arguments),o=!0,setTimeout(function(){o=!1,a&&(r.apply(i,a),a=i=null)},t)}return r}(t,400)),o.addEventListener("mouseup",e),o.addEventListener("mouseout",e)};Q.addEventListener("click",()=>{K.classList.remove("missing-text--show"),U.classList.remove("pop-up__overlay--show")}),F.addEventListener("click",()=>{""==J.value?(K.classList.add("missing-text--show"),N(K),U.classList.add("pop-up__overlay--show")):((new ee).createTextModal(),ie(),re(ae),se())}),G.addEventListener("click",()=>{pe("text"),v()});const le=document.querySelector(".stickers__list"),ce=document.querySelector(".stickers__delete");fetch("stickers.json").then(e=>e.json()).then(e=>{ue(e);const t=document.querySelectorAll(".stickers__item");t.forEach(e=>e.addEventListener("click",ge))});class de{constructor(e,t){this.url=e,this.id=t}createSticker(){let e=document.createElement("li");e.classList.add("stickers__item"),e.dataset.name=this.id;let t=document.createElement("img");t.setAttribute("src",this.url),e.appendChild(t),le.appendChild(e)}}let ue=t=>{for(var o in t){let e=new de(t[o].url,t[o].id);e.createSticker()}};class he{constructor(e){this.src=e.target.src}createStickerModal(){let e=document.createElement("div");e.classList.add("photo__modal"),e.setAttribute("width",.8*m.width),e.setAttribute("draggable",!0),h.appendChild(e);let t=document.createElement("img");t.setAttribute("src",this.src),t.setAttribute("width",.4*m.width),t.classList.add("photo__sticker"),e.appendChild(t);let o=document.createElement("button");o.setAttribute("type","button"),o.classList.add("button"),o.classList.add("photo__delete-modal"),e.appendChild(o);let a=document.createElement("button");a.setAttribute("type","button"),a.classList.add("button"),a.classList.add("photo__add-modal"),e.appendChild(a)}}let me=e=>{let t=e.target.closest("div"),o=t.querySelector(".photo__sticker");var a=o.getBoundingClientRect().x-m.getBoundingClientRect().x,i=o.getBoundingClientRect().y-m.getBoundingClientRect().y,r=.4*m.width,s=r*o.height/o.width;g.filter="none",n.push(["sticker",o,a,i,r,s]),g.drawImage(o,a,i,r,s),te(e)},ge=e=>{new he(e).createStickerModal(),ie(),re(me),se()},pe=e=>{let t=0;for(;t<n.length;)n[t][0]===e?n.splice(n.indexOf(n[t]),1):++t};ce.addEventListener("click",()=>{pe("sticker"),v()});const ve=document.querySelector(".rotate__button--left"),_e=document.querySelector(".rotate__button--right"),fe=document.querySelector(".rotate__button--down"),ye=document.querySelector(".rotate__button--mirror");let we=0;var Le=e=>{i.set("isRotateSide",!0);var t="left"==e.target.dataset.name?-90:90,o=u.width/u.height;g.clearRect(0,0,m.width,m.height),m.width=d.offsetWidth,m.height=m.width*o,m.height>document.documentElement.clientHeight&&(m.height=document.documentElement.clientHeight,m.width=m.height/o);o="left"==e.target.dataset.name?0:m.width,e="left"==e.target.dataset.name?m.height:0;g.translate(o,e),g.rotate(Math.PI/180*t),v()};fe.addEventListener("click",()=>{i.set("isRotateSide",!1);let e=0,t=0;p(),we+=180,we%360!=0&&(e=m.width,t=m.height),g.clearRect(0,0,m.width,m.height),g.translate(e,t),g.rotate(Math.PI/180*we),v()}),ve.addEventListener("click",Le),_e.addEventListener("click",Le),ye.addEventListener("click",()=>{g.clearRect(0,0,m.width,m.height),i.set("isMirror",!0),v(),i.set("isMirror",!1)});Le=/^((?!chrome|android).)*safari/i.test(navigator.userAgent.toLowerCase());if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&!Le){const $e=document.querySelector(".tools__download"),Me=document.createElement("button");Me.classList.add("tools__make-photo"),Me.classList.add("button"),Me.textContent="Сделать снимок с веб-камеры",$e.appendChild(Me);const Ie=document.querySelector(".webcamera__video"),We=document.querySelector(".tools__make-photo"),Te=document.querySelector(".webcamera"),je=Te.querySelector(".webcamera__make-photo"),Be=Te.querySelector(".webcamera__close"),He={video:{width:m.width,height:m.height}};let t;let o=()=>{Te.classList.remove("webcamera--show"),t.stop()};We.addEventListener("click",function(){navigator.mediaDevices.getUserMedia(He).then(e=>{Te.classList.add("webcamera--show"),Ie.srcObject=e,Ie.setAttribute("width",m.width),Ie.setAttribute("height",m.height),t=e.getTracks()[0],Ie.onloadedmetadata=function(e){Ie.play()}}).catch(function(e){console.log(e)})}),Be.addEventListener("click",o),je.addEventListener("click",()=>{let e,t;e=Ie.videoWidth>m.width?m.width:Ie.videoWidth,t=e*Ie.videoHeight/Ie.videoWidth,o(),g.clearRect(0,0,m.width,m.height),m.height=t,m.width=e,g.drawImage(Ie,0,0,e,t),u.src=m.toDataURL("image/png")})}window.addEventListener("beforeunload",function(e){return!0});const Se=document.querySelector("#paint-color"),be=document.querySelector("#paint-size"),Ee=document.querySelector(".paint__add"),ke=document.querySelector(".paint__delete"),qe=document.querySelector(".paint");let xe,Ce;document.documentElement.clientWidth<=1024&&(qe.style.display="none");let Re=e=>{Ce.lineWidth=be.value,Ce.strokeStyle=Se.value,Ce.lineCap="round",Ce.filter="none";var t=e.offsetX,o=e.offsetY,a=e.movementX,i=e.movementY;0<e.buttons&&(Ce.beginPath(),Ce.moveTo(t,o),Ce.lineTo(t-a,o-i),Ce.stroke(),Ce.closePath())};Ee.addEventListener("click",()=>{(()=>{let e=document.createElement("canvas");e.classList.add("canvas-layer"),e.width=m.width,e.height=m.height,e.style.position="absolute",e.style.top=0,e.style.left=0,h.appendChild(e),xe=document.querySelector(".canvas-layer"),Ce=xe.getContext("2d"),Ae()})(),xe.addEventListener("mousemove",Re)}),ke.addEventListener("click",()=>{let e=document.querySelectorAll(".hidden-photo");e.forEach(e=>e.parentNode.removeChild(e)),pe("img"),v()});let Ae=()=>{xe.addEventListener("mouseleave",()=>{m.removeEventListener("mousemove",Re),(()=>{var e=xe.toDataURL("image/png");let t=document.createElement("img");t.src=e,t.classList.add("visually-hidden-photo"),t.classList.add("hidden-photo"),t.onload=function(){h.appendChild(t),n.push(["img",t]),v()}})();setTimeout(function(){xe.parentNode.removeChild(xe)},1e3)})}};