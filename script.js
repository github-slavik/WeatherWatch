const searchButton = document.getElementById('searchButton');
const locationInput = document.getElementById('locationInput');
const temperatureUnitSelect = document.getElementById('temperatureUnit');

searchButton.addEventListener('click', () => {
    const location = locationInput.value;
    if (location) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const latitude = parseFloat(data[0].lat);
                    const longitude = parseFloat(data[0].lon);
                    fetchWeather(latitude, longitude);
                } else {
                    console.error("Geocoding failed: Address not found");
                }
            })
            .catch(error => {
                console.error("Error fetching data: " + error);
            });
    }
});

let myChart;

function fetchWeather(latitude, longitude) {
    const temperatureUnit = temperatureUnitSelect.value;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability&temperature_unit=${temperatureUnit}&precipitation_unit=mm&wind_speed_unit=kmh`;
   
    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            const hourlyTemperatures = data.hourly.temperature_2m;
            const hourlyPrecipitation = data.hourly.precipitation_probability;
            const currentDate = new Date();
            
            const labels = [];
            const temperatures = [];
            const precipitations = [];
            
            hourlyTemperatures.forEach((temp, index) => {
                const date = new Date(currentDate.getTime());
                date.setHours(currentDate.getHours() + index);
                
                const day = date.toLocaleDateString('en-US', { weekday: 'short' });
                const time = date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
                
                labels.push(`${day} ${time}`);
                temperatures.push(Math.round(temp));
                precipitations.push(hourlyPrecipitation[index]);
            });
            
            if (myChart) {
                myChart.destroy();
            }
            
            myChart = new Chart("myChart", {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Temperature',
                            fill: false,
                            lineTension: 0,
                            backgroundColor: "rgba(0,0,255,1.0)",
                            borderColor: "rgba(0,0,255,0.1)",
                            data: temperatures,
                            yAxisID: 'y-axis-temp'
                        },
                        {
                            label: 'Precipitation Probability (%)',
                            fill: false,
                            lineTension: 0,
                            backgroundColor: "rgba(0,255,0,1.0)",
                            borderColor: "rgba(0,255,0,0.1)",
                            data: precipitations,
                            yAxisID: 'y-axis-precip'
                        }
                    ]
                },
                options: {
                    scales: {
                        yAxes: [
                            {
                                id: 'y-axis-temp',
                                type: 'linear',
                                position: 'left',
                                ticks: { min: Math.min(...temperatures) - 2, max: Math.max(...temperatures) + 2 }
                            },
                            {
                                id: 'y-axis-precip',
                                type: 'linear',
                                position: 'right',
                                ticks: { min: 0, max: 100 }
                            }
                        ]
                    }
                }
            });

            const weatherData = document.getElementById('weather-data');
            weatherData.innerHTML = '<ul>';
            hourlyTemperatures.slice(0, 24).forEach((temp, index) => {
                const date = new Date(currentDate.getTime());
                date.setHours(currentDate.getHours() + index);

                const day = date.toLocaleDateString('en-US', { weekday: 'short' });
                const time = date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
                
                weatherData.innerHTML += `<li data-index="${index}">${day} ${time}<br>${Math.round(temp)}°<br>${hourlyPrecipitation[index]}%</li>`;
            });
            weatherData.innerHTML += '</ul>';
        })
        .catch((error) => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

temperatureUnitSelect.addEventListener('change', () => {
    const location = locationInput.value;
    if (location) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const latitude = parseFloat(data[0].lat);
                    const longitude = parseFloat(data[0].lon);
                    fetchWeather(latitude, longitude);
                } else {
                    console.error("Geocoding failed: Address not found");
                }
            })
            .catch(error => {
                console.error("Error fetching data: " + error);
            });
    }
});
