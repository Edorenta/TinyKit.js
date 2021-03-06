"use strict";

/********************
 * DOM MANIPULATION *
 ********************/

var Placeholder = {
	s1: "https://i.imgur.com/jiKi1KW.png",
	s2: "https://i.imgur.com/2tAvXxg.png",
	m1: "https://lh5.googleusercontent.com/JkdPGhPBWQJYdd7w7QYYjp5IMZx0gaikk2L5V2CDNOa2FrbqfEn_WBfyZ_PAZ7dkKIs8I3_sAUVaD9GrpO7o=w1920-h882",
	m2: "https://lh3.googleusercontent.com/en8wnLhL9-30zMhg74Z4RsuZvvktoa6ugnaHITVPoldsxw0U-jgcI-JnMxqNuobCx40kIQU6_xPJVaBFt3BA=w1920-h882"
}
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

// add the RevealClass to the css:
let reveal_right = `{
	transition: all .25s ease-in-out;
	opacity: 0;
}`;
CSS_Insert(".reveal", reveal_right);
// HTML insertion
// .appendBefore(element) Prototype
Element.prototype.appendBefore = function (el) {
	el.parentNode.insertBefore(this, el);
},false;

// .appendAfter(element) Prototype
Element.prototype.appendAfter = function (el) {
	el.parentNode.insertBefore(this, el.nextSibling);
},false;

Element.prototype.isVisible = function(el) {
	let rect = GetElementRect(this);
	let height = Polyfill.windowHeight();
	// top el edge is visible OR bottom el edge is visible
	let topVisible = rect.top > 0 && rect.top < height;
	let bottomVisible = rect.bottom < height && rect.bottom > 0;

	return topVisible || bottomVisible;
	// return (el.offsetWidth > 0 && el.offsetHeight > 0); // doesn't work if element
}

Element.prototype.fullyVisible = function(el) {
	let rect = GetElementRect(this);
	let height = Polyfill.windowHeight();

	// top el edge is visible OR bottom el edge is visible
	let topVisible = rect.top > 0 && rect.top < height;
	let bottomVisible = rect.bottom < height && rect.bottom > 0;

	return topVisible && bottomVisible;
	// return (el.offsetWidth > 0 && el.offsetHeight > 0); // doesn't work if element
}

Element.prototype.halfVisible = function(el) {
	let rect = GetElementRect(this);
	let height = Polyfill.windowHeight();

	// top el edge is visible OR bottom el edge is visible
	let topVisible = rect.top > 0 && rect.top < height;
	let bottomVisible = rect.bottom < height && rect.bottom > 0;

	return topVisible && bottomVisible;
	// return (el.offsetWidth > 0 && el.offsetHeight > 0); // doesn't work if element
}

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

var Scroll = {};
// DESKTOP
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
// left: 37, up: 38, right: 39, down: 40,
// (Source: http://stackoverflow.com/a/4770179)
Scroll.keys = [32,33,34,35,36,37,38,39,40];

// requestAnimationFrame for Smart Animating http://goo.gl/sx5sts
// there are plenty of polyfills for non compatible browsers

function GetElement(el) { // can select from string if no element is passed
	if (!(el && el.nodeType && el.nodeType == 1)) { // nodeType 1 == actual element
			el = document.querySelector(el);
			if (!(el && el.nodeType && el.nodeType == 1)) { return null; }
	}
	return el;
}

function GetElementRect(el) {
	el = GetElement(el); if (!el) { return; }
	return el.getBoundingClientRect();
}

var Polyfill = {};

Polyfill.windowWidth = function() {
	let poly =
		(((window.innerWidth && document.documentElement.clientWidth)
		? Math.min(window.innerWidth, document.documentElement.clientWidth)
		: window.innerWidth)
		|| document.documentElement.clientWidth
		|| 0);
		return poly;
}

Polyfill.windowHeight = function() {
	let poly =
		(((window.innerHeight && document.documentElement.clientHeight)
		? Math.min(window.innerHeight, document.documentElement.clientHeight)
		: window.innerHeight)
		|| document.documentElement.clientHeight
		|| 0);
		return poly;
}

