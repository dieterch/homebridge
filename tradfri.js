/**
 * Tradfri Homebridge-MQTTThing Codec (encoder/decoder)
 * Codecs allow custom logic to be applied to accessories in mqttthing, rather like apply() functions, 
 * but in the convenience of a stand-alone JavaScript file.
 */

 'use strict';

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

/**
 * Initialise codec for accessory
 */
function init( params ) {
    // extract parameters for convenience
    let { log, config, publish, notify } = params;

    setTimeout( () => {
        let msg = `${config.name} handled in tradfri.js. ${config._ ? config._ : ''}`;
        log( msg );
        config.url = config.url ? config.url : "http://localhost:1883"
        // log( JSON.stringify(config))
        // update state
        // notify( 'on', config.onValue || 1 );
        // notify( 'brightness', 50 );
        //notify( 'HSV', '0,100,100' );
    }, 1000 );

    /**
     * Encode message before sending.
     * The output function may be called to deliver an encoded value for the property later.
     */
    function encode( message, info, output ) {
        log( `encode() called for topic [${info.topic}], property [${info.property}] with message [${message}]` );
        output( message );
    }

    /**
     * Decode received message, and optionally return decoded value.
     * The output function may be called to deliver a decoded value for the property later.
     */
    function decode( message, info, output ) { // eslint-disable-line no-unused-vars
        log( `decode() called for topic [${info.topic}], property [${info.property}] with message [${message}]` );
        output( message );
    }

    function encode_on( message, info, output ) {
        output( message );
    }

    function decode_on( message, info, output ) {
        output( message );
    }

    function encode_HSV( message ) {
        let params=message.split(",")
        let result={}
        let rgb=ScaledHSVtoRGB(params[0],params[1],100)
        let xy=rgb_to_cie(rgb.r,rgb.g,rgb.b);

        result.color={x:xy[0],y:xy[1]};
        var b=2.54*params[2];
        result.brightness=b;

        //log("encode: message: " + params + " result: " + JSON.stringify(result) + " rgb: " + JSON.stringify(rgb))
        return JSON.stringify(result);
    }

    function decode_HSV( message ) {
        return message;
    }

    function encode_ColorTemperature( message ) {
        let retval = scale_to(140,250,500,454,message);
        //log( "encode: got color_temp message: " + message  + " decoded to: " + retval );
        return JSON.stringify({"color_temp": retval})
    }

    function decode_ColorTemperature( message ) {
        let retval = scale_to(250,140,454,500,message);
        //log( "decode: got color_temp message: " + message  + " decoded to: " + retval );
        return JSON.stringify({"color_temp": retval})
    }

    function encode_brightness( message ) {
        // scale up to 0-255 range
        let retval = scale_to(0,0,100,255,message);
        //log( "encode: got brightness message: " + message + " encoded to: " + retval );
        return JSON.stringify({"brightness": retval})
    }

    function decode_brightness( message ) {
        // scale down to 0-100 range
        let retval = scale_to(0,0,255,100,message);
        //log( "decode: got brightness message: " + message + " decoded to: " + retval );
        return JSON.stringify({"brightness": retval})
    }

    /**
     * The init() function must return an object containing encode and/or decode functions as defined above.
     * To define property-specific encode/decode functions, the following syntax may be used:
     *  {
     *      properties: {
     *          targetProp1: {
     *              encode: encodeFunction1,
     *              decode: decodeFunction2
     *          },
     *          targetProp2: {
     *              encode: encodeFunction2
     *          },
     *      },
     *      encode: defaultEncodeFunction,
     *      decode: defaultDecodeFunction
     *  }
     * 
     * The default encode/decode functions are called for properties for which no property-specific
     * entry is specified.
     */
    
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
            }
        }
    };
}

// export initialisation function
module.exports = {
    init
};
