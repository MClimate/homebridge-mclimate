const axios = require('axios');

var MelissaAccessory = require('./accessories/melissaAccessory');
var SmartPlugAccessory = require('./accessories/smartPlugAccessory');
var VickiAccessory = require('./accessories/vickiAccessory');
var BobbieAccessory = require('./accessories/bobbieAccessory');

module.exports = function(homebridge) {
    global.Service = homebridge.hap.Service;
    global.Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-mclimate", "MClimate-Melissa", MelissaAccessory);
    homebridge.registerAccessory("homebridge-mclimate", "MClimate-SmartPlug", SmartPlugAccessory);
    homebridge.registerAccessory("homebridge-mclimate", "MClimate-Vicki", VickiAccessory);
    homebridge.registerAccessory("homebridge-mclimate", "MClimate-Bobbie", BobbieAccessory);

}