Polyfill.docWidth = function() {
	let poly =
		(document.body.offsetWidth
		|| document.getElementsByTagName('body')[0].clientWidth
		|| 0);
		return poly;
}

Polyfill.docHeight = function() {
	let poly =
		(document.body.offsetHeight
		|| document.getElementsByTagName('body')[0].clientHeight
		|| 0);
		return poly;
}

Polyfill.scrollTop = function(px) {
	if (typeof px === "number") { // setter
		window.pageYOffset =
		document.body.parentNode.scrollTop =
		document.documentElement.scrollTop =
		document.body.scrollTop = px;
		return;
	}
	let poly = // getter
		(window.pageYOffset
		|| document.body.parentNode.scrollTop
		|| document.documentElement.scrollTop
		|| document.body.scrollTop
		|| 0);
		return poly;
}

Polyfill.scrollLeft = function(px) {
	if (typeof px === "number") { // setter
		window.pageXOffset =
		document.body.parentNode.scrollLeft =
		document.documentElement.scrollLeft =
		document.body.scrollLeft = px;
		return;
	}
	let poly = // getter
		(window.pageXOffset
		|| document.body.parentNode.scrollLeft
		|| document.documentElement.scrollLeft
		|| document.body.scrollLeft
		|| 0);
		return poly;
}

var requestAnimFrame = (function() {
	return window.requestAnimationFrame
		|| window.webkitRequestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| function(cb) { window.setTimeout(cb, 1000 / 60); };
})();

