// ==UserScript==
// @name         Sailthru Support Overlay 
// @namespace    http://www.sailthru-support.com
// @version      0.3
// @description  A Support-centric features overlay for the Sailthru UI
// @author       Joe Pikowski
// @match        https://my.sailthru.com*
// @grant        none
// ==/UserScript==

// Class Declaration

function SupportOverlay(){};

SupportOverlay.prototype.start = function(){
	var host = window.location.protocol + "//" + window.location.hostname;
	var path = window.location.pathname;

	if (host === "https://my.sailthru.com"){
		switch (path)
			{
			case "/reports/jobs":
				this.$ailthru(".odd,.even","addJobRowLinks");
				break;
			case "/feeds":
				this.$ailthru(".odd,.even","addFeedRowIDs");
				break;
			}
	}
};

SupportOverlay.prototype.$ailthru = function(selector, callback, timeout, keepAlive) {
    var intervalTime = 50;
    var timeout = timeout || 3000;
    var keepAlive = keepAlive || false;
    var maxAttempts = timeout / intervalTime;
    var attempts = 0;
    var elemCount = 0;
    var interval = setInterval(waitForMatch.bind(this), intervalTime);

    function waitForMatch(){
        if ($(selector).length > elemCount) {
            if (!keepAlive) {
                clearInterval(interval);
            }
            this[callback]($(selector));
            elemCount = $(selector).length;
        } else  if (attempts > maxAttempts) {
            clearInterval(interval);
        }
        attempts++;
    }
}

SupportOverlay.prototype.setCookie = function(name,value,days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
};

SupportOverlay.prototype.getCookie = function(name) {
    var key = escape(name) + "=";
    var cs = document.cookie.split(';');
    for (var i = 0; i < cs.length; i++) {
        var c = cs[i];
        while (c.charAt(0) === ' ') {
        	c = c.substring(1, c.length);
        }
        if (c.indexOf(key) === 0) {
        	return unescape(c.substring(key.length, c.length));
        }
    }
    return null;
};

SupportOverlay.prototype.addJobRowLinks = function(rows){
	var IDs = this.getRowIDs(rows);

	$(rows).each(addLinks);

	function addLinks(i){
		$(this).find('td').wrapInner('<a href="https://su.sailthru.com/lookup/db?collection=job&query='+IDs[i]+'"></a>')
	}
};

SupportOverlay.prototype.addFeedRowIDs = function(rows){
	var IDs = this.getRowIDs(rows);

	$(rows).each(addIDs);

	function addIDs(i){
		$(this).find('b').first().append(" | "+IDs[i]);
        $(this).find('b').first().wrapInner('<a href="https://su.sailthru.com/lookup/db?collection=feed&query='+IDs[i]+'"></a>')
	}
};

SupportOverlay.prototype.getRowIDs = function(rows){
	var IDs = [];

	$(rows).each(getIDsFromClass);

	function getIDsFromClass(){
		var rowClasses = $(this).attr('class').split(" ");

		rowClasses.forEach(getIDs);

		function getIDs(elem,ind,arr){
			if (elem.indexOf("id-") > -1){
				IDs.push(elem.substring(3));
			}
		}
	}
	return IDs;
};

$(function(){
    var overlay = new SupportOverlay();
	overlay.start();
});