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
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY

  const unitSymbol = unit === 'metric' ? '°C' : '°F'
  const windUnit = unit === 'metric' ? 'm/s' : 'mph'

  const theme = {
    page: darkMode ? 'bg-[#06131f] text-white' : 'bg-[#fff8e8] text-black',
    border: darkMode ? 'border-white' : 'border-black',
    shadow: darkMode ? 'shadow-[9px_9px_0px_#00d9ff]' : 'shadow-[9px_9px_0px_#111111]',
    panel: darkMode ? 'bg-[#071827]' : 'bg-white',
    input: darkMode ? 'bg-[#020b14] text-white placeholder:text-zinc-400' : 'bg-white text-black placeholder:text-zinc-500',
  }

  async function fetchWeather(searchCity) {
    if (searchCity.trim() === '') return

    try {
      setLoading(true)
      setError('')
      setShowSuggestions(false)

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

  async function fetchCitySuggestions(searchText) {
    if (searchText.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${searchText}&limit=5&appid=${API_KEY}`
      )

      if (!response.ok) {
        throw new Error('Could not fetch suggestions')
      }

      const data = await response.json()
      setSuggestions(data)
      setShowSuggestions(true)
    } catch {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    fetchWeather(city)
  }

  function handleSuggestionClick(suggestion) {
    const selectedCity = suggestion.state
      ? `${suggestion.name}, ${suggestion.state}, ${suggestion.country}`
      : `${suggestion.name}, ${suggestion.country}`

    setCity(selectedCity)
    setShowSuggestions(false)
    fetchWeather(selectedCity)
  }

  function toggleUnit() {
    setUnit(unit === 'metric' ? 'imperial' : 'metric')
  }

  function getWeatherIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  }

  useEffect(() => {
    const lastCity = localStorage.getItem('lastCity')

    if (lastCity) {
      setCity(lastCity)
      fetchWeather(lastCity)
    }
  }, [unit])

  return (
    <main className={`min-h-screen p-4 sm:p-6 ${theme.page}`}>
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div
            className={`inline-block border-4 ${theme.border} ${
              darkMode ? 'bg-[#dfff00] text-black' : 'bg-[#ffdf00] text-black'
            } px-6 py-4 ${darkMode ? 'shadow-[8px_8px_0px_#ff3fa4]' : 'shadow-[8px_8px_0px_#111111]'}`}
          >
            <h1 className="text-5xl font-black uppercase tracking-tight sm:text-6xl">
              Weather.
            </h1>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`border-4 ${theme.border} ${
                darkMode ? 'bg-[#ff3fa4] text-black' : 'bg-white text-black'
              } px-5 py-3 text-lg font-black uppercase ${theme.shadow} active:translate-x-1 active:translate-y-1 active:shadow-none`}
            >
              {darkMode ? '🌙 Dark' : '☀️ Light'}
            </button>

            <button
              onClick={toggleUnit}
              className={`border-4 ${theme.border} ${
                darkMode ? 'bg-[#8b5cff] text-white' : 'bg-[#8b5cff] text-white'
              } px-5 py-3 text-lg font-black uppercase ${theme.shadow} active:translate-x-1 active:translate-y-1 active:shadow-none`}
            >
              {unit === 'metric' ? '°C' : '°F'}
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="relative mb-6">
          <div className={`flex border-4 ${theme.border} ${theme.shadow}`}>
            <div className="flex items-center justify-center border-r-4 border-black bg-[#ff3fa4] px-4 text-3xl text-black dark:border-white">
              🔍
            </div>

            <input
              type="text"
              placeholder="SEARCH FOR A CITY..."
              value={city}
              onChange={event => {
                setCity(event.target.value)
                fetchCitySuggestions(event.target.value)
              }}
              className={`min-w-0 flex-1 px-4 py-4 text-base font-black uppercase outline-none sm:text-xl ${theme.input}`}
            />

            <button
              type="submit"
              className={`border-l-4 ${theme.border} ${
                darkMode ? 'bg-[#dfff00] text-black' : 'bg-[#8b5cff] text-white'
              } px-6 py-4 text-lg font-black uppercase sm:px-10`}
            >
              Search →
            </button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div
              className={`absolute z-30 mt-4 w-full border-4 ${theme.border} ${theme.panel} ${theme.shadow}`}
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.name}-${suggestion.lat}-${suggestion.lon}-${index}`}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`block w-full border-b-4 ${theme.border} px-4 py-3 text-left font-black uppercase ${
                    darkMode ? 'hover:bg-[#dfff00] hover:text-black' : 'hover:bg-[#ffdf00]'
                  }`}
                >
                  {suggestion.name}
                  {suggestion.state ? `, ${suggestion.state}` : ''}
                  {`, ${suggestion.country}`}
                </button>
              ))}
            </div>
          )}
        </form>

        {loading && (
          <div className="mb-6 border-4 border-black bg-[#ffdf00] p-4 text-xl font-black uppercase text-black shadow-[7px_7px_0px_#111111]">
            Loading weather...
          </div>
        )}

        {error && (
          <div className="mb-6 border-4 border-black bg-[#ff3fa4] p-4 text-xl font-black uppercase text-black shadow-[7px_7px_0px_#111111]">
            {error}
          </div>
        )}

        {weather && !loading && (
          <>
            <section
              className={`mb-7 border-4 ${theme.border} ${theme.panel} p-5 ${theme.shadow}`}
            >
              <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1.2fr_1fr_0.8fr]">
                <div>
                  <h2 className="text-5xl font-black uppercase sm:text-6xl">
                    {weather.name}
                    {weather.sys?.country ? `, ${weather.sys.country}` : ''}
                  </h2>

                  <p
                    className={`mt-5 inline-block border-4 ${theme.border} ${
                      darkMode ? 'bg-[#dfff00] text-black' : 'bg-[#8b5cff] text-white'
                    } px-4 py-2 text-lg font-black uppercase`}
                  >
                    {weather.weather[0].description}
                  </p>
                </div>

                <div className="flex justify-center">
                  <div
                    className={`border-4 ${theme.border} ${
                      darkMode ? 'bg-[#00d9ff]' : 'bg-[#ffdf00]'
                    } p-4 ${darkMode ? 'shadow-[9px_9px_0px_#ffffff]' : 'shadow-[9px_9px_0px_#00d9ff]'}`}
                  >
                    <img
                      className="h-44 w-44"
                      src={getWeatherIconUrl(weather.weather[0].icon)}
                      alt={weather.weather[0].description}
                    />
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-8xl font-black sm:text-9xl">
                    {Math.round(weather.main.temp)}
                    {unitSymbol}
                  </p>

                  <p className="mt-2 text-xl font-black uppercase">
                    Feels like {Math.round(weather.main.feels_like)}
                    {unitSymbol}
                  </p>

                  <div
                    className={`mt-5 inline-flex gap-5 border-4 ${theme.border} ${
                      darkMode ? 'bg-[#020b14]' : 'bg-white'
                    } px-4 py-2 text-xl font-black`}
                  >
                    <span className="text-[#ff3fa4]">
                      ↑ {Math.round(weather.main.temp_max)}
                      {unitSymbol}
                    </span>
                    <span className="text-[#00a8ff]">
                      ↓ {Math.round(weather.main.temp_min)}
                      {unitSymbol}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Humidity"
                value={`${weather.main.humidity}%`}
                icon="💧"
                accent="#8b5cff"
                darkMode={darkMode}
              />

              <MetricCard
                title="Wind"
                value={`${weather.wind.speed} ${windUnit}`}
                icon="💨"
                accent="#dfff00"
                darkMode={darkMode}
              />

              <MetricCard
                title="Pressure"
                value={`${weather.main.pressure} hPa`}
                icon="🧭"
                accent="#00d9ff"
                darkMode={darkMode}
              />

              <MetricCard
                title="Visibility"
                value={weather.visibility ? `${Math.round(weather.visibility / 1000)} km` : 'N/A'}
                icon="👁️"
                accent="#ff3fa4"
                darkMode={darkMode}
              />
            </section>
          </>
        )}

        {forecast.length > 0 && !loading && (
          <section
            className={`border-4 ${theme.border} ${theme.panel} p-4 ${theme.shadow}`}
          >
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2
                className={`inline-block border-4 ${theme.border} ${
                  darkMode ? 'bg-[#dfff00] text-black' : 'bg-[#ffdf00] text-black'
                } px-4 py-2 text-3xl font-black uppercase`}
              >
                5 Day Forecast
              </h2>

            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {forecast.map((day, index) => (
                <ForecastCard
                  key={day.dt}
                  day={day}
                  index={index}
                  unitSymbol={unitSymbol}
                  darkMode={darkMode}
                  getWeatherIconUrl={getWeatherIconUrl}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function MetricCard({ title, value, icon, accent, darkMode }) {
  return (
    <div
      className={`relative border-4 ${
        darkMode ? 'border-white bg-[#071827] text-white shadow-[8px_8px_0px_#ffffff]' : 'border-black bg-white text-black shadow-[8px_8px_0px_#111111]'
      } p-5`}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center border-4 border-black text-3xl"
          style={{ backgroundColor: accent }}
        >
          {icon}
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-black">{value}</p>
        </div>
      </div>

      <div
        className="absolute -bottom-4 left-2 right-2 h-4 border-4 border-black"
        style={{ backgroundColor: accent }}
      />
    </div>
  )
}

function ForecastCard({ day, index, unitSymbol, darkMode, getWeatherIconUrl }) {
  const accents = ['#ffdf00', '#dfff00', '#00d9ff', '#ff3fa4', '#ff7a00']
  const accent = accents[index % accents.length]

  return (
    <div
      className={`relative border-4 ${
        darkMode ? 'border-white bg-[#020b14] text-white shadow-[7px_7px_0px_#ffffff]' : 'border-black bg-white text-black shadow-[7px_7px_0px_#111111]'
      } p-4 text-center`}
    >
      <p className="text-xl font-black uppercase">
        {new Date(day.dt_txt).toLocaleDateString(undefined, {
          weekday: 'short',
        })}
      </p>

      <img
        className="mx-auto my-3 h-20 w-20"
        src={getWeatherIconUrl(day.weather[0].icon)}
        alt={day.weather[0].description}
      />

      <p className="text-4xl font-black">
        {Math.round(day.main.temp_max)}
        {unitSymbol}
      </p>

      <p className="mt-1 text-2xl font-black text-[#00a8ff]">
        {Math.round(day.main.temp_min)}
        {unitSymbol}
      </p>

      <p className="mt-3 text-sm font-black uppercase">
        {day.weather[0].description}
      </p>

      <div
        className="absolute -bottom-4 left-3 right-3 h-4 border-4 border-black"
        style={{ backgroundColor: accent }}
      />
    </div>
  )
}
