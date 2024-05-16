function coolmathCallStart() {
    if (typeof parent.cmgGameEvent === "function") {
        try {
            parent.cmgGameEvent("start");
        } catch (e) {}
    }
    console.log("game start event");
}
function coolmathCallLevelStart(level) {
    if (typeof parent.cmgGameEvent === "function") {
        try {
            parent.cmgGameEvent("start", String(level));
        } catch (e) {}
    }
    console.log("level start " + level);
}
function coolmathCallLevelRestart(level) {
    if (typeof parent.cmgGameEvent === "function") {
        try {
            parent.cmgGameEvent("replay", String(level));
        } catch (e) {}
    }
    console.log("level restart " + level);
}

var shouldUnlockAll = false;
function unlockAllLevels() {
    shouldUnlockAll = true;
}

function coolMathShouldUnlockAll() {
    return shouldUnlockAll;
}

var adIsPlaying = 0;

// To trigger the event Listener adBreakStart
document.addEventListener("adBreakStart", () => {
	console.log("AdBreak Started");
	adIsPlaying = 1;
});  

// To trigger the event Listener  adBreakComplete
document.addEventListener("adBreakComplete", () => {
	console.log("adBreak Complete");
	adIsPlaying = 0;
});    

function coolMathAdOpportunity() {
	console.log("Coolmath AdBreak opportunity triggered");
	cmgAdBreak();

	return true;
}

function coolMathAdIsPlaying() {
	// For debugging; return either true or false, randomly
	return adIsPlaying;
}