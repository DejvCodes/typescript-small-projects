import chalk from 'chalk'; // Library for styling console output
import inquirer from 'inquirer'; // Library for creating interactive command-line prompts

// Type for a place returned by the geocoding API
type Place = {
	name: string;
	country: string;
	admin1?: string;
	latitude: number;
	longitude: number;
}

// Type for the answer of the geocoding API
type GeocodingResponse = {
	results?: Place[]; // Missing when nothing was found
}

// Type for the answer of the weather API
type ForecastResponse = {
	timezone: string;
	current: {
		temperature_2m: number;
		apparent_temperature: number;
		relative_humidity_2m: number;
		wind_speed_10m: number;
		weather_code: number;
	};
	daily: {
		time: string[];
		weather_code: number[];
		temperature_2m_max: number[];
		temperature_2m_min: number[];
	};
}

// Type for the answer of the "ask again" prompt
type AskAgain = {
	again: boolean;
}

// Number of days to show in the forecast
const forecastDays = 4;

// Mapping of weather codes to their descriptions and icons
const weatherCodes: Record<number, { label: string; icon: string }> = {
	0: { label: 'Clear sky', icon: '☀️' },
	1: { label: 'Mainly clear', icon: '🌤️' },
	2: { label: 'Partly cloudy', icon: '⛅' },
	3: { label: 'Overcast', icon: '☁️' },
	45: { label: 'Fog', icon: '🌫️' },
	48: { label: 'Rime fog', icon: '🌫️' },
	51: { label: 'Light drizzle', icon: '🌦️' },
	53: { label: 'Moderate drizzle', icon: '🌦️' },
	55: { label: 'Dense drizzle', icon: '🌦️' },
	56: { label: 'Light freezing drizzle', icon: '🌧️' },
	57: { label: 'Dense freezing drizzle', icon: '🌧️' },
	61: { label: 'Slight rain', icon: '🌧️' },
	63: { label: 'Moderate rain', icon: '🌧️' },
	65: { label: 'Heavy rain', icon: '🌧️' },
	66: { label: 'Light freezing rain', icon: '🌧️' },
	67: { label: 'Heavy freezing rain', icon: '🌧️' },
	71: { label: 'Slight snow', icon: '🌨️' },
	73: { label: 'Moderate snow', icon: '🌨️' },
	75: { label: 'Heavy snow', icon: '❄️' },
	77: { label: 'Snow grains', icon: '🌨️' },
	80: { label: 'Slight rain showers', icon: '🌦️' },
	81: { label: 'Moderate rain showers', icon: '🌧️' },
	82: { label: 'Violent rain showers', icon: '⛈️' },
	85: { label: 'Slight snow showers', icon: '🌨️' },
	86: { label: 'Heavy snow showers', icon: '❄️' },
	95: { label: 'Thunderstorm', icon: '⛈️' },
	96: { label: 'Thunderstorm with hail', icon: '⛈️' },
	99: { label: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

// Function to validate the city input
const validateCity = (input: string) => {
	if (!input || input.trim() === '') {
		return 'City cannot be empty';
	}

	return true;
};

// Function to describe the weather based on its code
const describeWeather = (code: number) => {
	return weatherCodes[code] ?? { label: 'Unknown weather', icon: '❓' };
};

// Function to color the temperature based on its value
const colorTemperature = (celsius: number) => {
	const text = `${Math.round(celsius)} °C`;

	if (celsius <= 0) {
		return chalk.cyan(text);
	}

	if (celsius < 15) {
		return chalk.blue(text);
	}

	if (celsius < 25) {
		return chalk.green(text);
	}

	return chalk.red(text);
};

// Function to format a place into a readable string
const formatPlace = (place: Place) => {
	return [place.name, place.admin1, place.country].filter(Boolean).join(', ');
};

// Function to format an ISO date into a readable string
const formatDay = (isoDate: string) => {
	// Create a Date object from the ISO date and format it to a readable string
	return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-GB', {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
	});
};

// Generic function to fetch JSON data from a URL and parse it into a specific type
const fetchJson = async <T>(url: string): Promise<T> => {
	const response = await fetch(url);

	// Check if the response is OK (status code 200-299)
	if (!response.ok) {
		throw new Error(`The weather service replied with ${response.status} ${response.statusText}`);
	}

	return await response.json() as T;
};

