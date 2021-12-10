/**
 * Tradfri Homebridge-MQTTThing Codec (encoder/decoder)
 * Codecs allow custom logic to be applied to accessories in mqttthing, rather like apply() functions, 
 * but in the convenience of a stand-alone JavaScript file.
 */

 'use strict';


 /**
  * Functions to enable HUE HSV compatibility for Tradfri XY color lightbulbs
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

function ScaledHSVtoRGB(r,a,e){
    return HSVtoRGB(r/360,a/100,e/100)}

function rgb_to_cie(r,a,e){
    var t=.664511*(r=r>.04045?Math.pow((r+.055)/1.055,2.4):r/12.92)+.154324*(a=a>.04045?Math.pow((a+.055)/1.055,2.4):a/12.92)+.162028*(e=e>.04045?Math.pow((e+.055)/1.055,2.4):e/12.92),s=.283881*r+.668433*a+.047685*e,o=88e-6*r+.07231*a+.986039*e,b=(t/(t+s+o)).toFixed(4),c=(s/(t+s+o)).toFixed(4);
    return isNaN(b)&&(b=0),isNaN(c)&&(c=0),[b,c]}


/**
 * Initialise codec for accessory
 * @param {object} params Initialisation parameters object
 * @param {function} params.log Logging function
 * @param {object} params.config Configuration
 * @param {function} params.publish Function to publish a message directly to MQTT
 * @param {function} params.notify Function to send MQTT-Thing a property notification
 * @return {object} Encode and/or decode functions
 */
function init( params ) {
    // extract parameters for convenience
    let { log, config, publish, notify } = params;

    setTimeout( () => {
        let msg = `Hello from tradfri.js. This is ${config.name}.`;
        log( msg );

        // update state
        // notify( 'on', config.onValue || 1 );
        // notify( 'brightness', 50 );
        //notify( 'HSV', '0,100,100' );
    }, 1000 );

    /**
     * Encode message before sending.
     * The output function may be called to deliver an encoded value for the property later.
     * @param {string} message Message from mqttthing to be published to MQTT
     * @param {object} info Object giving contextual information
     * @param {string} info.topic MQTT topic to be published
     * @param {string} info.property Property associated with publishing operation
     * @param {function} output Function which may be called to deliver the encoded value asynchronously
     * @returns {string} Processed message (optionally)
     */
    function encode( message, info, output ) {
        //log( `encode() called for topic [${info.topic}], property [${info.property}] with message [${message}]` );
        // just log and forward message
        output( message );
        //return 'encode: finished'
    }

    /**
     * Decode received message, and optionally return decoded value.
     * The output function may be called to deliver a decoded value for the property later.
     * @param {string} message Message received from MQTT
     * @param {object} info Object giving contextual information
     * @param {string} info.topic MQTT topic received
     * @param {string} info.property Property associated with subscription
     * @param {function} output Function which may be called to deliver the decoded value asynchronously
     * @returns {string} Processed message (optionally)
     */
    function decode( message, info, output ) { // eslint-disable-line no-unused-vars
        //log( `decode() called for topic [${info.topic}], property [${info.property}] with message [${message}]` );
        //console.log('decode, info:',info,'message:',message)
        // just log and forward message
        output( message );
        //return 'decode: finished'
    }

    function encode_HSV( message ) {
        var params=message.split(","),result={},rgb=ScaledHSVtoRGB(params[0],params[1],100),xy=rgb_to_cie(rgb.r,rgb.g,rgb.b);
        result.color={x:xy[0],y:xy[1]};
        var b=2.54*params[2];
        result.brightness=b;
        return JSON.stringify(result);
    }

    function decode_HSV( message ) {
        var params=message.split(","),result={},rgb=ScaledHSVtoRGB(params[0],params[1],100),xy=rgb_to_cie(rgb.r,rgb.g,rgb.b);
        result.color={x:xy[0],y:xy[1]};
        var b=2.54*params[2];
        result.brightness=b;
        return JSON.stringify(result);
    }

    function encode_brightness( message ) {
        // scale up to 0-255 range
        // log( "encode: brightness out: " + message );
        return JSON.stringify({"brightness": Math.round( message * 254/100 )})
    }

    function decode_brightness( message ) {
        // scale down to 0-100 range
        // log( "decode: brightness in: " + message );
        return JSON.stringify({"brightness": Math.round( message * 254/100 )})
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
            brightness: { // encode/decode functions for brightness property
                encode: encode_brightness,
                decode: decode_brightness
            },
            HSV: {
                encode: encode_HSV,
                decode: decode_HSV
            }
        }
    };
}

// export initialisation function
module.exports = {
    init
};
