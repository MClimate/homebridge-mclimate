const axios = require('../utils/apiClient.js');
const Axios = require('axios');

class VickiAccessory {
    constructor(log, config) {
        this.log = log;
        this.name = config["name"];
        this.vickiName = config["vicki_name"] || this.name;
        this.binaryState = 0;
        this.log("Starting a Vicki with name '" + this.vickiName + "'...");
        this.serial_number = config['serial_number'];
        
        this.username = config['username'];
        this.password = config['password'];
        this.client_id = config['client_id'];
        this.client_secret = config['client_secret'];
        Axios({
            method: 'post',
            url: "https://developer-api.seemelissa.com/v1/auth/login",
            data: {
                client_id: this.client_id,
                client_secret: this.client_secret,
                username: this.username,
                password: this.password
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            var auth = response.data.auth;
            this.access_token = auth.access_token;
            this.refresh_token = auth.refresh_token;
        })

    this.apiClient = (new axios(this.access_token, this.refresh_token, this.client_id,this.client_secret)).instance;
    }

    getCurrentTemperature(callback) {
        this.apiClient.post('provider/fetch', {
            "serial_number": this.serial_number
        }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.access_token
                }
            }).then(function (response) {
                var temp = response.data.provider.temperature;
                callback(null, temp)
            })
    }
    setTargetTemperature(value, callback) {
            this.apiClient.post('provider/send', {
                "serial_number" : this.serial_number,
                "command" : "set_motor_position",
                "position" : Math.floor(value)
              }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + this.access_token
                    }
                }).then((response) => {
                    console.log("Set the Temperature on '%s' to %s", this.vickiName, value);
                })

        callback(null);
    }
    getTargetTemperature(callback) {
        this.apiClient.post('provider/fetch', {
            "serial_number": this.serial_number
        }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.access_token
                }
            }).then(function (response) {
                var displayDigits = response.data.provider.displayDigits;

                callback(null, displayDigits)
            })
    }

    getServices() {
        let vickiService = new Service.Thermostat(this.name);
        
        vickiService.getCharacteristic(Characteristic.CurrentTemperature)
            .on('get', this.getCurrentTemperature.bind(this));

        vickiService.getCharacteristic(Characteristic.TargetTemperature)
            .on('set', this.setTargetTemperature.bind(this))
            .setProps({
                minValue: 5,
                maxValue: 30
            })
            .on('get', this.getTargetTemperature.bind(this))
            
        vickiService.getCharacteristic(Characteristic.TargetHeatingCoolingState)
            .setValue(1)
            
        
        return [vickiService];
    }
}
module.exports = VickiAccessory