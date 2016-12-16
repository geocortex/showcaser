import raf from "raf";

function smoothscroll(scrollTo: number | string | Element, scrollDuration?: number, finishCallback?: Function) {
    // Edited from: https://gist.github.com/joshcanhelp/a3a669df80898d4097a1e2c01dea52c1

    let scrollAmount = 0;

    if (typeof scrollTo === "string" || scrollTo instanceof Element) {
        let scrollToObj;

        if (typeof scrollTo === "string") {
            // Assuming this is a selector we can use to find an element
            scrollToObj = document.querySelector(scrollTo);
        }

        if (scrollToObj && typeof scrollToObj.getBoundingClientRect === "function") {
            scrollAmount = window.pageYOffset + scrollToObj.getBoundingClientRect().top;
        } else {
            // TODO: improve error message
            throw new Error(`No element found with the selector ${scrollAmount}`);
        }
    }

    if (scrollTo instanceof Element) {
        scrollAmount = window.pageYOffset + scrollTo.getBoundingClientRect().top;
    }

    // Set a default for the duration
    if (typeof scrollDuration !== "number" || scrollDuration < 0) {
        scrollDuration = 500;
    }

    // Declarations
    const cosParameter = (window.pageYOffset - scrollAmount) / 2;
    let scrollCount = 0;
    let oldTimestamp = window.performance.now();

    const step = (newTimestamp) => {
        let tsDiff = newTimestamp - oldTimestamp;

        // Performance.now() polyfill loads late so passed-in timestamp is a larger offset
        // on the first go-through than we want so I'm adjusting the difference down here.
        // Regardless, we would rather have a slightly slower animation than a big jump so a good
        // safeguard, even if we're not using the polyfill.
        if (tsDiff > 100) {
            tsDiff = 30;
        }

        scrollCount += Math.PI / (scrollDuration / tsDiff);

        // As soon as we cross over Pi, we're about where we need to be
        if (scrollCount >= Math.PI) {
            if (finishCallback) {
                finishCallback();
            }

            return;
        }

        const moveStep = Math.round(scrollAmount + cosParameter + cosParameter * Math.cos(scrollCount));
        window.scrollTo(0, moveStep);
        oldTimestamp = newTimestamp;
        raf(step);
    };

    raf(step);
}

export default smoothscroll;