// Function to find places matching a city name using the geocoding API
const findPlaces = async (city: string): Promise<Place[]> => {
	const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
	url.searchParams.set('name', city);
	url.searchParams.set('count', '5');
	url.searchParams.set('language', 'en');
	url.searchParams.set('format', 'json');

	const data = await fetchJson<GeocodingResponse>(url.toString());
	return data.results ?? [];
};

// Function to prompt the user to choose a place from a list of places
const choosePlace = async (places: Place[]): Promise<Place> => {
	if (places.length === 1) {
		return places[0]!; // If there's only one place, return it directly
	}

	const { place } = await inquirer.prompt<{ place: Place }>([
		{
			type: 'select',
			name: 'place',
			message: 'Which one did you mean?',
			choices: places.map((item) => ({ name: formatPlace(item), value: item })),
		}
	]);

	return place;
};

// Function to fetch the weather forecast for a specific place using the weather API
const fetchForecast = async (place: Place): Promise<ForecastResponse> => {
	const url = new URL('https://api.open-meteo.com/v1/forecast');
	url.searchParams.set('latitude', String(place.latitude));
	url.searchParams.set('longitude', String(place.longitude));
	url.searchParams.set('current', 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code');
	url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min');
	url.searchParams.set('timezone', 'auto'); // Use the timezone of the place, not of this computer
	url.searchParams.set('forecast_days', String(forecastDays));

	return await fetchJson<ForecastResponse>(url.toString());
};

// Function to print the current weather for a specific place
const showCurrent = (place: Place, forecast: ForecastResponse): void => {
	const { current } = forecast;
	const weather = describeWeather(current.weather_code);

	console.log(chalk.blue.bold(`\nWeather in ${formatPlace(place)}`));
	console.log(`${weather.icon}  ${chalk.white(weather.label)}`);
	console.log(`Temperature: ${colorTemperature(current.temperature_2m)} (feels like ${colorTemperature(current.apparent_temperature)})`);
	console.log(`Humidity:    ${chalk.white(`${current.relative_humidity_2m} %`)}`);
	console.log(`Wind:        ${chalk.white(`${Math.round(current.wind_speed_10m)} km/h`)}`);
	console.log(chalk.gray(`Local timezone: ${forecast.timezone}`));
};

// Function to print the weather forecast for the next days
const showForecast = (forecast: ForecastResponse): void => {
	const { daily } = forecast;

	console.log(chalk.blue.bold('\nNext days:'));

	// The first day is today, which is already covered by the current weather
	daily.time.slice(1).forEach((day, index) => {
		const position = index + 1;
		const weather = describeWeather(daily.weather_code[position]!);
		const min = colorTemperature(daily.temperature_2m_min[position]!);
		const max = colorTemperature(daily.temperature_2m_max[position]!);

		console.log(`${formatDay(day).padEnd(12)} ${weather.icon}  ${min} / ${max}  ${chalk.gray(weather.label)}`);
	});

	console.log('');
};

// Function to handle the entire process of showing the weather for a city
const showWeather = async () => {
	try {
		const { city } = await inquirer.prompt<{ city: string }>([
			{
				type: 'input',
				name: 'city',
				message: 'Enter a city:',
				validate: validateCity,
			}
		]);

		console.log(chalk.gray('Loading weather...'));

		const places = await findPlaces(city.trim());

		if (places.length === 0) {
			console.log(chalk.yellow(`No place named "${city.trim()}" was found.`));
			return;
		}

		const place = await choosePlace(places);
		const forecast = await fetchForecast(place);

		showCurrent(place, forecast);
		showForecast(forecast);

	} catch (error) {
		console.error(chalk.red('Could not load the weather:'), (error as Error).message);
	}
};

// Main function to run the Weather App
const main = async () => {
	console.log(chalk.blue.bold('Weather App'));
	console.log(chalk.gray('Data by Open-Meteo.com\n'));

	while (true) {
		await showWeather();

		const { again } = await inquirer.prompt<AskAgain>([
			{
				type: 'confirm',
				name: 'again',
				message: 'Do you want to check another city?',
				default: false,
			}
		]);

		if (!again) {
			console.log(chalk.green('Thank you for using the Weather App!'));
			break;
		}
	}
};

// Start the Weather App
main();
