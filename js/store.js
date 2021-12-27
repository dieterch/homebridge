/**
 * store and restore itemvalues
 */

 'use strict';

function load_status(group) {
    group.forEach(element => {
        console.log('load status:', element);
    });
}

function store_status(group) {
    group.forEach(element => {
        console.log('store status:', element);
    });
}

// export initialisation function
module.exports = {
    load_status,
    store_status
};