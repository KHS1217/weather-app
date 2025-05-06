import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_KEY = '23f65e1ee5019e1a1f83e8827af6b1dc';
const UNSPLASH_ACCESS_KEY = 'RATj1d305AZ2s3tXRUG1fnOCzRHKoulnLLH0lmASsoE'; // 실제 키로 교체됨

// 도시 자동완성용 샘플 데이터 (실제 서비스에서는 API 사용 권장)
const CITY_LIST = [
  'Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan',
  'New York', 'London', 'Paris', 'Tokyo', 'Beijing', 'Shanghai', 'Los Angeles', 'Sydney', 'Moscow', 'Berlin', 'Bangkok', 'Singapore'
];

// 도시-국가 코드 매핑 (샘플, 필요시 확장)
const CITY_COUNTRY = {
  'Seoul': 'KR',
  'Busan': 'KR',
  'Incheon': 'KR',
  'Daegu': 'KR',
  'Daejeon': 'KR',
  'Gwangju': 'KR',
  'Suwon': 'KR',
  'Ulsan': 'KR',
  'New York': 'US',
  'London': 'GB',
  'Paris': 'FR',
  'Tokyo': 'JP',
  'Beijing': 'CN',
  'Shanghai': 'CN',
  'Los Angeles': 'US',
  'Sydney': 'AU',
  'Moscow': 'RU',
  'Berlin': 'DE',
  'Bangkok': 'TH',
  'Singapore': 'SG',
};

function getWeatherKeyword(main) {
  switch (main) {
    case 'Clear': return 'clear sky';
    case 'Clouds': return 'cloudy';
    case 'Rain':
    case 'Drizzle': return 'rain';
    case 'Thunderstorm': return 'thunderstorm';
    case 'Snow': return 'snow';
    default: return 'weather';
  }
}

function getFlagUrl(countryCode) {
  if (!countryCode) return '';
  return `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`;
}

function App() {
  const [city, setCity] = useState('Seoul');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [bgUrl, setBgUrl] = useState('');
  const [bgVideoUrl, setBgVideoUrl] = useState('');

  const fetchWeather = async (cityName) => {
    setError('');
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric&lang=kr`
      );
      setWeather(res.data.list[0]);
      setForecast(res.data.list.slice(0, 8));
      // 배경 이미지/영상 fetch
      const mainWeather = res.data.list[0].weather[0].main;
      fetchBackground(cityName, mainWeather);
    } catch (e) {
      setError('도시를 찾을 수 없습니다.');
      setWeather(null);
      setForecast([]);
      setBgUrl('');
      setBgVideoUrl('');
    }
  };

  // Unsplash에서 도시+날씨 키워드로 이미지 fetch
  const fetchBackground = async (cityName, mainWeather) => {
    const keyword = `${cityName} ${getWeatherKeyword(mainWeather)}`;
    try {
      // Unsplash 이미지
      const imgRes = await axios.get(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(keyword)}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
      );
      setBgUrl(imgRes.data.urls.regular);
    } catch {
      setBgUrl('');
    }
    // Pexels 등에서 영상 fetch (예시, 실제 키 필요)
    // setBgVideoUrl('https://www.w3schools.com/howto/rain.mp4'); // 샘플 영상
    setBgVideoUrl(''); // 실제 영상 API 연동 필요
  };

  React.useEffect(() => {
    fetchWeather(city);
    // eslint-disable-next-line
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather(city);
  };

  // 자동완성
  const handleCityChange = (e) => {
    const value = e.target.value;
    setCity(value);
    if (value.length > 0) {
      setSuggestions(
        CITY_LIST.filter(c => c.toLowerCase().startsWith(value.toLowerCase())).slice(0, 5)
      );
    } else {
      setSuggestions([]);
    }
  };
  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion);
    setSuggestions([]);
    fetchWeather(suggestion);
  };

  return (
    <div className="app-container" style={bgUrl ? {backgroundImage: `url(${bgUrl})`} : {}}>
      {bgVideoUrl && (
        <video autoPlay loop muted className="bg-video">
          <source src={bgVideoUrl} type="video/mp4" />
        </video>
      )}
      <form onSubmit={handleSubmit} className="city-form">
        <input
          type="text"
          value={city}
          onChange={handleCityChange}
          placeholder="도시 이름 입력 (예: Seoul)"
          autoComplete="off"
        />
        <button type="submit">검색</button>
        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((s, idx) => (
              <li key={idx} onClick={() => handleSuggestionClick(s)}>{s}</li>
            ))}
          </ul>
        )}
      </form>
      {error && <div className="error">{error}</div>}
      {weather && (
        <div className="current-weather">
          {/* 국기 아이콘 */}
          <div style={{position: 'absolute', left: 20, top: 20}}>
            {getFlagUrl(CITY_COUNTRY[city]) && (
              <img src={getFlagUrl(CITY_COUNTRY[city])} alt="flag" style={{width: 32, height: 20, borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.1)'}} />
            )}
          </div>
          <h2>{city}</h2>
          <div className="weather-main">
            <img
              src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
            <div>
              <div className="temp">{Math.round(weather.main.temp)}°C</div>
              <div>{weather.weather[0].description}</div>
            </div>
          </div>
        </div>
      )}
      {forecast.length > 0 && (
        <div className="forecast">
          <h3>시간대별 예보</h3>
          <div className="forecast-list">
            {forecast.map((item, idx) => (
              <div key={idx} className="forecast-item">
                <div>{item.dt_txt.slice(11, 16)}</div>
                <img
                  src={`http://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                  alt={item.weather[0].description}
                />
                <div>{Math.round(item.main.temp)}°C</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 