const axios = require('../utils/apiClient.js');
const Axios = require('axios');

class SmartPlugAccessory {

    constructor(log, config) {
        this.log = log;
        this.name = config["name"];
        this.plugName = config["plug_name"] || this.name;
        this.log("Starting a smart plug device with name '" + this.plugName + "'...");
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

        this.apiClient = (new axios(this.access_token, this.refresh_token, this.client_id, this.client_secret)).instance;


    }
    getPowerOn(callback) {
        var plugName = this.plugName
        this.apiClient.get("controllers/" + this.serial_number, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then(function (response) {
            var controller = response.data.controller;
            var relay_state = controller.relay_state;
            var binaryState = relay_state ? 1 : 0;
            var state = relay_state ? 'on' : 'off';
            callback(null, binaryState);
        })
    }
    setPowerOn(powerOn, callback) {

        var state = powerOn ? 'on' : 'off';
        var plugName = this.plugName
        callback(null);
        this.apiClient.post("provider/send", {
            "serial_number": this.serial_number,
            "command": "switch_on_off",
            "executor":"homebridge",
            "state": state
        }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.access_token
                }
            }).then(function (response) {
                console.log("Set power state on the '%s' to %s", plugName, state);
            })
    }


    getServices() {
        let smartPlugService = new Service.Outlet(this.name);
        smartPlugService.getCharacteristic(Characteristic.On)
            .on('get', this.getPowerOn.bind(this))
            .on('set', this.setPowerOn.bind(this));
        return [smartPlugService];
    }

}
module.exports = SmartPlugAccessory
