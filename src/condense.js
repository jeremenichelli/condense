(function(root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return factory(root);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        root.Condense = factory(root);
    }
})(this, function () {
    'use strict';

    // set jabiru config
    jabiru.toGlobal();
    jabiru.name('condense_callback');
    jabiru.query('&callback');

    // Supported languages
    // en : English
    // ru: Russian
    // it: Italian
    // es/sp: Spanish
    // uk/ua: Ukranian
    // de: German
    // pt: Portuguese
    // ro: Romanian
    // pl: Polish
    // fi: Finnish
    // nl: Dutch
    // fr: French
    // bg: Bulgarian
    // sv/se: Swidish
    // zh_tw: Chinese Traditional
    // zh/zh_cn: Chinese Simplified
    // tr: Turkish
    // ca: Catalan
    
    var languages = [ 'en', 'ru', 'it', 'es', 'sp', 'uk', 'ua', 'de', 'pt', 'ro', 'pl', 'fi', 'nl', 'fr', 'bg', 'sv',
        'se', 'zh_tw', 'zh', 'zh_cn', 'tr', 'ca' ],
        windDirections = [ 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW' ],
        units = [ 'metric', 'imperial' ],
        baseUrl = 'http://api.openweathermap.org/data/2.5/weather?',
        imgUrl = 'img/',
        imgExtension = '.png';

    var Condense = function () {
        this.rawData = null;
        this.isSet = false;
        this.hasMessageBox = false;
    };

    Condense.prototype = {
        // set widget from element with an optional callback
        set : function (element, onload) {
            var widget = this;

            if (widget.isSet) {
                console.error('The widget is already set');
                return;
            }

            if (element) {
                widget.messageBox = element.querySelector('[data-condense-message]');
                if (widget.messageBox) {
                    widget.hasMessageBox = true;
                }
                widget.element = element;
                widget.onload = onload;
                widget.get();
            } else {
                console.error('You must specify an HTML Element to build the widget');
                return;
            }
        },
        // get attributes from element and build request url
        get : function () {
            // get attributes
            var widget = this,
                element = widget.element,
                location = element.getAttribute('data-condense-location'),
                latitude = element.getAttribute('data-condense-latitude'),
                longitude = element.getAttribute('data-condense-longitude'),
                lang = element.getAttribute('data-condense-language'),
                units = element.getAttribute('data-condense-units'),
                locationURI,
                languageURI,
                unitsURI;

            if (latitude && longitude) {
                location = {
                    lat: latitude,
                    lon: longitude
                };
            }

            widget.showMessage('Setting data and location');

            // get location uri
            locationURI = _getLocationURI(location);
            languageURI = _getLanguageURI(lang);
            unitsURI = _getUnitsURI(units);

            // if location is not defined use geolocation
            if (!location) {
                if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        // build url with geolocation
                        widget.url = baseUrl + '&lat=' + position.coords.latitude + '&lon=' +
                            position.coords.longitude + languageURI + unitsURI;
                        // make request
                        widget.request();
                    });
                }
            } else {
                // build url
                widget.url = baseUrl + locationURI + languageURI + unitsURI;
                // make request
                widget.request();
            }
        },
        // make request
        request : function () {
            var widget = this,
                url = encodeURI(widget.url);

            widget.showMessage('Looking for the weather');

            // use jabiru for API call
            jabiru.get(url, function (data) {
                widget.isSet = true;
                widget.rawData = data;
                widget.insertData();
            });
        },
        // find condense data elements and bind info
        insertData : function () {
            var widget = this,
                obj = widget.rawData,
                element = widget.element,
                onload = widget.onload;

            // parse info for data binding
            obj = _parseInfo(obj, widget);

            // data binding
            for (var key in obj.data) {
                var selector = '[data-condense-' + key + ']',
                    dataElement = element.querySelector(selector);
                if (dataElement) {
                    dataElement.innerHTML = obj.data[key];
                }
            }

            var img = element.querySelector('[data-condense-icon]');
            
            // checks if needs to fire a callback after loading the widget
            if (onload) {
                if (img) {
                    // bind onload event to the img onload one
                    img.onload = onload;
                } else {
                    onload();
                }
            }

            if (img) {
                img.src = obj.imageSrc;
            }

            widget.rawData = null;
        },
        showMessage : function (msg) {
            if (this.hasMessageBox && typeof msg === 'string') {
                this.messageBox.innerHTML = msg;
            }
        }
    };

    // build location parameter
    var _getLocationURI = function (location) {
        // if location is an object, take latitude and longitude
        if (location && typeof location === 'object'){
            return '&lat=' + location.lat + '&lon=' + location.lon;
        }
        // if location is not set ask to geolocation API
        if (location) {
            return '&q=' + location;
        }
    };

    // build language parameter
    var _getLanguageURI = function (l) {
        if (!l || languages.indexOf(l) === -1) {
            return '&lang=en';
        } else {
            return '&lang=' + l;
        }
    };

    // build units parameter
    var _getUnitsURI = function (u) {
        if (!u || units.indexOf(u) === -1) {
            return '';
        } else {
            return '&units=' + u;
        }
    };

    // get wind direction according to degrees
    var _getWindDirection = function (deg) {
        var index = Math.round(deg/45);
        return windDirections[index] || 'N';
    };

    // parse response obj in a single data structure
    var _parseInfo =  function (obj, widget) {
        if (obj.cod === 200) {
            return {
                data: {
                    temperature: Math.round(obj.main.temp),
                    /* jshint camelcase: false */
                    min: Math.round(obj.main.temp_min),
                    max: Math.round(obj.main.temp_max),
                    /* jshint camelcase: true */
                    pressure: obj.main.pressure,
                    humidity: obj.main.humidity,
                    city: obj.name,
                    country: obj.sys.country,
                    description: obj.weather[0].description,
                    code: obj.weather[0].id,
                    windSpeed: obj.wind.speed,
                    windDirection: _getWindDirection(obj.wind.deg)
                },
                imageSrc: imgUrl + obj.weather[0].icon + imgExtension
            };
        } else {
            widget.showMessage(obj.message);
        }
    };

    // return constructor
    return Condense;
});