// initializes gesture and click puppet
!function() {
	DocReady(function() { // set all that up asynchronously not to block page loading
		let _rect = GetElementRect("body");
		document.width = _rect.width;
		document.height = _rect.height;
		document.top = _rect.top;
		document.bottom = _rect.bottom;
		window.width = Polyfill.windowWidth();
		window.height = Polyfill.windowHeight();
		MouseClick = new MouseEvent("click", { view: window, bubbles: true, cancelable: true });
		Scroll.intoViewOptionSupport = function() {
			return isSmoothScrollSupported = 'scrollBehavior' in document.documentElement.style;
		}
		Scroll.intoView = function(el) {
			if (Scroll.intoViewOptionSupport() == true) { // could use a try / catch as well
				element.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});		
			} else {
				element.scrollIntoView(false);
			}
		}
		Scroll.preventDefault = function(e) {
			e = e || window.event;
			if (e.preventDefault)
					e.preventDefault();
			e.returnValue = false;	
		}
		Scroll.keydown = function(e) {
				for (var i = keys.length; i > 0; i--) {
						if (e.keyCode === keys[i]) {
								Scroll.preventDefault(e);
								return;
						}
				}
		}
		Scroll.wheel = function(e) {
			Scroll.preventDefault(e);
		}
		Scroll.disable = function() {
			if (window.addEventListener) {
					window.addEventListener('DOMMouseScroll', Scroll.wheel, false);
			}
			window.onmousewheel = document.onmousewheel = Scroll.wheel;
			document.onkeydown = Scroll.keydown;
			Scroll.disableMobile();
		}
		Scroll.enable = function() {
				if (window.removeEventListener) {
						window.removeEventListener('DOMMouseScroll', Scroll.wheel, false);
				}
				window.onmousewheel = document.onmousewheel = document.onkeydown = null;	
				Scroll.enableMobile();
		}
		Scroll.disableMobile = function() {
			document.addEventListener('touchmove', Scroll.preventDefault, false);
		}
		Scroll.enableMobile = function() {
			document.removeEventListener('touchmove', Scroll.preventDefault, false);
		}
		Scroll.left = function(px = null) {
			if (typeof px === "number") { // setter
				Scroll.to(px);
			} else { // getter
				return Polyfill.scrollLeft();
			}
		}
		Scroll.top = function(px = null) { // Scroll.top(0) to go top
			if (typeof px === "number") { // setter
				Scroll.to(0, px);
			} else { // getter
				return Polyfill.scrollTop();
			}
		}
		Scroll.to = function(x = null, y = null, cb = null, duration = 500, step = 25) {
			if (typeof x !== "number" && typeof y !== "number") { return; } // no valid coordinates passed
			x = typeof x !== "number" ? Scroll.left() : x;
			y = typeof y !== "number" ? Scroll.top() : y;
			let start = { x: Scroll.left(), y: Scroll.top() };
			let change = { x: (x - start.x), y: (y - start.y) };

			let time_now = 0;
			var animateScroll = function() {
				time_now += step;
				// move the document.body
				let shift = {
					x: Math.easeInOutQuad(time_now, start.x, change.x, duration),
					y: Math.easeInOutQuad(time_now, start.y, change.y, duration)
				}
				// polyfill setters
				Polyfill.scrollTop(shift.y);
				Polyfill.scrollLeft(shift.x);
				// do / recurse the animation unless its over
				if (time_now < duration) {
					requestAnimFrame(animateScroll);
				} else {
					if (cb && typeof(cb) === 'function') { cb(); }
				}
			};
			animateScroll();
		}
		Scroll.toElement = function(el = null , cb = null, duration = 500, step = 25) {
			el = GetElement(el);
			console.log("element:", el);
			if (el == null) { return; }
			let offset = {
				x: GetElementRect(el).left - GetElementRect("body").left,
				y: GetElementRect(el).top - GetElementRect("body").top
			}
			console.log("scrolling to:", offset.x, offset.y);
			Scroll.to(offset.x, offset.y, cb, duration, step);
		}
		Underlay.el = document.querySelector(".underlay");
		Overlay.el = document.querySelector(".overlay");
		if (Overlay.el) {
			Overlay.On = function(style = "block") { Overlay.el.style.display = style; } // style can be flex..;
			Overlay.Off = function() { Overlay.el.style.display = "none"; } // need to be safer
			Overlay.Toggle = function() {
				if (Overlay.el.style.display() == "block") { Overlay.Off() } else { Overlay.On(); }
			}
			Gesture.Listen = function(el_id) {
				Gesture.el = document.querySelector(el_id);
				Gesture.el.addEventListener('touchstart', function(e) {
						Gesture.start.x = e.changedTouches[0].screenX;
						Gesture.start.y = e.changedTouches[0].screenY;
				}, false);
				Gesture.el.addEventListener('touchend', function(e) {
						Gesture.end_x = e.changedTouches[0].screenX;
						Gesture.end_y = e.changedTouches[0].screenY;
						Gesture.Handle(Gesture.start.x, Gesture.start.y, Gesture.end_x, Gesture.end_y);
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

// TODO: wrap in a common namespace to prevent overrides
// get href and location related information >> domain / protocol etc
function _location(uri = null) { return new URL(uri ? uri : window.location); }
function Protocol(uri = null) { return _location(uri).protocol; } // = Method = Scheme
function DomainName(uri = null) { return _location(uri).hostname; } // = HostName
function Port(uri = null) { return _location(uri).port; }
function Path(uri = null) { return _location(uri).pathname; }
function URL(uri = null) { return _location(uri).href; }
function Domain(uri = null) {
	let url = _location(uri);
	return url.protocol + '//' + url.hostname + (url.port ? ':' + url.port: '');
}

// get query parameter, looks into the document url by default
function QueryParam(key, uri = null) {
	let url = _location(uri);
	QueryParams = new URL(decodeURIComponent(url)).searchParams;
	return QueryParams.get(key);
}

// change visible uri
function UpdateURL(to, replace = false, new_stateObj = { id: "" }, new_title = "") {
	replace
	? history.replaceState(new_stateObj, new_title, to)
	: history.pushState(new_stateObj, new_title, to);
}

// add a listener to the URL change event
function OnURLUpdate(f) { // f(event) >> can play with history.state...
	window.addEventListener('popstate', f, false);
}
// redirect user
function Redirect(to, replace = false) {
	to = to.replace('\\', '/').trim();
	let prefix = to[0];
	let internal = prefix == '/' //relative redirection
	|| (to.indexOf(Domain()) > -1); // absolute redirection to our domain
	if (prefix == "#" || prefix == ".") {
	// redirect to element on the same page >> scroll to anchor
		console.log("scrolling to anchor:", to);
		Scroll.toElement(to);
	} else {
		let anchor_start = to.indexOf(Path());
		let n = to.length;
		if (anchor_start > -1 && internal) {
			let anchor =
			anchor_start < n ? to.substring(anchor_start, to.length())
			: null;
			anchor ? Scroll.toElement(anchor) : Scroll.top(0); // i.e. home from home
			anchor ? console.log("scrolling to anchor:", anchor) : console.log("scrolling to top");
		} else {
			let destination = internal ? Domain() + to : to;
			// similar behavior as an HTTP redirect
			// >> replaces the current document and replace the current History
			// >> can't go back to the previous document loaded
			replace
			? window.location.replace(destination)
			// similar to click >> href redirect (usual dom redirect)
			// >> identical to window.location.href = destination
			: window.location.assign(destination);
		}
	}
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

function FormSubmit(form_id, method, action, destination, content_type, cb) {
	// SubmitForm("POST", "/post_log_in", "application/x-www-form-urlencoded");
	let xhr = new XMLHttpRequest();
	xhr.open(method, destination, true);
	xhr.setRequestHeader("Content-type", content_type);
	xhr.send(/*"action=" + action + "&" + */FormParams(form_id));
	xhr.onload = cb;
}

/***********
 * GENERAL *
 ***********/

// dynamically load libraries from cdn (use if local not available)
async function cdnSafeLoad(url, cb) {
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

function json2query(p) {
	let p_str = null;
	if (!isEmpty(p)) {
		p_str = "?";
		let size = Object.keys(p).length;
		let i = 0;
		for (let key in p) {
			i++;
			if (p.hasOwnProperty(key)) {
				let val = p[key];
				p_str += key + "=" + val;
				if (i != size) { p_str += "&"; }
			}
		}
	}
	return encodeURI(p_str);
}

function query2json(uri = null) {
	let url = _location(uri);
	let pairs = url.search.slice(1).split('&');
	let result = {};
	pairs.forEach(function(pair) {
		pair = pair.split('=');
		result[pair[0]] = decodeURIComponent(pair[1] || '');
	});
	return JSON.parse(JSON.stringify(result));
}

// custom ajax function, similar to jquery
function _ajax(opt) {
	opt = {
		method: opt.method ? opt.method : "GET", // GET/POST/PUT/PATCH/DELETE
		url: opt.url ? opt.url : null,
		headers: opt.headers ? opt.headers : {}, // object of key / values to be set as headers
		queryString: opt.queryString ? opt.queryString : "", // querystring already put together
		queryParameters: opt.queryParameters ? opt.queryParameters : {}, // query parameters as keys & values
		async: opt.async ? opt.async : true,
		onprogress: opt.onprogress ? opt.onprogress : null, // function with parameter xhr.status
		onload: opt.onload ? opt.onload : null, // function with 2 arguments: xhr.status and xhr.response
		onredirect: opt.onredirect ? opt.onredirect : null,
		oninformation: opt.oninformation ? opt.oninformation : null,
		onsuccess: opt.onsuccess ? opt.onsuccess
			: function(status, res) { console.log("default ajax success", status); },
		onerror: opt.onerror ? opt.onerror
			: function(status, res) { console.log("default ajax error", status); }
	}
	// console.log("request options:", opt);
	// TODO: implements safety checks (valid url / headers...)
	let xhr = new XMLHttpRequest();
	// set request headers
	if (!isObjectEmpty(opt.headers)) {
		for (let header in opt.headers) {
			if (opt.headers.hasOwnProperty(header)) {
				let value = opt.headers[header];
				xhr.setRequestHeader(header, value);
			}
		}
	}
	if (!isObjectEmpty(opt.queryParameters)) {
		let p_str = json2query(opt.queryParameters);
		// add the newly created queryString to the existing or replace it
		opt.queryString = isSet(opt.queryString) ? (opt.queryString + "&" + p_str)
		: p_str;
	}
	xhr.open(opt.method, opt.url + opt.queryString, opt.async);
	if (opt.onprogress) {
		xhr.onprogress = function() { opt.onprogress(xhr.status); }
	}
	if (opt.onerror) {
		xhr.onerror = function() { opt.onerror(xhr.status); }
	}
	// onload is being called for successful AND failed requests
	xhr.onload = function() {
		if (opt.onload) {
			opt.onload(xhr.status, xhr.response);
		}
		switch(Math.floor(xhr.status / 100)) {
			// Informational response, codes 1XX
			case 1:
				if (opt.oninformation) {
					opt.oninformation(xhr.status);
				}
				break;
			// Success, codes 2XX
			case 2:
				if (opt.onsuccess) {
					opt.onsuccess(xhr.status, xhr.response);
				}
				break;
			// Redirection, codes 3XX
			case 3:
				if (opt.onredirect) {
					opt.onredirect(xhr.status, xhr.response);
				}
				break;
			// Client Error, codes 4XX
			case 4:
				if (opt.onerror) {
					opt.onerror(xhr.status);
				}
				break;
			// Server Error, codes 5XX
			case 5:
				if (opt.onerror) {
					opt.onerror(xhr.status);
				}
				break;
		}
	}
	// xhr.onerror = onerror("xhr request failed");
	// xhr.onerror = onerror("xhr request failed");
	xhr.send();
}

// custom ajax / socket requester
async function _API(channel, method, path, onload, onerror/*, onabort*/) {
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

// checks if var is defined and different than null
function isSet(v) {
	return (typeof v !== "undefined" && v != null && v != "");
}

function isEmpty(o) {
	return (isArrayEmpty(o) && isObjectEmpty(o)); // could use bitwise &
}

function isObjectEmpty(o) {
	if (!isSet(o) || !isObject(o)) { return true; }
	for(let key in o) {
		if (o.hasOwnProperty(key)) {
			return false;
		}
	}
	return true;
}

function isArrayEmpty(a) {
	if (!isSet(a) || !isArray(a) || a.length == 0) { return true; }
	return false;
}

// checks if var is array
function isArray(o) {
	return (!!o && o.constructor === Array); // (obj instanceof array)
}
function isObject(o) {
	return (!!o && o.constructor === Object); // (typeof obj === "object") // (obj instanceof Object)
}

// checks if a value from the array matches with in str
function arrayMatch(str, array) {
	for (let i in array) {
		if (str.indexOf(array[i]) > -1) { return array[i]; }
	}
	return "";
}
// checks if a value from the object matches with str
function objectValueMatch(str, obj, key = null) {
	for (let i in obj) {
		if (isArray(obj[i])/* && !key &&*/) {
			let tmp = arrayMatch(str, obj[i]);
			if (tmp) { return tmp }
		} else { // TODO: implement generic (without key)
			if (key in obj[i] && str.indexOf(obj[i][key]) > -1) {
				return obj[i];
			}
		}
	}
	return "";
}

function objToArray(obj, key = null, bkey = null, bval = null) { // blacklists keys / values should be obj / array
	let tmp = [];
	for (let i in obj) {
		if (key in obj[i] && (!bkey || !(bkey in obj[i]) || obj[i][bkey] != bval)) { tmp.push(obj[i][key]); }
	}
	return tmp.length > 0 ? tmp : null;
	// if (dim == 1) { return Object.keys(obj); } // lvl 1 keys
	// if (dim == 2) {
	// }
	// TODO: go deeper recursively 
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
							cat += implode(arr[key], blacklist, whitelist);
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
	return cat.trim();
}

// easing functions http://goo.gl/5HLl8
Math.easeInOutQuad = function(t, b, c, d) {
	t /= d / 2;
	if (t < 1) {
		return c / 2 * t * t + b
	}
	t--;
	return -c / 2 * (t * (t - 2) - 1) + b;
};

Math.easeInCubic = function(t, b, c, d) {
	var tc = (t /= d) * t * t;
	return b + c * (tc);
};

Math.inOutQuintic = function(t, b, c, d) {
	var ts = (t /= d) * t,
		tc = ts * t;
	return b + c * (6 * tc * ts + -15 * ts * ts + 10 * tc);
};
