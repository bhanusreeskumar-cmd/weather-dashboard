import { useEffect, useState } from 'react'
import './App.css'

export default function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [unit, setUnit] = useState('metric')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY

  const unitSymbol = unit === 'metric' ? '°C' : '°F'
  const windUnit = unit === 'metric' ? 'm/s' : 'mph'

  async function fetchWeather(searchCity) {
    if (searchCity.trim() === '') return

    try {
      setLoading(true)
      setError('')

      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}&units=${unit}`
      )

      if (!weatherResponse.ok) {
        throw new Error('City not found')
      }

      const weatherData = await weatherResponse.json()
      setWeather(weatherData)

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&appid=${API_KEY}&units=${unit}`
      )

      if (!forecastResponse.ok) {
        throw new Error('Could not fetch forecast')
      }

      const forecastData = await forecastResponse.json()

      const fiveDayForecast = forecastData.list
        .filter(item => item.dt_txt.includes('12:00:00'))
        .slice(0, 5)

      setForecast(fiveDayForecast)
      localStorage.setItem('lastCity', searchCity)
    } catch (err) {
      setError(err.message)
      setWeather(null)
      setForecast([])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    fetchWeather(city)
  }

  function toggleUnit() {
    setUnit(unit === 'metric' ? 'imperial' : 'metric')
  }

  useEffect(() => {
    const lastCity = localStorage.getItem('lastCity')

    if (lastCity) {
      setCity(lastCity)
      fetchWeather(lastCity)
    }
  }, [unit])

  return (
    <main
      className={
        darkMode
          ? 'min-h-screen bg-black text-white p-5'
          : 'min-h-screen bg-white text-black p-5'
      }
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4">
          Weather Dashboard
        </h1>

        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={event => setCity(event.target.value)}
            className="border p-2 rounded w-full text-black"
          />

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded mt-2 w-full"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={toggleUnit}
            className="border p-2 rounded"
          >
            Show in {unit === 'metric' ? 'Fahrenheit' : 'Celsius'}
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="border p-2 rounded"
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {loading && (
          <p className="bg-yellow-100 text-black p-3 rounded mb-4">
            Loading weather...
          </p>
        )}

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </p>
        )}

        {weather && !loading && (
          <section className="border p-4 rounded mb-6">
            <h2 className="text-2xl font-bold">{weather.name}</h2>

            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />

            <p className="capitalize">
              {weather.weather[0].description}
            </p>

            <div className="flex flex-wrap gap-3 mt-4">
              <div className="border p-3 rounded">
                <p>Temperature</p>
                <p className="font-bold">
                  {Math.round(weather.main.temp)}
                  {unitSymbol}
                </p>
              </div>

              <div className="border p-3 rounded">
                <p>Humidity</p>
                <p className="font-bold">
                  {weather.main.humidity}%
                </p>
              </div>

              <div className="border p-3 rounded">
                <p>Wind Speed</p>
                <p className="font-bold">
                  {weather.wind.speed} {windUnit}
                </p>
              </div>

              <div className="border p-3 rounded">
                <p>Condition</p>
                <p className="font-bold">
                  {weather.weather[0].main}
                </p>
              </div>
            </div>
          </section>
        )}

        {forecast.length > 0 && !loading && (
          <section>
            <h2 className="text-2xl font-bold mb-3">
              5-Day Forecast
            </h2>

            <div className="flex flex-wrap gap-4">
              {forecast.map(day => (
                <div
                  key={day.dt}
                  className="border p-3 rounded w-full sm:w-40 text-center"
                >
                  <p className="font-bold">
                    {new Date(day.dt_txt).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>

                  <img
                    className="mx-auto"
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt={day.weather[0].description}
                  />

                  <p className="capitalize">
                    {day.weather[0].description}
                  </p>

                  <p>
                    High: {Math.round(day.main.temp_max)}
                    {unitSymbol}
                  </p>

                  <p>
                    Low: {Math.round(day.main.temp_min)}
                    {unitSymbol}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}