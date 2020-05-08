const axios = require('../utils/apiClient.js');
const Axios = require('axios');

class BobbieAccessory {

    constructor(log, config) {
        this.log = log;
        this.name = config["name"];
        this.bobbieName = config["bobbie_name"] || this.name;
        this.log("Starting a Bobbie with name '" + this.bobbieName + "'...");
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
            this.apiClient = (new axios(this.access_token, this.refresh_token, this.client_id, this.client_secret)).instance;

        })

    }
    getPowerOn(callback) {
        this.apiClient.post('provider/fetch', {
            "serial_number": this.serial_number,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then((response) => {
            var provider = response.data.provider;
            var relay_state = provider.relay_state;
            var binaryState = relay_state == 1 || relay_state == 17 ? 1 : 0;
            callback(null, binaryState);
        })
    }
    setPowerOn(powerOn, callback) {

        var state = powerOn ? 'on' : 'off';
        var bobbieName = this.bobbieName
        callback(null);
        this.apiClient.post("provider/send", {
            "serial_number": this.serial_number,
            "executor": "homebridge",
            "command": "switch_on_off",
            "state": state
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then(function(response) {
            console.log("Set power state on the '%s' to %s", bobbieName, state);
        })
    }


    getServices() {
        let bobbieService = new Service.Outlet(this.name);
        bobbieService.getCharacteristic(Characteristic.On)
            .on('get', this.getPowerOn.bind(this))
            .on('set', this.setPowerOn.bind(this));
        return [bobbieService];
    }

}
module.exports = BobbieAccessory