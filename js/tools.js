/**
 * debug messages in Homebridge-MQTTThing Codecs (encoder/decoder)
 */

 'use strict';

const debugall = false
const maskdebug = false

function debug(override = false) {
    return ((debugall && !maskdebug) || (override && !maskdebug))
}

function log_en( log, message, info, result, override = false) {
    if (debug(override)) {
        log( `en -> topic[${info.topic}], property[${info.property}] to MQTT msg[${message}]` );
    }
}

function log_de( log, message, info, result, override = false) {
    if (debug(override)) {
        log( `de -> topic[${info.topic}], property[${info.property}] got msg[${message}] from MQTT, send msg[${result}] to mqtt-thing` );
    }
}

/*
  * linear Scaling Function
  * (x1 -> y1)
  * (x2 -> y2)
  * (140 -> 250)
  * (500 -> 454)
  * scale_to(140,250,500,454,message)
  */
function scale_to(x1,y1,x2,y2,x){
    return Math.round((y2-y1)/(x2-x1)*(x-x1)+y1)
}

function limit(y, min, max) {
    if (y < min) {
        return min
    }
    if (y > max) {
        return max
    }
    return y
}

function testlimit(log, min, max) {
    log(`test limit -10 ${limit(-10, min, max)}`)
    log(`test limit 0 ${limit(0, min, max)}`)
    log(`test limit 100 ${limit(100, min, max)}`)
    log(`test limit 255 ${limit(255, min, max)}`)
    log(`test limit 500 ${limit(500, min, max)}`)
}

 /*
  * Functions to convert HSV colors to RGB colors values for lightbulbs
  */
 function HSVtoRGB(r,a,e){
    var t,s,o,b,c,n,i,u;
    switch(1===arguments.length&&(a=r.s,e=r.v,r=r.h),n=e*(1-a),i=e*(1-(c=6*r-(b=Math.floor(6*r)))*a),u=e*(1-(1-c)*a),b%6){
        case 0:t=e,s=u,o=n;break;
        case 1:t=i,s=e,o=n;break;
        case 2:t=n,s=e,o=u;break;
        case 3:t=n,s=i,o=e;break;
        case 4:t=u,s=n,o=e;break;
        case 5:t=e,s=n,o=i}
    return{r:Math.round(255*t),g:Math.round(255*s),b:Math.round(255*o)}
}

 /*
  * Function to scale and convert HSV color values to XY color values lightbulbs
  */
function ScaledHSVtoRGB(r,a,e){
    return HSVtoRGB(r/360,a/100,e/100)
}
 
 /*
  * Function to convert RGB to XY color values for lightbulbs
  */
function rgb_to_cie(r,a,e){
    var t=.664511*(r=r>.04045?Math.pow((r+.055)/1.055,2.4):r/12.92)+.154324*(a=a>.04045?Math.pow((a+.055)/1.055,2.4):a/12.92)+.162028*(e=e>.04045?Math.pow((e+.055)/1.055,2.4):e/12.92),s=.283881*r+.668433*a+.047685*e,o=88e-6*r+.07231*a+.986039*e,b=(t/(t+s+o)).toFixed(4),c=(s/(t+s+o)).toFixed(4);
    return isNaN(b)&&(b=0),isNaN(c)&&(c=0),[b,c]
}


// export initialisation function
module.exports = {
    debug,
    log_en,
    log_de,
    scale_to,
    limit,
    testlimit,
    HSVtoRGB,
    ScaledHSVtoRGB,
    rgb_to_cie
};