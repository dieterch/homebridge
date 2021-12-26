/**
 * Shelly Homebridge-MQTTThing Codec (encoder/decoder)
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
    let state = "false";
    let timeout = 3;

    let msg = `--> shelly.js. ${config._ ? config._ : ''}`;
    log( msg );
    config.url = config.url ? config.url : "http://localhost:1883";

    const t1 = 
    (config.period) ? new a.TimerObj(
        params,
        "t1",
        "shellies/shelly1-2C1435/relay/0/command",
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

    function encode_on( message, info, output ) {
        //bind Wohnzimmer1 und Wohnzimmer3 Schalter
        if (info.topic == "shellies/shellyix3-98CDAC24BCC3/input/2") {
            let msg = (message == "1") ? "true" : "false";
            if (t.debug()) { log(`shelly encode: ${(state == message) ? "state == message: skip" : "state != message:  run"}`) }
            if (state != message) {
                t.log_en(log, message, info, msg);
                publish("zwave/Wandschalter1/37/1/targetValue/set",msg)
                state = message
                return message
            }
        };
        //WC Timer
        if (info.topic == "shellies/shelly1-2C1435/relay/0/command") {
            msg = message.toString()
            if (state != msg) {
                if (msg == "on") { 
                    if (t1) { t1.timer(info); }
                }
                state = msg
                return message
            }
        }
        //output( message );
    }

    function decode_on( message, info, output ) {
        //bind Wohnzimmer1 und Wohnzimmer3 Schalter
        if (info.topic == "shellies/shellyix3-98CDAC24BCC3/input/2") {
            let msg = (message == "1") ? "true" : "false";
            if (t.debug()) { log(`shelly decode: ${(state == message) ? "state == message: skip" : "state != message:  run"}`) }
            if (state != message) {
                t.log_de(log, message, info, msg);
                //publish("zwave/Wohnzimmer/8/37/1/targetValue/set",msg) //heavy roundabout
                publish("zwave/Wandschalter1/37/1/targetValue/set",msg) //heavy roundabout
                state = message
                return message
            }
        };
        //WC Timer
        if (info.topic == "shellies/shelly1-2C1435/relay/0") {
            msg = message.toString()
           if (state != msg) {
                if (msg == "on") { 
                    if (t1) { t1.timer(info); }
                }
                state = msg
                return message
            }
        }        
        // output( message );
    }
    
    // return encode and decode functions
    return { 
        encode, decode, // default encode/decode functions
        properties: {
            on: { 
                encode: encode_on,
                decode: decode_on
            },
        }
    }
}

// export initialisation function
module.exports = {
    init
};
