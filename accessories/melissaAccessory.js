const axios = require('../utils/apiClient.js');
const Axios = require('axios');

class MelissaAccessory {
    constructor(log, config) {
        this.log = log;
        this.name = config["name"];
        this.melissaName = config["melissa_name"] || this.name;
        this.binaryState = 0;
        this.log("Starting a Melissa with name '" + this.melissaName + "'...");
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
            }).then((response) => {
                var temp = response.data.provider.temp;
                this.humidity = response.data.provider.humidity;
                callback(null, temp)
            })
    }
    getCurrentRelativeHumidity (callback){
        callback(null,this.humidity);
    }
    setTargetTemperature(value, callback) {
        this.apiClient.get('controllers/' + this.serial_number, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.access_token,
                'Accept-Response': 'Advanced'
            }
        }).then((response) => {
            var controller = response.data.controller;
            var command_log = controller._relation.command_log;
            var state = command_log.state;
            var mode = command_log.mode;
            var fan = command_log.fan;
            this.apiClient.post('provider/send', {
                "serial_number": this.serial_number,
                "command": "send_ir_code",
                "executor":"homebridge",
                "state": state,
                "mode": mode,
                "temp": value,
                "fan": fan
            }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + this.access_token
                    }
                }).then((response) => {


                    console.log("Set the Temperature on '%s' to %s", this.melissaName, value);
                })
        })
        callback(null);
    }
    getTargetTemperature(callback) {
        this.apiClient.get('controllers/' + this.serial_number, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.access_token

            }
        }).then((response) => {
            var controller = response.data.controller;
            var command_log = controller._relation.command_log;
            var temp = command_log.temp;
            callback(null, temp);
        })
    }
    setTargetHeatingCoolingState(value, callback) {
        this.apiClient.get('controllers/' + this.serial_number, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.access_token,
                'Accept-Response': 'Advanced'
            }
        }).then((response) => {
            var controller = response.data.controller;
            var command_log = controller._relation.command_log;
            var state = command_log.state;
            var temp = command_log.temp;
            var fan = command_log.fan;
            var mode = command_log.mode;
            if (value == 0) {
                state = 0;
            } else {
                switch (value) {
                    case 3:
                        mode = 0;
                        break;
                    case 1:
                        mode = 2;
                        break;
                    case 2:
                        mode = 3;
                        break;
                    default:
                        mode = 0;
                }
                if (state == 1) {
                    //state = 2; // - idle
                    state = 1;
                } else if (state == 0) {
                    state = 1;
                }
            }
            this.apiClient.post('provider/send', {
                "serial_number": this.serial_number,
                "command": "send_ir_code",
                "executor":"homebridge",
                "state": state,
                "mode": mode,
                "temp": temp,
                "fan": fan
            }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + this.access_token
                    }
                }).then((response) => {
                    console.log("Set the mode on '%s' to %s", this.melissaName, value);
                })
        });
        callback(null);
    }
    getTargetHeatingCoolingState(callback) {
        this.apiClient.get('controllers/' + this.serial_number, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.access_token,
                'Accept-Response': 'Advanced'
            }
        }).then((response) => {
            var controller = response.data.controller;
            var command_log = controller._relation.command_log;
            var mode = command_log.mode;
            var state = command_log.state;
            var modeForCallback;
            if (state == 0) {
                modeForCallback = 0;
            } else {
                switch (mode) {
                    case 0:
                        modeForCallback = 3;
                        break;
                    case 2:
                        modeForCallback = 1;
                        break;
                    case 3:
                        modeForCallback = 2;
                        break;
                    default:
                        modeForCallback = 0;
                }
            }
            callback(null, modeForCallback);
        })
    }

    getServices() {
        let melissaService = new Service.Thermostat(this.name);

        melissaService.getCharacteristic(Characteristic.CurrentTemperature)
            .on('get', this.getCurrentTemperature.bind(this));

        melissaService.getCharacteristic(Characteristic.CurrentRelativeHumidity)
            .on('get', this.getCurrentRelativeHumidity.bind(this));

        melissaService.getCharacteristic(Characteristic.TargetTemperature)
            .on('set', this.setTargetTemperature.bind(this))
            .setProps({
                minValue: 16,
                maxValue: 30
            })
            .on('get', this.getTargetTemperature.bind(this))

        melissaService.getCharacteristic(Characteristic.TargetHeatingCoolingState)
            .on('set', this.setTargetHeatingCoolingState.bind(this))
            .on('get', this.getTargetHeatingCoolingState.bind(this))
        return [melissaService];
    }
}
module.exports = MelissaAccessory