// ==UserScript==
// @name         Sailthru Support Overlay 
// @namespace    http://www.sailthru-support.com
// @version      0.7
// @description  A Support-centric features overlay for the Sailthru UI
// @author       Joe Pikowski
// @include      https://my.sailthru.com/*
// @include      https://su.sailthru.com/*
// @updateURL    http://sailthru-support.com/js/supportoverlay.js
// @grant        none
// ==/UserScript==

// Class Declaration

function SupportOverlay(){
    this.host = window.location.protocol + "//" + window.location.hostname;
    this.path = window.location.pathname;
    this.cookie = this.getCookie("stoverlay");
};

SupportOverlay.prototype.start = function(){
    if (this.host === "https://my.sailthru.com" || this.host === "https://su.sailthru.com"){
        this.$ailthru("#header_top_right","addToggleButton");
        if (this.cookie !== "off") {
            this.$ailthru(".pagination","addAJAXListener");
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
        case "/reports/user_lookup":
            this.$ailthru(".user_image img","addProfileLink");
            this.$ailthru("#name","addProfileLink");
            this.$ailthru(".user_lookup_mass_mails,.user_lookup_transactionals","addMessageLink");
            break;
        case "/lookup/message":
            this.$ailthru(".standard tr td:eq(1)","addBlastLink");
            break;
        case "/lookup/content":
            this.$ailthru("#interface h3","addContentLink");
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
    var buttonHTML = '<div id="sailthru-overlay-toggle" class="header_top_right_item" style="padding-right:15px; padding-top:5px; cursor:pointer;"><img src="https://my.sailthru.com/ssl?url=http%3A%2F%2Fsailthru-support.com%2Fimg%2F'+img+'.png" /></div>';
    
    $(match).prepend(buttonHTML);
    $("#sailthru-overlay-toggle").click(this.toggleOverlay.bind(this));
};

SupportOverlay.prototype.addAJAXListener = function(match) {
    $(".pagination").find(".button,.pagination_button").not(".disabled,.pagination_button_disabled").on("click",addListener.bind(this));

    function addListener(){
        $(document).ajaxComplete(this.renderAfterAJAX.bind(this));
    }
};

SupportOverlay.prototype.renderAfterAJAX = function(match) {
    $(document).unbind("ajaxComplete");
    this.$ailthru(".pagination","addAJAXListener");
    if (this.cookie !== "off") {
        this.insertElementsByPath(this.path);
    }
};

SupportOverlay.prototype.toggleOverlay = function() {
    var c = this.cookie;

    if (!c || c === "on"){
        this.setCookie("stoverlay","off",7);
        $(".stoverlay-elem").hide();
        $(".stoverlay-link").contents().unwrap();
        $("#sailthru-overlay-toggle img").attr("src","https://my.sailthru.com/ssl?url=http%3A%2F%2Fsailthru-support.com%2Fimg%2Ftools-grey.png");
        $("#name").css("color","");
        $(document).unbind("ajaxComplete");
    }else{
        this.setCookie("stoverlay","on",7);
        $("#sailthru-overlay-toggle img").attr("src","https://my.sailthru.com/ssl?url=http%3A%2F%2Fsailthru-support.com%2Fimg%2Ftools.png");
        $(document).ajaxComplete(this.renderAfterAJAX.bind(this));
        this.insertElementsByPath(this.path);
    }
};

SupportOverlay.prototype.addJobRowLinks = function(rows){
    var IDs = this.getRowIDs(rows);

    $(rows).each(addLinks);

    function addLinks(i){
        $(this).find('td').wrapInner('<a class="stoverlay-link" style="color:#00CCED;" href="https://su.sailthru.com/lookup/db?collection=job&query='+IDs[i]+'"></a>');
    }
};

SupportOverlay.prototype.addFeedRowIDs = function(rows){
    var IDs = this.getRowIDs(rows);

    $(rows).each(addIDs);

    function addIDs(i){
        $(this).find('b').first().append('<span class="stoverlay-elem"> | '+IDs[i]+'</span>');
        $(this).find('b').first().wrapInner('<a class="stoverlay-link" style="color:#00CCED;" href="https://su.sailthru.com/lookup/db?collection=feed&query='+IDs[i]+'"></a>');
    }
};

SupportOverlay.prototype.addProfileLink = function(profileItem){
    var clientID = $("#client_name").text().match(/\d+/)[0];
    var userEmail = encodeURIComponent($("#name").text());

    $(profileItem).wrap('<a class="stoverlay-link" style="color:#00CCED;" href="https://su.sailthru.com/lookup/db?collection=profile&query=%7B%22client_id%22:'+clientID+',%22email%22:%22'+userEmail+'%22%7D"></a>').css("color","#00CCED");
};

SupportOverlay.prototype.addMessageLink = function(messageSection){
    var rows = $(messageSection).parents(".user_row").find(".odd,.even");

    var IDs = this.getRowIDs(rows);

    $(rows).each(addIDs);

    function addIDs(i){
        $(this).find('td').wrapInner('<a class="stoverlay-link" style="color:#00CCED;" href="https://su.sailthru.com/lookup/message?message_id='+IDs[i]+'"></a>');
    }
};

SupportOverlay.prototype.addBlastLink = function(blast){
    var ID = $(blast).text();
    
    $(blast).wrapInner('<a class="stoverlay-link" style="color:#00CCED;" href="https://su.sailthru.com/lookup/db?collection=blast&query='+ID+'"></a>');
};

SupportOverlay.prototype.addContentLink = function(content){
    var URL = encodeURIComponent($(content).eq(1).find("a").text());
    var clientID = $("#client_name").text().match(/\d+/)[0];

    $(content).first().wrapInner('<a class="stoverlay-link" style="color:#00CCED;" href="https://su.sailthru.com/lookup/db?collection=content&query=%7B%22client_id%22:'+clientID+',%22url%22:%22'+URL+'%22%7D"></a>');
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