"use strict";

function Nunu(){}

Nunu.NAME = "nunuStudio";
Nunu.VERSION = "V0.8.9.17 Alpha";
Nunu.TIMESTAMP = "201701011920";

//Check if webvr is available
Nunu.webvrAvailable = function()
{
	return navigator.getVRDisplays !== undefined;
};
