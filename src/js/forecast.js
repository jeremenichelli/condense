(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return factory(root);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        root.Condense = factory(root);
    }
})(this, function (el) {

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
        windDirections = {},
        baseUrl = 'http://api.openweathermap.org/data/2.5/weather?'
        imgUrl = 'images/condense/';

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
            lang = 'en'
        };

        isMetric = element.getAttribute('data-condense-metric') === 'true' ? true : false;

        _get({
            lang: lang,
            isMetric: isMetric,
            location: location
        }, function (r) { console.log(r) });
    };

    var _get = function (options, callback) {
        var lang = options.lang,
            units = (options.isMetric) ? 'metric' : 'imperial',
            location = (options.location === '') ? '' : _getLocationURI(options.location),
            url;

        if (languages.indexOf(lang) === -1) {
            throw 'Language not supported';
            return;
        };

        if (location === '') {
            // if location is undefined, get location by geolocation API
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    // make the request based on the geolocation
                    location = 'lat=' + position.coords.latitude + '&' + 'lon=' + position.coords.longitude;
                    url = baseUrl + location + '&lang=' + lang + '&units=' + units;
                    _request(encodeURI(url), callback);
                });
            } else {
                throw 'Sorry, we couldn\'t determinate your location';
                return;
            }
        } else {
            // make the request based on the location set in the options object
            url = baseUrl + location + '&lang=' + lang + '&units=' + units;
            _request(encodeURI(url), callback);
        };
    };

    var _getLocationURI = function (location) {
        var lat,
            lon;

        // if location is an object, take latitude and longitude
        if (typeof location === 'object'){
            return 'lat=' + location.lat + '&' + 'lon=' + location.lon;
        };

        // if location is string, take it as a city
        if (typeof location === 'string') {
            return 'q=' + location;
        }
    };
    

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
        }
        xmr.open('GET', url, true);
        xmr.send(null);
    };

    return {
        set: _set
    }
});

var w = document.getElementById('sample');
Condense.set(w);
