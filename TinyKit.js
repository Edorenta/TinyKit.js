
"use strict";

/********************
 * DOM MANIPULATION *
 ********************/

// jQuery document.ready implementation (faster)
function DocReady(f) { // function f is passed as callback
  if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
    f();
  } else {
    document.addEventListener("DOMContentLoaded", f);
  }
};

// svg transform fix for IE / Edge
void(new MutationObserver(function(muts) {
  for(let i = muts.length; i--;) {
    let mut = muts[i], objs = mut.target.querySelectorAll('foreignObject');
    for(let j = objs.length; j--;) {
        let obj = objs[j];
        let val = obj.style.display;
        obj.style.display = 'none';
        obj.getBBox();
        obj.style.display = val;
    }
  }
}).observe(document.documentElement, { attributes: true, attributeFilter: ['transform'], subtree: true }));

// CSS insertion
var RuntimeStyle = document.createElement('style');

document.head.appendChild(RuntimeStyle);
var CSS_AddKeyFrames = null;
if (CSS && CSS.supports && CSS.supports('animation: name')){
    // we can safely assume that the browser supports unprefixed version.
    CSS_AddKeyFrames = function(name, s){
        CSS_Insert("@keyframes " + name, s);
    }
} else {
    CSS_AddKeyFrames = function(name, s){
      // Ugly and terrible, but users with this terrible of a browser
      // *cough* IE *cough* don't deserve a fast site
      let str = name + s;
      let pos = RuntimeStyle.length;
      RuntimeStyle.sheet.insertRule("@-webkit-keyframes " + str, pos);
      RuntimeStyle.sheet.insertRule("@keyframes " + str, pos + 1); //not sure about that, need to test
    }
}

var CSS_Insert = function(name, s){ //use to insert class/id/keyframes to RuntimeStyle
    let pos = RuntimeStyle.length;
    RuntimeStyle.sheet.insertRule(name + s, pos);
}

// HTML insertion
// .appendBefore(element) Prototype
Element.prototype.appendBefore = function (element) {
  element.parentNode.insertBefore(this, element);
},false;

// .appendAfter(element) Prototype
Element.prototype.appendAfter = function (element) {
  element.parentNode.insertBefore(this, element.nextSibling);
},false;

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

/***********
 * GESTURE *
 ***********/

// Gesture management
var MouseClick = null;
var Overlay = {}; // Overlay
var Underlay = {}; // Underlay
var Gesture = {
  // touch start / end
  start_x : 0,
  start_y : 0,
  end_x : 0,
  end_y : 0,
  Rec : ""
};
// initializes gesture and click puppet
!function() {
  DocReady(function() {
    MouseClick = new MouseEvent("click", { view: window, bubbles: true, cancelable: true });
    let visitor_id_div = document.getElementById("visitor_id");
    // if (visitor_id_div) { VisitorID = visitor_id_div.textContent; }
    // console.log("visitor id: " + visitor_id)
    Underlay.el = document.querySelector(".underlay");
    Overlay.el = document.querySelector(".overlay");
    if (Overlay.el) {
      Overlay.On = function() { Overlay.el.style.display = "block"; }
      Overlay.Off = function() { Overlay.el.style.display = "none"; }
      Overlay.Toggle = function() {
        if (Overlay.el.style.display() == "block") { Overlay.Off() } else { Overlay.On(); }
      }
      Gesture.Listen = function(el_id) {
        Gesture.el = document.querySelector(el_id);
        Gesture.el.addEventListener('touchstart', function(e) {
            Gesture.start_x = e.changedTouches[0].screenX;
            Gesture.start_y = e.changedTouches[0].screenY;
        }, false);
        Gesture.el.addEventListener('touchend', function(e) {
            Gesture.end_x = e.changedTouches[0].screenX;
            Gesture.end_y = e.changedTouches[0].screenY;
            Gesture.Handle(Gesture.start_x, Gesture.start_y, Gesture.end_x, Gesture.end_y);
        }, false); 
      }
      Gesture.Listen("body");
      // let _dim = Gesture.el.getBoundingClientRect();
      // console.log("dim:",_dim);
      Gesture.Handle = async function(_x1, _y1, _x2, _y2) {
        let is_callback = (typeof Gesture.Swipe === 'function'); // cb call is conditional
        let x_ratio = ((_x2 - _x1) / Gesture.el.offsetWidth);
        let y_ratio = -((_y2 - _y1) / Gesture.el.offsetHeight);
        // console.log(Gesture.w, Gesture.h, "xr:",x_ratio,"yr",y_ratio);
        if (Math.abs(x_ratio) > Math.abs(y_ratio) && x_ratio > 0.05) {// Gesture.Rec = "swipe-right";
            if (is_callback) { Gesture.Swipe("right"); }
        }
        if (Math.abs(x_ratio) < Math.abs(y_ratio) && y_ratio > 0.05) {// Gesture.Rec = "swipe-up";
            if (is_callback) { Gesture.Swipe("up"); }
        }
        if (Math.abs(x_ratio) > Math.abs(y_ratio) && x_ratio < -0.05) {// Gesture.Rec = "swipe-left";
            if (is_callback) { Gesture.Swipe("left"); }
        }
        if (Math.abs(x_ratio) < Math.abs(y_ratio) && y_ratio < -0.05) {// Gesture.Rec = "swipe-down";
            if (is_callback) { Gesture.Swipe("down"); }
        }
      }
    }
  });
}();

