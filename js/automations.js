/**
 * automations in Homebridge-MQTTThing Codecs (encoder/decoder)
 */

 'use strict';

class AutomationObj {
    constructor(params) {
        this.log = params.log;
        this.config = params.config;
        this.publish = params.publish;
        this.notify = params.notify;
    }
}

class TimerObj extends AutomationObj {
    constructor(params, name, topic, onValue, offValue) {
        super(params);
        this.topic = topic;
        this.onvalue = onValue;
        this.offvalue = offValue;
        this.timercount = 0;
        this.period = this.config.period || 10;
        //this.log(`timer ${name} with period ${this.period} sec.`)
    }

    timer(info) {
        if (this.timercount <= 0) {
                this.publish(this.topic,this.onvalue)
                //this.log(`${info.topic}, set ${this.topic} to ${this.onvalue}`);
                //this.log(`timer ${this.period} sec. started.`)
            }
            this.timercount +=1
            //this.log(`${info.topic} counter = ${this.timercount}`)
            setTimeout( () => {
                this.timercount -=1;
                //this.log(`${info.topic} counter = ${this.timercount}`)
                if (this.timercount <= 0) {
                    this.publish(this.topic,this.offvalue)
                    //this.log(`${info.topic}, set ${this.topic} to ${this.offvalue}`)
                }
            }, 1000 * parseInt(this.period) );
        }
}

class ToggleObj extends AutomationObj {
    constructor(params, name, topic, onValue, offValue) {
        super(params);
        this.name = name;
        this.topic = topic;
        this.toggle_status = false;
        this.onvalue = onValue;
        this.offvalue = offValue;
    }

    toggle(info) {
        if (this.toggle_status) {
            this.publish(this.topic,this.onvalue);
            //this.log(`${this.name} on`);
        } else {
            this.publish(this.topic,this.offvalue);
            //this.log(`${this.name} off`);
        }
        this.toggle_status = !this.toggle_status 
    }
}

 // export initialisation function
module.exports = {
    TimerObj,
    ToggleObj
};