'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mockWeatherData = require('./data/weather.json');
const weather = require('./weather.js');
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const PORT = process.env.PORT;

// singleton
const app = express(); // what type of thing is app?
app.use(cors());

// app.get('/weather', weather);

app.get('/weather', async (request, response, next) => {

  let lat = request.query.lat;
  let lon = request.query.lon;
  if (!lat || !lon) {
    response.status(400).send('Bad Request');
  }

  try {
    // what location or query to I need to make for weatherbit API?

    // what do I send back to the client.
    let url = `https://api.weatherbit.io/v2.0/current?key=${WEATHER_API_KEY}&lat=${lat}&lon=${lon}`;
  
    let weatherResponse = await axios({
      method: "GET",
      url: url,
    });
    let weatherData = weatherResponse.data.data.map((weather) => { return new Forecast(weather) });
    response.send(weatherData);
  } catch (e) {
    console.log(e.response);

    if (e.response.data.status_code === 429) {
      let weatherData = mockWeatherData[0].data.map((weather) => {
        return new Forecast(weather);
      });
      response.status(200).send(weatherData);
    } else {
      response.status(400).send({message: 'Bad Request', error: e});
    }
  }
});

// create an object with data and description.
class Forecast {
  constructor(weather) {
    // attach to Forecast object as necessary
    this.date = weather.datetime;
    this.description = weather.weather.description;
  }
}

app.listen(PORT, () => {
  console.log('Server is running on port :' + PORT);
});
