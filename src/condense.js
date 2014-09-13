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
        baseUrl = 'http://api.openweathermap.org/data/2.5/weather?',
        imgUrl = 'img/',
        imgExtension = '.png';

    // set data from element
    var _set = function (element) {
        var location,
            isMetric,
            lang;

        location = element.getAttribute('data-condense-location');
        if (!location && location !== '') {
            location = {
                lat: element.getAttribute('data-condense-latitude') || 0,
                lon: element.getAttribute('data-condense-longitude') || 0
            };
        }

        lang = element.getAttribute('data-condense-language');
        if (!lang || languages.indexOf(lang) === -1) {
            lang = 'en';
        }

        isMetric = element.getAttribute('data-condense-metric') === 'true' ? true : false;

        _get({
            lang: lang,
            isMetric: isMetric,
            location: location
        }, function (response) { _insertData(element, response); });
    };

    // build url and make the request
    var _get = function (options, callback) {
        var lang = options.lang,
            units = (options.isMetric) ? 'metric' : 'imperial',
            location = options.location,
            url;

        if (location === '' && 'geolocation' in navigator) {
            // if location is undefined, get location by geolocation API
            navigator.geolocation.getCurrentPosition(function(position) {
                // make the request based on the geolocation
                location = 'lat=' + position.coords.latitude + '&' + 'lon=' + position.coords.longitude;
                url = baseUrl + location + '&lang=' + lang + '&units=' + units;
                _request(encodeURI(url), callback);
            });
        } else {
            // make the request based on the location set in the options object
            location = _getLocationURI(location);
            url = baseUrl + location + '&lang=' + lang + '&units=' + units;
            _request(encodeURI(url), callback);
        }
    };

    // build location parameter
    var _getLocationURI = function (location) {

        // if location is an object, take latitude and longitude
        if (typeof location === 'object'){
            return 'lat=' + location.lat + '&lon=' + location.lon;
        }

        // if location is string, take it as a city
        if (typeof location === 'string') {
            return 'q=' + location;
        }
    };

    // get wind direction according to degrees
    var _getWindDirection = function (deg) {
        var index = Math.round(deg/45);
        return windDirections[index] || 'N';
    };

    // request data
    var _request = function (url, callback){
        var xmr;

        if (window.XMLHttpRequest) {
            xmr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            xmr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmr.onreadystatechange = function () {
            if (xmr.readyState == 4){
                var response = xmr.responseText;
                if (typeof callback == 'function') {
                    callback(JSON.parse(response));
                }
            }
        };
        xmr.open('GET', url, true);
        xmr.send(null);
    };

    // parse response obj in a single data
    var _parseInfo =  function (obj) {
        if (obj.cod === 200) {
            return {
                data: {
                    temperature: Math.round(obj.main.temp),
                    /*jshint camelcase: false */
                    min: Math.round(obj.main.temp_min),
                    max: Math.round(obj.main.temp_max),
                    /*jshint camelcase: true */
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
            throw 'The place you request could not be found';
        }
    };

    // data binding
    var _insertData = function (element, obj) {
        obj = _parseInfo(obj);
        for (var key in obj.data) {
            var selector = '[data-condense-' + key + ']',
                dataElement = element.querySelector(selector);
            if (dataElement) {
                dataElement.innerHTML = obj.data[key];
            }
        }

        var img = element.querySelector('[data-condense-icon]');
        if (img) {
            img.src = obj.imageSrc;
        }
    };

    // return constructor
    var _factory = function () {};
    _factory.prototype.set = _set;

    return _factory;
});
