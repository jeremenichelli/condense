condense
========

Weather widget manager based on OpenWeatherMap API for current forecast. Everything in Condense is controlled by the base template you write to make everything easy and more configurable while keeping your code clean.

You can search for the weather now by city, coordinates or ask for user geoposition, choose language, metrics and which content to display all just putting some attributes on your markup.


### Base template

First thing you need to do is to prepare the markup that will manage everything before you set the widget. As you see below every decision is taken by placing attributes. To see cities, langauges and units available go to <a href="www.openweathermap.org/api" target="_blank">OpenWeatherMap API documentation</a>.

```html
<div id="weather-widget" data-condense-location="barcelona spain"
     data-condense-language="es" data-condense-units="metric">
    <!-- inner template -->
</div>
```

#### Search using coordinates

```html
<div id="weather-widget" data-condense-latitude="41.38" data-condense-longitude="2.17"
     data-condense-language="es" data-condense-units="metric">
    <!-- inner template -->
</div>
```

#### Ask for location

If you don't specify the location the widget will ask the user to share the location.

```html
<div id="weather-widget" data-condense-language="en" data-condense-units="imperial">
    <!-- inner template -->
</div>
```


### Widget content

Inside the template you can combine all the data you want, the way you want. For example if you want to show just the temperature and the city name you put this inside the template:

```html
<div id="weather-widget" data-condense-location="amsterdam nl"
     data-condense-language="nl" data-condense-units="imperial">
    <p class="city" data-condense-city></p>
    <p class="temperature">
        <span data-condense-temperature></span>º
    </p>
</div>
```

You can also put an image. Inside the scripts you can change the path and the image extension file, the image name will be the weather code provided by <a href="www.openweathermap.org/api" target="_blank">OpenWeatherMap API</a> so you can check it out there, for example **10n** is light rain at night.

```html
<div id="weather-widget" data-condense-location="paris france"
     data-condense-language="fr" data-condense-units="metric">
    <h2 data-condense-city></h2>
    <h3 data-condense-country></h3>
    <img data-condense-icon alt="weather icon">
    <p data-condense-description></p>
</div>
```

Here's all the data you can put inside your widget:

- temperature: ```data-condense-temperature```
- min temp: ```data-condense-min```
- max temp: ```data-condense-max```
- pressure: ```data-condense-pressure```
- humidity: ```data-condense-humidity```
- city: ```data-condense-city```
- country: ```data-condense-country```
- description: ```data-condense-description```
- weather code: ```data-condense-code```
- wind speed: ```data-condense-windSpeed```
- wind direction: ```data-condense-windDirection```


### JavaScript

Of course you need to include condense in your script, then you can create the widget:

```js
var newWidget = new Condense();
newWidget.set(document.getElementById('weather-widget'));
```

When you set a new widget you need to pass an HTML element or the script will throw an error. You can also pass a success and a fail function to the set method like this:

```js
var template = document.getElementById('weather-widget'),
    newWidget = new Condense();

function onSuccess () {
    alert('Weather found!');
}

function onError (err) {
    alert(err);
    template.style.display = 'none';
}

newWidget.set(template, onSuccess, onError);
```

### Contribution

If you see something that's not working or could be done better just create an issuee.

Have fun with it!

