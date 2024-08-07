const searchButton = document.getElementById('searchButton');
const locationInput = document.getElementById('locationInput');

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
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`;
   
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
                const time = date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false });
                
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
                            label: 'Temperature (°F)',
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
            
            let output = '<ul>';
            hourlyTemperatures.slice(0, 24 * 7).forEach((temp, index) => {
                const date = new Date(currentDate.getTime());
                date.setHours(currentDate.getHours() + index);
                
                const day = date.toLocaleDateString('en-US', { weekday: 'short' });
                const time = date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false });
                
                output += `<li>${day} ${time}: ${Math.round(temp)}°F, Precipitation: ${precipitations[index]}%</li>`;
            });
            output += '</ul>';
            document.getElementById('weather-data').innerHTML = output;
        })
        .catch((error) => {
            console.error('Error fetching weather data:', error);
        });
}

document.addEventListener('DOMContentLoaded', fetchWeather);
