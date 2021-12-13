/**
 * zwave Homebridge-MQTTThing Codec (encoder/decoder)
 * Codecs allow custom logic to be applied to accessories in mqttthing, rather like apply() functions, 
 * but in the convenience of a stand-alone JavaScript file.
 */

 'use strict';
 const t = require("./tools");

/**
 * Initialise codec for accessory
 */
function init( params ) {
    // extract parameters for convenience
    let { log, config, publish, notify } = params;

    setTimeout( () => {
        let msg = `--> zwave.js. ${config._ ? config._ : ''}`;
        log( msg );
        config.url = config.url ? config.url : "http://localhost:1883"
    }, 1000 );

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
        //woraround binding
        if (info.topic == "zwave/Wohnzimmer/5/37/2/0/set") {
            let msg = (message == "true") ? "1" : "0";
            t.log_en(log, message, info, msg, true);
            //publish("shellies/shellyix3-98CDAC24BCC3/input/2",msg)
        }
        output( message );
    }

    function decode_on( message, info, output ) {
        //woraround binding
        if (info.topic == "zwave/Wohnzimmer/5/37/2/0") {
            let msg = (message == "true") ? "1" : "0";
            t.log_de(log, message, info, msg, true);
        }
        output( message );
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
