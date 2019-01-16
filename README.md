# homebridge-mclimate

MClimate plugin for [HomeBridge](https://github.com/nfarina/homebridge)

This repository contains the MClimate plugin for homebridge that was previously bundled in the main `homebridge` repository.

# Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-mclimate`
3. Update your configuration file. See `sample-config.json` snippet below.



## How to Setup New API

1. Go to [https://developers.seemelissa.com](https://developers.seemelissa.com)
2. Choose **Sign In**
3. Use your normal account to sign in
4. Create new OAuth Client
5. In 'OAuth Client Details' set:
* **OAuth Client name**: _HomeBridge-Mclimate_
* **Description**: _Open source project to provide HomeKit integration_
* **Support URL**: _https://github.com/MClimate/homebridge-mclimate_
* **Default OAuth redirect URL**:  _http://localhost:51826/callback_

6. Click on **Edit icon**
7. Copy the **Client ID** to your HomeBridge config as **client_Id** 
8. Copy the **Client secret** to your HomeBridge config as **client_secret**
9. Enter your **Email** and **Password** to your HomeBridge config as **username** and **password**

After that you will be **FINALLY** done. 

# Configuration

Configuration sample:

``         
        
    ...
        
        "accessories": [
            {
            "accessory": "MClimate-Melissa",
            "name": "The name of accessory",
            "serial_number": "Serial number of accessory",
            "client_id": "Client id from MClimate developers portal",
            "client_secret": "Client secret from MClimate developers portal",
            "username": "Use email from your MClimate account",
            "password": "Use password from your MClimate account"

            }
        ]

    ....
``



*  Field "accessory": Must always be "MClimate-Melissa" for Melissa device, "MClimate-SmartPlug" for Smart Plug device or "MClimate-Vicki" for your Vicki device.