/*********
 * DATES *
 *********/

// get ordinal number as string
function ordinal(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

// returns proper local date from epoch (timestamp)
function epochToLocaleDate(epoch, language = "en-US", opt = null) {
  // opt = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let dt = new Date(epoch);
  return dt.toLocaleDateString(language, opt);
}

// returns proper string formatted date from epoch
// TODO: implement other languages as full text and improve
function epochToDate(epoch, readable = false, jump = [], language = "en-US") {
  let dt = new Date(epoch);
  function pad(n) { return n < 10 ? "0" + n : n; }
  if (readable) {
    let _m = [
      "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ];
    let _d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let date_full =
      (jump.includes("day") ? "" : (_d[dt.getDay()] + " "))
      + (jump.includes("ordinal") ? "" : (ordinal(dt.getDate()) + " "))
      + (jump.includes("month") ? "" : (_m[dt.getMonth()]) + " ")
      + (jump.includes("year") ? "" : dt.getFullYear());
    return date_full;
  }
  switch (language) {
    case "en-US":
      return [pad(dt.getMonth()+1), pad(dt.getDate()), dt.getFullYear()].join('/');
    break;
    case "en-UK":
    case "de-DE":
    case "fr-FR":
      return [pad(dt.getDate()), pad(dt.getMonth()+1), dt.getFullYear()].join('/');
    break;
  }
}

/**************
 * USER AGENT *
 **************/

// get query parameter
var QueryParam = function(key) {
    QueryParams = new URL(decodeURIComponent(document.location)).searchParams;
    return QueryParams.get(key);
}

// redirect user
function Redirect(to, replace = false) {
  let internal = (to[0] == '\\' || to[0] == '/'); // start with relative path >> internal redirection
  let destination = internal ? Domain + to : to;
  // similar behavior as an HTTP redirect
  // >> replaces the current document and replace the current History
  // >> can't go back to the previous document loaded
  replace
  ? window.location.replace(destination)
  // similar to click >> href redirect (usual dom redirect)
  // >> identical to window.location.href = destination
  : window.location.assign(destination);
}
// get href and location related information >> domain / protocol etc
var DomainName = function() { // returns the domain name of the web host
  return window.location.hostname;
}
var Protocol = function() { // returns the web protocol used (http: or https:)
  return window.location.protocol;
}
var Port = function() {
  return window.location.port;
}
var Domain = function() {
  return window.location.protocol + '//'
    + window.location.hostname
    + (window.location.port ? ':' + window.location.port: '');
}
var Path = function() {
  return window.location.pathname;
}
var URL = function() {
  return window.location.href;
}

// get raw encoded cookies as string
function RawCookies() {
  let cookies_list = document.cookie.split(';');
  let concat = '';
  for (let i = 1; i <= cookies_list.length; i++) {
    concat += i + ' ' + cookies_list[i-1] + "\n";
  }
  return concat;
}

// browser detection (consistent / non usual)
var BrowserName = function() {
  if (!!window.chrome && !!window.chrome.webstore) {
    return "chrome";
  } // Chrome 1+
  if (/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification))) {
    return "safari";
  } // Safari 3.0+ "[object HTMLElementConstructor]"
  if (typeof InstallTrigger !== 'undefined') {
    return "firefox";
  } // Firefox 1.0+ 
  if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
    return "opera";
  } // Opera 8.0+
  if (!isIE && !!window.StyleMedia) {
    return "edge";
  } // Edge 20+
  if (/*@cc_on!@*/false || !!document.documentMode) {
    return "ie";
  } // Internet Explorer 6-11
  return undefined;
  ///if ((isChrome || isOpera) && !!window.CSS; // Blink engine detection
}

