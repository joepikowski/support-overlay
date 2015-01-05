// ==UserScript==
// @name         Sailthru Support Overlay 
// @namespace    http://www.sailthru-support.com
// @version      0.4
// @description  A Support-centric features overlay for the Sailthru UI
// @author       Joe Pikowski
// @match        https://my.sailthru.com*
// @grant        none
// ==/UserScript==

// Class Declaration

function SupportOverlay(){
    this.host = window.location.protocol + "//" + window.location.hostname;
    this.path = window.location.pathname;
    this.cookie = this.getCookie("stoverlay");
};

SupportOverlay.prototype.start = function(){
	if (this.host === "https://my.sailthru.com"){
		this.$ailthru("#header_top_right","addToggleButton");
        if (this.cookie !== "off") {
            this.insertElementsByPath(this.path);
        }
	}
};

SupportOverlay.prototype.insertElementsByPath = function(path){
    switch (path)
        {
        case "/reports/jobs":
            this.$ailthru(".odd,.even","addJobRowLinks");
            break;
        case "/feeds":
            this.$ailthru(".odd,.even","addFeedRowIDs");
            break;
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
    this.cookie = value;
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

SupportOverlay.prototype.addToggleButton = function(match) {
    var c = this.cookie;
    var img = c === "off" ? "tools-grey" : "tools";
    var buttonHTML = '<div id="sailthru-overlay-toggle" class="header_top_right_item" style="padding-right:15px; padding-top:5px;"><img src="https://my.sailthru.com/ssl?url=http%3A%2F%2Fsailthru-support.com%2Fimg%2F'+img+'.png" /></div>';
	
    $(match).prepend(buttonHTML);
    $("#sailthru-overlay-toggle").click(this.toggleOverlay.bind(this));
};

SupportOverlay.prototype.toggleOverlay = function() {
    var c = this.cookie;

    if (!c || c === "on"){
        this.setCookie("stoverlay","off",7);
        $(".stoverlay-elem").hide();
        $(".stoverlay-link").contents().unwrap();
        $("#sailthru-overlay-toggle img").attr("src","https://my.sailthru.com/ssl?url=http%3A%2F%2Fsailthru-support.com%2Fimg%2Ftools-grey.png");
    }else{
        this.setCookie("stoverlay","on",7);
        $("#sailthru-overlay-toggle img").attr("src","https://my.sailthru.com/ssl?url=http%3A%2F%2Fsailthru-support.com%2Fimg%2Ftools.png");
        this.insertElementsByPath(this.path);
    }
};

SupportOverlay.prototype.addJobRowLinks = function(rows){
	var IDs = this.getRowIDs(rows);

	$(rows).each(addLinks);

	function addLinks(i){
		$(this).find('td').wrapInner('<a class="stoverlay-link" href="https://su.sailthru.com/lookup/db?collection=job&query='+IDs[i]+'"></a>')
	}
};

SupportOverlay.prototype.addFeedRowIDs = function(rows){
	var IDs = this.getRowIDs(rows);

	$(rows).each(addIDs);

	function addIDs(i){
		$(this).find('b').first().append('<span class="stoverlay-elem"> | '+IDs[i]+'</span>');
        $(this).find('b').first().wrapInner('<a class="stoverlay-link" href="https://su.sailthru.com/lookup/db?collection=feed&query='+IDs[i]+'"></a>')
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