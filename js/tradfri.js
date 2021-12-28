/**
 * Tradfri Homebridge-MQTTThing Codec (encoder/decoder)
 * Codecs allow custom logic to be applied to accessories in mqttthing, rather like apply() functions, 
 * but in the convenience of a stand-alone JavaScript file.
 */

 'use strict';
 const t = require("./tools");
 const a = require("./automations");

/**
 * Initialise codec for accessory
 * Ikea Button-Actions
    [
    "toogle",
    "toogle_hold",
    "toogle_release",
    "brightness_up_click",
    "brightness_up_hold",
    "brightness_up_release",
    "brightness_down_click",
    "brightness_down_hold",
    "brightness_down_release",
    "arrow_left_click",
    "arrow_left_hold",
    "arrow_left_release",
    "arrow_right_click",
    "arrow_right_hold",
    "arrow_right_release"
    ]
*/

function init( params ) {
    // extract parameters for convenience
    let { log, config, publish, notify } = params;

    //setTimeout( () => {
    let msg = `--> tradfri.js. ${config._ ? config._ : ''}`;
    log( msg );
    config.url = config.url ? config.url : "http://localhost:1883"; // default MQTT server is localhost
    
    const Christbaum = new a.ToggleObj(
        params,
        "Christbaum",
        "shellies/shellyplug-s-6A6374/relay/0/command",
        ["arrow_left_click"],
        "on",
        "off")

    const LichterKette = new a.ToggleObj(
        params,
        "LichterKette",
        "zwave/Lichterkette/37/0/targetValue/set",
        ["arrow_right_click"],
        "true",
        "false")

    const Wohnzimmer_Wandschalter1 = new a.ToggleObj(
        params,
        "Wohnzimmer_Wandschalter1",
        "zwave/Wandschalter1/37/1/targetValue/set",
        ["toggle"],
        "true",
        "false")

    const WZLichtGroup = 
        ["zigbee2mqtt/Wohnzimmer1/setBrightness",
        "zigbee2mqtt/Wohnzimmer2/setBrightness",
        "zigbee2mqtt/Wohnzimmer3/setBrightness"];

    const WZ_Decken_Slider = new a.SliderObj(
        params,
        "WZ_Decken_Slider",
        WZLichtGroup,
        //["zigbee2mqtt/Wohnzimmer1/setBrightness"],
        "brightness_up",
        "brightness_down",
        0,
        255,
        20)

    const Esszimmer_Wandschalter = new a.ToggleObj(
        params,
        "Esszimmer_Wandschalter",
        "shellies/shelly1-32CE66/relay/0/command",
        ["toggle"],
        "on",
        "off")

        const EZLichtGroup = 
        ["zigbee2mqtt/Esszimmer1/setBrightness",
        "zigbee2mqtt/Esszimmer2/setBrightness",
        "zigbee2mqtt/Esszimmer3/setBrightness",
        "zigbee2mqtt/Esszimmer4/setBrightness",
        "zigbee2mqtt/Esszimmer5/setBrightness"];

    const EZ_Decken_Slider = new a.SliderObj(
        params,
        "EZ_Decken_Slider",
        EZLichtGroup,
        "brightness_up",
        "brightness_down",
        0,
        255,
        20)
        //}, 1000 );

    /**
     * Encode message before sending.
     * The output function may be called to deliver an encoded value for the property later.
     */
    function encode( message, info, output ) {
        /*
        The encode() function is called to encode 
        a message before publishing it to MQTT. 
        
        It is passed three parameters:

        message is the message to be encoded

        info is an object holding:
            info.topic      -   the MQTT topic to be published
            info.property   -   the property associated with the 
                                publishing operation
        
        output is a function which may be called to deliver
        the encoded value asynchronously
        The encode() function may either 
        return the encoded message, or it may 
        deliver it asynchronously by passing 
        it as a parameter to the provided 
        output function. It if does neither, 
        no value will be published.
        */
        t.log_en(log, message, info, message);
        output( message );
    }

    /**
     * Decode received message, and optionally return decoded value.
     * The output function may be called to deliver a decoded value for the property later.
     */
    function decode( message, info, output ) { // eslint-disable-line no-unused-vars
        /*
            The decode() function is called to decode a 
            message received from MQTT before passing 
            it for processing by MQTT-Thing. 
            It takes three parameters:

            message is the message to be decoded

            info is an object holding:
                info.topic - the MQTT topic received
                info.property the property associated 
                with the received message
            
            output is a function which may be called 
            to deliver the decoded value asynchronously
            
            The decode() function may either return the 
            decoded message, or it may deliver it asynchronously 
            by passing it as a parameter to the provided 
            output function. If it does neither, no 
            notification will be passed on to MQTT-Thing.
        */
        t.log_de(log, message, info, message)
        output(message);
    }

    function decode_Switch( message, info, output ) {
        t.log_de(log, message, info, message)
        let msg = JSON.parse(message)
        // log(`msg = ${msg}, message = ${message}`)
        if (info.topic == "zigbee2mqtt/IkeaSchalter1") {
            if (Christbaum) { Christbaum.toggle(info, msg.action); }
            if (LichterKette) { LichterKette.toggle(info,msg.action); }
            if (Wohnzimmer_Wandschalter1) { Wohnzimmer_Wandschalter1.toggle(info,msg.action); }
            if (WZ_Decken_Slider) { WZ_Decken_Slider.slider(info,msg.action) };
        };
        if (info.topic == "zigbee2mqtt/IkeaSchalter2") {
            if (Esszimmer_Wandschalter) { Esszimmer_Wandschalter.toggle(info, msg.action); }
            if (EZ_Decken_Slider) { EZ_Decken_Slider.slider(info,msg.action) };
        };
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
        let result={}
        let rgb=t.ScaledHSVtoRGB(params[0],params[1],100)
        let xy=t.rgb_to_cie(rgb.r,rgb.g,rgb.b);

        result.color={x:xy[0],y:xy[1]};
        var b=2.54*params[2];
        result.brightness=b;

        t.log_en(log, message, info, result);
        return JSON.stringify(result);
    }

    function decode_HSV( message, info ) {
        t.log_de(log, message, info, message)
        return message;
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
        }
    };
}

// export initialisation function
module.exports = {
    init
};