/********
 * FORM *
 ********/

function FormReset(form_id) {
  document.getElementById(form_id).reset();
}

function FormParams(form_id) {
  return Array.from(new FormData(document.getElementById(form_id)),
    e => e.map(encodeURIComponent).join('=')).join('&')
}

function FormSubmit(form_id, method, action, destination, content_type, callback) {
  // SubmitForm("POST", "/post_log_in", "application/x-www-form-urlencoded");
  let xhr = new XMLHttpRequest();
  xhr.open(method, destination, true);
  xhr.setRequestHeader("Content-type", content_type);
  xhr.send(/*"action=" + action + "&" + */FormParams(form_id));
  xhr.onload = callback;
}

/***********
 * GENERAL *
 ***********/

// dynamically load libraries from cdn (use if local not available)
function cdnSafeLoad(url, cb) {
  let script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  script.async = true; // load asynchronously
  script.onload = cb;
  document.body.appendChild(script);
}

// asynchronous call to sleep makes setTimeout more imperative style
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// custom ajax / socket requester
function _API(channel, method, path, onload, onerror/*, onabort*/) {
  //channel: websocket/xhr/fetch
  //method: GET/POST/PUT/PATCH/DELETE
  //path: /api/v1/...
  //onload: function(response){ console.log(response);... }
  if (channel.toLowerCase() == "ajax" || channel.toLowerCase() == "xhr") {
    let xhr = new XMLHttpRequest();
    xhr.open(method, path, true);
    xhr.onload = function() { onload(xhr.response); }
    // xhr.onerror = onerror("xhr request failed");
    // xhr.onerror = onerror("xhr request failed");
    xhr.send();
  } else if (channel.toLowerCase() == "websocket" || channel.toLowerCase() == "ws") {
    let wsw = new WebSocketWrapper(VisitorID, "api");
    wsw.DefaultCallbacks();
    wsw.OnMessage(onload(e.data/*responseText*/));
    wsw.OnError(onerror("websocket request failed"));
    wsw.Send("{ method: " + method + ", path: " + path + " }"); // send JSON formatted WebSocket request to server 
  } else if (channel.toLowerCase() == "fetch") {
    // fetch method to implement (similar to xhr with promise)
  }
}

// capitalizes each word of the string (removes other upper case)
function strCapitalize(str) {
  return str.toLowerCase().replace(/(^| )(\w)/g, s => s.toUpperCase());
}

// checks if var is array
function isArray(obj){
    return !!obj && obj.constructor === Array;
}

// checks if a value from the array is contained in str
function arrayMatch(str, array) {
  for (let i in array) {
    if (str.indexOf(array[i]) > -1) { return array[i]; }
  }
  return "";
}

// returns boolean depending on whether the string is part of one of the lists
function listCompliant(str, blacklist, whitelist) {
  return ((!blacklist || (isArray(blacklist) && blacklist.indexOf(str) == -1)) // str not on blacklist
    && (!whitelist || (isArray(whitelist) && whitelist.indexOf(str) > -1))); // str on whitelist
}

// imitates PHP's implode(), works for both objects and arrays (jumps prototypes)
function implode(arr, blacklist = null, whitelist = null) {
  // console.log(arr);
  let cat = "";
  if (typeof arr !== "undefined"/* && typeof arr.length !=="undefined" && arr.length > 0*/) {
      // console.log(arr.name, arr.sport, arr.views);
    for(let key in arr) {
      if(typeof key !== 'undefined' && arr.hasOwnProperty(key) /* && typeof arr[key] !== 'undefined' && arr[key] && arr[key] != ""*/) {
        if (typeof arr[key] === 'object') {
          if (listCompliant(key, blacklist, whitelist)) {
            /*if (isArray(arr[key]) && arr[key].length > 0) {
              console.log("isArray:yes for", key);
              cat += arr[key].join(","); // TODO: explode inside of array >> achieved by treating array as object
            } else */
            if (key != "__proto__" && key != "<prototype>") { // exclude prototypes >> infinite loop
              cat += implode(arr[key]);
            }
          }
        } else if (listCompliant(key, blacklist, whitelist)) {
          cat += " " + arr[key].toString().trim();
          // console.log(arr[key].toString());
        }
      }
    }
  }
  // console.log(cat);
  return cat;
}
