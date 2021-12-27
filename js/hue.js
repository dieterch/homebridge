/**
 * Philips Hue Homebridge-MQTTThing Codec (encoder/decoder)
 * Codecs allow custom logic to be applied to accessories in mqttthing, rather like apply() functions, 
 * but in the convenience of a stand-alone JavaScript file.
 */

 'use strict';
 const t = require("./tools");
 const a = require("./automations");

/**
 * Initialise codec for accessory
 */
function init( params ) {
    // extract parameters for convenience
    let { log, config, publish, notify } = params;
    let msg = `--> hue.js. ${config._ ? config._ : ''}`;
    log( msg );
    config.url = config.url ? config.url : "http://localhost:1883";
    // log(config)
    let state = {}
    const t1 = 
    (config.period) ? new a.TimerObj(
        params,
        "t1",
        "shellies/shelly1-554C88/relay/0/command",
        "on",
        "off")
    : null
    
    /**
     * Encode message before sending.
     * The output function may be called to deliver an encoded value for the property later.
     */
     function encode( message, info, output ) {
        t.log_en(log, message, info, message);
        output( message );
    }

    /**
     * Decode received message, and optionally return decoded value.
     * The output function may be called to deliver a decoded value for the property later.
     */
    function decode( message, info, output ) { // eslint-disable-line no-unused-vars
        t.log_de(log, message, info, message)
        output( message );
    }

    function decode_motionDetected( message, info, output ) { // eslint-disable-line no-unused-vars
        t.log_de(log, message, info, message)
        msg = JSON.parse(message);
        if (info.topic == "zigbee2mqtt/FlurBewegungsmelder") {
            if (msg.occupancy) { if(t1) { t1.timer(info); }} 
            output( message );
        }
    }

    function decode_Switch( message, info, output ) {
        t.log_de(log, message, info, message)
        msg = JSON.parse(message)
        //log(msg)

        if (info.topic == "zigbee2mqtt/Wohnzimmerschalter") {
            if (["on-press","on-hold"].includes(msg.action)) {
                publish("shellies/shellyix3-98CDAC24BCC3/input/2","1")
            };
            if (["up-press","up-hold","down-press","down-hold"].includes(msg.action)) {
                publish("zigbee2mqtt/Wohnzimmer1/setBrightness",JSON.stringify({"brightness":msg.brightness}));
                publish("zigbee2mqtt/Wohnzimmer2/setBrightness",JSON.stringify({"brightness":msg.brightness}));
                publish("zigbee2mqtt/Wohnzimmer3/setBrightness",JSON.stringify({"brightness":msg.brightness}));
            };   
            if (["off-press","off-hold"].includes(msg.action)) {
                publish("shellies/shellyix3-98CDAC24BCC3/input/2","0")
            };
        };

        if (info.topic == "zigbee2mqtt/FlurSchalter") {
            if (["on-press","on-hold","up-press","up-hold"].includes(msg.action)) {
                publish("shellies/shelly1-554C88/relay/0/command","on")
            };
            if (["off-press","off-hold","down-press","down-hold"].includes(msg.action)) {
                publish("shellies/shelly1-554C88/relay/0/command","off")
            };
        }

    }

    function encode_on( message, info, output ) {
        t.log_en(log, message, info, message);
        output( message );
    }

    function decode_on( message, info, output ) {
        t.log_de(log, message, info, message)
        output( message );
    }

    function encode_HSV( message, info ) {
        let params=message.split(",")
        let b=Math.round(2.54*params[2]);
        let result = {brightness:b,color:{hue:params[0],saturation:params[1]}}
        t.log_en(log, message, info, JSON.stringify(result));
        return JSON.stringify(result)
    }

    function decode_HSV( message ) {
        let params=message.split(",")
        let result = {brightness:params[2],color:{hue:params[0],saturation:params[1]}}
        t.log_de(log, message, info, JSON.stringify(result));
        return JSON.stringify(result)
    }

    function encode_ColorTemperature( message, info ) {
        let retval = {"color_temp": t.scale_to(140,250,500,454,message)};
        t.log_en(log, message, info, JSON.stringify(retval));
        return JSON.stringify(retval)
    }

    function decode_ColorTemperature( message, info ) {
        let retval = {"color_temp": t.scale_to(250,140,454,500,message)};
        t.log_de(log, message, info, JSON.stringify(retval));
        return JSON.stringify(retval)
    }

    function encode_brightness( message, info ) {
        // scale up to 0-255 range
        let retval = {"brightness":t.scale_to(0,0,100,255,message)};
        t.log_en(log, message, info, JSON.stringify(retval));
        return JSON.stringify(retval)
    }

    function decode_brightness( message, info ) {
        // scale down to 0-100 range
        let retval = {"brightness":t.scale_to(0,0,255,100,message)};
        t.log_de(log, message, info, JSON.stringify(retval));
        return JSON.stringify(retval)
    }

    // return encode and decode functions
    return { 
        encode, decode, // default encode/decode functions
        properties: {
            on: { 
                encode: encode_on,
                decode: decode_on
            },
            brightness: { // encode/decode functions for brightness property
                encode: encode_brightness,
                decode: decode_brightness
            },
            HSV: {
                encode: encode_HSV,
                decode: decode_HSV
            },
            colorTemperature: {
                encode: encode_ColorTemperature,
                decode: decode_ColorTemperature
            },
            switch0: {
                decode: decode_Switch                
            },
            motionDetected: {
                decode: decode_motionDetected
            }
        }
    };
}

// export initialisation function
module.exports = {
    init
};
