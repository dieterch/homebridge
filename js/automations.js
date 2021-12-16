/**
 * automations in Homebridge-MQTTThing Codecs (encoder/decoder)
 */

 'use strict';

class Automation {
    constructor(params) {
        this.log = params.log;
        this.config = params.config;
        this.publish = params.publish;
        this.notify = params.notify;
    }
}

class Timerobj extends Automation{
    constructor(params, name, topic, onvalue, offvalue, period) {
        super(params);
        this.topic = topic;
        this.onvalue = onvalue;
        this.offvalue = offvalue;
        this.timercount = 0;
        this.period = period || 10;
        this.log(`timer ${name} with period ${this.period} sec.`)
    }

    timer(info) {
        if (this.timercount <= 0) {
                this.publish(this.topic,this.onvalue)
                this.log(`${info.topic}, set ${this.topic} to ${this.onvalue}`)
            }
            this.timercount +=1
            //this.log(`${info.topic} counter = ${this.timercount}`)
            setTimeout( () => {
                this.timercount -=1;
                //this.log(`${info.topic} counter = ${this.timercount}`)
                if (this.timercount <= 0) {
                    this.publish(this.topic,this.offvalue)
                    this.log(`${info.topic}, set ${this.topic} to ${this.offvalue}`)
                }
            }, 1000 * parseInt(this.period) );
        }
}

 // export initialisation function
module.exports = {
    Timerobj
};