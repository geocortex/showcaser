(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Showcaser = factory());
}(this, (function () { 'use strict';

function __$styleInject(css, returnValue) {
  if (typeof document === 'undefined') {
    return returnValue;
  }
  css = css || '';
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  head.appendChild(style);
  return returnValue;
}
__$styleInject(".showcaser-trap-scroll{overflow:hidden}.showcaser-container{position:fixed;opacity:0;top:0;left:0;bottom:0;right:0;z-index:9999999}.showcaser-container.showcaser-container-delay{-webkit-transition:opacity .25s ease-in-out;transition:opacity .25s ease-in-out}.showcaser{position:absolute;border:1px solid #fff}.showcaser.showcaser-full-screen{width:0;height:0;left:50%;top:50%;border:none}.showcaser-text-container{position:absolute;width:32em;max-width:75vw}.showcaser-text-container.right{left:100%;padding-left:2em}.showcaser-text-container.center{left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%);text-align:center}.showcaser-text-container.left{text-align:right;right:100%;padding-right:2em}.showcaser-text-container.bottom{top:100%;padding-top:2em}.showcaser-text-container.top{top:0;-webkit-transform:translateY(-100%);transform:translateY(-100%);padding-bottom:1em}.showcaser-text-container.middle{top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.showcaser-text-container.center.middle{top:50%;left:50%;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%)}.showcaser-text-container.center.top{top:0;left:50%;-webkit-transform:translate(-50%,-100%);transform:translate(-50%,-100%)}.showcaser.showcaser-full-screen .showcaser-text-container{top:50%;left:50%;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%);text-align:center}.showcaser-text{color:#fff;font-size:1.2em;letter-spacing:.05em}.showcaser-button-container{position:relative;margin-top:1.5em}.showcaser-button{background:0 0;border:none;border-radius:2px;color:#fff;position:relative;height:2.25em;line-height:2.25em;margin:0;min-width:4em;padding:0 1em;display:inline-block;font-family:Roboto,sans-serif;font-size:1em;font-weight:500;text-transform:uppercase;letter-spacing:0;overflow:hidden;will-change:box-shadow;-webkit-transition:box-shadow .2s cubic-bezier(.4,0,1,1),background-color .2s cubic-bezier(.4,0,.2,1),color .2s cubic-bezier(.4,0,.2,1);transition:box-shadow .2s cubic-bezier(.4,0,1,1),background-color .2s cubic-bezier(.4,0,.2,1),color .2s cubic-bezier(.4,0,.2,1);outline:none;cursor:pointer;text-decoration:none;text-align:center;vertical-align:middle}.showcaser-button:hover{background-color:hsla(0,0%,62%,.2)}.showcaser-button:focus:not(:active){background-color:rgba(0,0,0,.12)}.showcaser-button:active{background-color:hsla(0,0%,62%,.4)}.showcaser-skip{color:#fff;cursor:pointer;left:100%;bottom:.3em;margin-left:2em;white-space:nowrap;line-height:1.5;display:inline;font-size:.9em;vertical-align:middle}.showcaser-text-container.left .showcaser-skip{right:100%;left:auto}",undefined);

// import Smoothscroll from "./smoothscroll";
var Showcaser = (function () {
    function Showcaser() {
    }
    Showcaser.showcase = function (text, element, options) {
        var args = this._sanitizeArgs(element, text, options);
        if (!args) {
            // Sanitizing failed. Can't continue on with this part of the showcase
            throw new Error("Can't start Showcaser due to invalid options");
        }
        if (this._isVisible || this._showcaseQueue.length) {
            this._showcaseQueue.push(args);
        }
        else {
            this._startShowcase(args);
        }
    };
    Showcaser.close = function () {
        this._cancelCheckPositionInterval();
        if (this._container) {
            document.body.removeChild(this._container);
        }
        this._releaseTrappedBodyScroll();
        if (this._args.options.close) {
            this._args.options.close();
        }
        this._args = null;
        this._container = null;
        this._showcaser = null;
        this._textContainer = null;
        this._isVisible = false;
        this._lastPosition = null;
        if (this._showcaseQueue.length) {
            var nextItem = this._showcaseQueue.shift();
            this._startShowcase(nextItem);
        }
    };
    Showcaser.skipAll = function () {
        // Clear out all remaining queued Showcaser items
        this._showcaseQueue = [];
        // Args gets cleared out in close() so we need to keep a reference to the skip callback function
        var skip = this._args.options.skip;
        this.close();
        if (skip) {
            skip();
        }
    };
    Object.defineProperty(Showcaser, "queueLength", {
        get: function () {
            return this._showcaseQueue.length;
        },
        enumerable: true,
        configurable: true
    });
    Showcaser._start = function (args) {
        var _this = this;
        this._args = args;
        this._isVisible = true;
        // Create all the DOM necessary to display the showcase
        var container = document.createElement("div");
        container.className = "showcaser-container";
        if (args.options.fadeBackground) {
            container.className += " showcaser-container-delay";
        }
        var showcaser = document.createElement("div");
        showcaser.className = "showcaser";
        if (!args.element) {
            showcaser.className += " showcaser-full-screen";
        }
        var backgroundColor = args.options.backgroundColor;
        var shadowRGBA = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
        showcaser.style.boxShadow = "0 0 0 99999px " + shadowRGBA + ", inset 0 2px 16px rgba(0,0,0,.3)";
        container.appendChild(showcaser);
        var textContainer = document.createElement("div");
        showcaser.appendChild(textContainer);
        var textElement = document.createElement("div");
        textElement.className = "showcaser-text";
        textElement.innerHTML = args.text;
        textContainer.appendChild(textElement);
        var buttonContainer = document.createElement("div");
        buttonContainer.className = "showcaser-button-container";
        textContainer.appendChild(buttonContainer);
        var showcaserButton = document.createElement("button");
        showcaserButton.className = "showcaser-button waves-effect waves-light btn";
        showcaserButton.textContent = args.options.buttonText;
        showcaserButton.onclick = function (event) { _this._nextButtonClick(event); };
        buttonContainer.appendChild(showcaserButton);
        if (args.options.allowSkip) {
            var skipButton = document.createElement("div");
            skipButton.className = "showcaser-skip";
            skipButton.onclick = function (event) { _this._skipClick(event); };
            skipButton.textContent = args.options.skipText || "Skip";
            buttonContainer.appendChild(skipButton);
        }
        // Adding a border-radius breaks the box-shadow background on Safari for handheld/tablet and Mac
        if (!this._isSafari()) {
            // TODO: Use CSS class instead of inline style
            var radiusString = (args.options.shape === "circle" ? "50%" : "5px");
            showcaser.style.borderRadius = radiusString;
        }
        document.body.appendChild(container);
        this._container = container;
        this._showcaser = showcaser;
        this._textContainer = textContainer;
        this._trapBodyScroll();
        this._scrollAndEnable();
    };
    Showcaser._isSafari = function () {
        return navigator.vendor && navigator.vendor.indexOf("Apple") > -1 &&
            navigator.userAgent && !navigator.userAgent.match("CriOS");
    };
    Showcaser._setupCheckPositionInterval = function () {
        var _this = this;
        if (this._args.options.positionTracker && this._args.element && !this._checkPositionIntervalToken) {
            this._checkPositionIntervalToken = setInterval(function () {
                if (_this._isScrolling) {
                    return;
                }
                var element = _this._args.element;
                if (!element || !_this._isElementVisible(element)) {
                    _this.close();
                    return;
                }
                var newPosition = _this._getElementViewportPosition(element);
                var lastPosition = _this._lastPosition;
                var newViewportWidth = document.body.clientWidth;
                var newViewportHeight = document.body.clientHeight;
                // Check if size or position of element has changed since we last re-rendered
                if (newPosition.top !== lastPosition.top ||
                    newPosition.right !== lastPosition.right ||
                    newPosition.bottom !== lastPosition.bottom ||
                    newPosition.left !== lastPosition.left ||
                    newViewportWidth !== _this._lastViewportWidth ||
                    newViewportHeight !== _this._lastViewportHeight) {
                    _this._scrollAndEnable();
                }
            }, 200);
        }
    };
    Showcaser._cancelCheckPositionInterval = function () {
        if (this._checkPositionIntervalToken) {
            clearInterval(this._checkPositionIntervalToken);
            this._checkPositionIntervalToken = null;
        }
    };
    Showcaser._isElementVisible = function (elem) {
        return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
    };
    Showcaser._getElementViewportPosition = function (elem) {
        return elem.getBoundingClientRect();
    };
    Showcaser._getElementDocumentPosition = function (element) {
        var rect = element.getBoundingClientRect();
        var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
    };
    Showcaser._scrollAndEnable = function () {
        if (this._args.element) {
            var element = this._args.element;
            // Position relative to the viewport
            var rect = this._getElementViewportPosition(element);
            // Make sure element is visible
            if (!this._isElementVisible(element)) {
                console.warn("Showcaser: Element not visible", this._args.element);
                this.close();
                return;
            }
            var windowScrollPosition = window.pageYOffset;
            var bufferPx = this._args.options.scrollBufferPx || 15;
            var isElAboveViewport = rect.top - bufferPx < 0;
            var isElBelowViewport = rect.top + bufferPx + rect.height >
                (window.innerHeight || document.documentElement.clientHeight);
            // Check if we need to scroll page to be able to see the element. Scroll if necessary
            // We check the page's scroll position as we use a 'scrollBuffer' to give additional space
            // between the element and the viewport. If the page can't be scrolled, 
            // there's no reason to wait 500ms.
            if (isElAboveViewport && isElBelowViewport) {
                // Overflows above and below viewport ¯\_(ツ)_/¯
                this._positionAndShow();
            }
            else if (isElAboveViewport) {
                // this._isScrolling = true;
                var elPosition = this._getElementDocumentPosition(element);
                var scrollTo_1 = Math.max(elPosition.top - bufferPx, 0);
                // Smoothscroll(scrollAmount, 500, () => {
                //     this._isScrolling = false;
                //     this._positionAndShow();
                // });
                window.scrollTo(0, scrollTo_1);
                this._positionAndShow();
            }
            else if (isElBelowViewport) {
                // this._isScrolling = true;
                var elPosition = this._getElementDocumentPosition(element);
                var scrollTo_2 = Math.max(elPosition.top - bufferPx, 0);
                // Smoothscroll(scrollAmount, 500, () => {
                //     this._isScrolling = false;
                //     this._positionAndShow();
                // });
                window.scrollTo(0, scrollTo_2);
                this._positionAndShow();
            }
            else {
                // Fully visible
                this._positionAndShow();
            }
        }
        else {
            this._positionAndShow();
        }
    };
    Showcaser._positionAndShow = function () {
        // If the user closes the showcase before scroll happens (delayed by a timeout)
        // then args are gonna be null as the showcase has already been closed
        if (!this._args) {
            return;
        }
        var options = this._args.options;
        var element = this._args.element;
        if (element) {
            var rect = this._lastPosition = this._getElementViewportPosition(element);
            this._lastViewportWidth = document.body.clientWidth;
            this._lastViewportHeight = document.body.clientHeight;
            // Element has no dimensions
            if (!this._isElementVisible(element)) {
                console.warn("Showcaser: Element not visible", this._args.element);
                this.close();
                return;
            }
            var padding = typeof options.paddingPx !== "undefined" ? options.paddingPx : 20;
            if (options.shape === "circle") {
                var dimension = Math.round(rect.width > rect.height ? rect.width : rect.height) + padding;
                this._showcaser.style.width = dimension + "px";
                this._showcaser.style.height = dimension + "px";
                var diff = rect.width > rect.height ? rect.width - rect.height : rect.height - rect.width;
                // Height has changed, subtract the diff from top
                if (rect.width > rect.height) {
                    this._showcaser.style.top = Math.round(rect.top - diff / 2 - padding / 2) + "px";
                    this._showcaser.style.left = Math.round(rect.left - padding / 2) + "px";
                }
                else {
                    this._showcaser.style.top = Math.round(rect.top - padding / 2) + "px";
                    this._showcaser.style.left = Math.round(rect.left - diff / 2 - padding / 2) + "px";
                }
            }
            else if (options.shape === "rectangle") {
                this._showcaser.style.width = Math.round(rect.width + padding) + "px";
                this._showcaser.style.height = Math.round(rect.height + padding) + "px";
                this._showcaser.style.top = Math.round(rect.top - padding / 2) + "px";
                this._showcaser.style.left = Math.round(rect.left - padding / 2) + "px";
            }
        }
        // User-defined text position
        if (options.position) {
            var horizontal = options.position.horizontal || "right";
            var vertical = options.position.vertical || "middle";
            this._applyPositionStyling(vertical, horizontal);
        }
        else {
            // Apply default positioning, before checking for bleed
            var vertical = "top";
            var horizontal = "center";
            this._applyPositionStyling(vertical, horizontal);
            var textElRect = this._getElementViewportPosition(this._textContainer);
            // Vertical check: bleeds out from the top
            if (textElRect.top < 0) {
                vertical = "bottom";
            }
            // Horizontal check: bleeds out from the right
            if (textElRect.left + textElRect.width > document.body.clientWidth) {
                horizontal = "left";
            }
            else if (textElRect.left < 0) {
                horizontal = "right";
            }
            this._applyPositionStyling(vertical, horizontal);
        }
        this._container.style.opacity = "1";
        this._setupCheckPositionInterval();
    };
    Showcaser._applyPositionStyling = function (vertical, horizontal) {
        this._textContainer.className = "showcaser-text-container " + vertical + " " + horizontal;
    };
    Showcaser._trapBodyScroll = function () {
        document.body.className += " showcaser-trap-scroll";
    };
    Showcaser._releaseTrappedBodyScroll = function () {
        document.body.className = document.body.className.replace(/(?:^|\s)showcaser-trap-scroll(?!\S)/g, "");
    };
    Showcaser._startShowcase = function (args) {
        if (args.options.before) {
            args.options.before();
        }
        this._start(args);
    };
    Showcaser._nextButtonClick = function (event) {
        this.close();
        event.stopPropagation();
        return false;
    };
    Showcaser._skipClick = function (event) {
        this.skipAll();
        event.stopPropagation();
        return false;
    };
    Showcaser._sanitizeArgs = function (element, text, options) {
        if (!text) {
            throw new Error("Must specify text to showcase");
        }
        if (!options) {
            options = {};
        }
        if (!options.backgroundColor) {
            options.backgroundColor = {
                r: 0,
                g: 0,
                b: 0,
            };
        }
        if (!options.backgroundColor.a) {
            options.backgroundColor.a = 0.7;
        }
        if (typeof options.fadeBackground !== "boolean") {
            options.fadeBackground = true;
        }
        if (!options.shape) {
            options.shape = "circle";
        }
        if (!options.buttonText) {
            options.buttonText = "Got it";
        }
        if (typeof options.allowSkip !== "boolean") {
            options.allowSkip = true;
        }
        return {
            element: element,
            text: text,
            options: options,
        };
    };
    return Showcaser;
}());
Showcaser._showcaseQueue = [];

return Showcaser;

})));
