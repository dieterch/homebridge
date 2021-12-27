/**
 * automations in Homebridge-MQTTThing Codecs (encoder/decoder)
 */


'use strict';
const t = require("./tools");
const store = require("./store")

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
    constructor(params, name, topic, actions, onValue, offValue) {
        super(params);
        this.name = name;
        this.topic = topic;
        this.actions = actions;
        this.toggle_status = false;
        this.onvalue = onValue;
        this.offvalue = offValue;
    }

    toggle(info, action) {
        if (this.actions.includes(action)) {
            if (this.toggle_status) {
                this.publish(this.topic,this.onvalue);
                //this.log(`${this.name} on`);
            } else {
                this.publish(this.topic,this.offvalue);
                //this.log(`${this.name} off`);
            }
            this.toggle_status = !this.toggle_status; 
        };
    }
}

class SliderObj extends AutomationObj {
    constructor(params, name, group, upMsg, downMsg, min, max, step) {
        super(params);
        this.name = name;
        this.group = group;
        this.upMsg = upMsg;
        this.downMsg = downMsg;
        this.StartTime = 0;
        this.StopTime = 0;

        //store.load_status(this.group);

        this.brightness = 125;
        this.min = min;
        this.max = max;
        this.step = step
    }

    setBrightness(value) {
        //this.log(`${value}`)
        //this.publish(this.topic,JSON.stringify({"brightness":value}))
        this.group.forEach(item => {
            this.publish(item,JSON.stringify({"brightness":value}))
        });
        // store.store_status(this.group);
    }

    slideMsg(domsg,msg) {
        let m = (domsg == this.upMsg) ? +1 : -1;
        if ((msg == domsg+'_click') | 
            (msg == domsg+'_release')) {
            this.brightness = t.limit(this.brightness + m * this.step, this.min, this.max)
            this.setBrightness(this.brightness)
        };            
    }

    slider(info, msg) {
        if([this.upMsg+'_click',this.upMsg+'_release', 
            this.downMsg+'_click',this.downMsg+'_release'].includes(msg)) {
            //this.log(`${this.name} ${msg} called`);
            this.slideMsg(this.upMsg, msg);
            this.slideMsg(this.downMsg, msg);
            //t.testlimit(this.log,this.min,this.max)
        }
    }
}

 // export initialisation function
module.exports = {
    TimerObj,
    ToggleObj,
    SliderObj
};