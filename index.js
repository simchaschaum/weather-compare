// ***DOM Objects:***
// Input for choosing lookup type:
const current = document.getElementById("current");
const histWeather = document.getElementById("histWeather");
// Inputs for cities:
// const city1 = document.getElementById("city1"); 
// const city2 = document.getElementById("city2"); 
const city1 = {value: "bet shemesh, il"};  // remove after development
const city2 = {value: "teaneck, nj"};  // remove after development
// Radio inputs for F/C:
const farenheit = document.getElementById("farenheit");
const celcius = document.getElementById("celcius");
// Checkboxes for options:
const temp = document.getElementById("temp");
const humid = document.getElementById("humid");
const feelsLike = document.getElementById("feelsLike");
//Buttons:
const submit = document.getElementById("submit");
const x = document.getElementById("x");  
const newComparison = document.getElementById("newComparison");
// Display for answers: 
const title = document.getElementById("displayTitle");
const titleDiv = document.getElementById("titleDiv");
const tableCitySpace = document.getElementById("tableCitySpace");
const tableCity1 = document.getElementById("tableCity1");
const tableCity2 = document.getElementById("tableCity2");
const tableBody = document.getElementById("tableBody");
// Body for clicking off the modal
const body = document.getElementById("body");

// API urls - 
// Openweathermap
const apiPrefix = "&APPID="
const apiKey = "2e293695acd59dd8de6e33f2e330cf8b";
//  api for longitude/ latitude 
const geocodeToken2 = "pk.7c752c8d33acc057c62397f44df6a292";
const geocodeEndPoint1 = "https://us1.locationiq.com/v1/search.php?key=";
const geocodeEndPoint3 = "&q="; // search string comes next
const geocodeEndPoint5 = "&format=json"


let histCounter = 0;
// *** Event Listeners: ***
submit.addEventListener("click", (e)=>{
    e.preventDefault();
     if(city1.value === "" || city2.value === ""){
         title.textContent = "Whoops! Looks like you're missing some info."
     } else {
        histCounter = 0;  // this will count six total history API calls; only makes the chart after all 6.
        
        getLatLong(1);
        getLatLong(2);
     }
})
x.addEventListener("click",(e)=>{
    e.preventDefault();
    resetChart();
    if(histWeather.checked){
        destroyHistChart()
    }
})
newComparison.addEventListener("click",(e)=>{
    e.preventDefault(e);
    resetChart();
    clearInputs();
    if(histWeather.checked){
        destroyHistChart()
    }
})

// ***Functions:***
// API call for latitude and longitude (for either info:)
let latitude;
let longitude;

function getLatLong(num){
    let city = num === 1 ? city1.value : city2.value;
    fetch(geocodeEndPoint1+geocodeToken2+geocodeEndPoint3+city+geocodeEndPoint5)
        .then(response => response.json())
        .then(data => {
            let latitude = data[0].lat;
            let longitude = data[0].lon;
            if(current.checked){
                getCurrentWeather(num,latitude,longitude);
            } else {
                getHistWeather(num,latitude,longitude);
            }
        })
}
// The API call for current weather:
function getCurrentWeather(num, latitude,longitude){
    let url = "https://api.openweathermap.org/data/2.5/weather?lat=";
    let lon = "&lon=";
    fetch(url+latitude+lon+longitude+apiPrefix+apiKey) 
    .then(response => response.json()) 
    .then(data => {  
        weatherObj = data;
        dataPrep(num, weatherObj);
    })
}
// Initializing weather object for dataPrep function:
let weather = {};

function dataPrep(num,weatherObj){
    // Error Message:
    if(weatherObj.cod===404){
        title.textContent = "Sorry! One or both of your cities can't be found."
    }else if(weatherObj.cod !== 200){
        errorMessage();
    } else {
        let name = weatherObj.name;
        // Getting temp:
        let tempKelvin = weatherObj.main.temp;
        let tempFar = (tempKelvin - 273) * 1.8 + 32;
        let tempCel = tempKelvin- 273.15;
        // Getting humidity:
        let humidity = weatherObj.main.humidity;
        // Getting "real Feel:"
        let feelsLikeKelvin = weatherObj.main.feels_like;
        let feelsLikeFar = (feelsLikeKelvin - 273) * 1.8 + 32;
        let feelsLikeCel = feelsLikeKelvin - 273.15;
        // Getting weather conditions:
        let conditionIconCode = weatherObj.weather[0].icon;
        let cityObj = {
            name: name,
            temperature: farenheit.checked ? tempFar.toFixed(1)+String.fromCharCode(176) : tempCel.toFixed(1)+String.fromCharCode(176),
            humidity: humidity + String.fromCharCode(37),
            feelsLike: farenheit.checked ? feelsLikeFar.toFixed(1)+String.fromCharCode(176) : feelsLikeCel.toFixed(1)+String.fromCharCode(176),
            conditions: conditionIconCode
        };
        if(num === 1){
            weather.city1 = cityObj;
        } else {
            weather.city2 = cityObj;
        }
        if(weather.city1 != undefined && weather.city2 != undefined){
            display(weather);
        }
    }
}

function display(weather){
    // Setting the title:
    let measure = temp.checked ? "Temperature"
        : humid.checked ? "Humidity" : "'Real-Feel' Temperature";
    title.textContent = `Comparing the Current Conditions and ${measure} of ${weather.city1.name} and ${weather.city2.name}`
    // Setting table headers:
    tableCity1.textContent = weather.city1.name;
    tableCity2.textContent = weather.city2.name;
    // Create row for conditions icon:
    let th = document.createElement("th");
    let textNode = document.createTextNode("Conditions");
    th.appendChild(textNode);
    let td1 = document.createElement("td");
    let img1 = document.createElement("img");
    img1.src = "https://openweathermap.org/img/wn/" + weather.city1.conditions + "@2x.png";
    td1.appendChild(img1);
    let td2 = document.createElement("td");
    let img2 = document.createElement("img");
    img2.src = "https://openweathermap.org/img/wn/" + weather.city2.conditions + "@2x.png";
    td2.appendChild(img2);
    let tr = document.createElement("tr");
    tr.appendChild(th);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tableBody.appendChild(tr);
    // Create row for temperature (if selectged):
        if(temp.checked){
            // row title:
            let th = document.createElement("th");
            let textNode = document.createTextNode("Temperature");
            th.appendChild(textNode);
            // temperature for both cities:
            let td1 = document.createElement("td");
            textNode = document.createTextNode(weather.city1.temperature);
            td1.appendChild(textNode);
            let td2 = document.createElement("td");
            textNode = document.createTextNode(weather.city2.temperature);
            td2.appendChild(textNode);
            let tr = document.createElement("tr");
            tr.appendChild(th);
            tr.appendChild(td1);
            tr.appendChild(td2);
            tableBody.appendChild(tr);
        }
    // Create row for humidity (if selected):
    if(humid.checked){
        // row title:
        let th = document.createElement("th");
        let textNode = document.createTextNode("Humidity");
        th.appendChild(textNode);
        // humidity for both cities:
        let td1 = document.createElement("td");
        textNode = document.createTextNode(weather.city1.humidity);
        td1.appendChild(textNode);
        let td2 = document.createElement("td");
        textNode = document.createTextNode(weather.city2.humidity);
        td2.appendChild(textNode);
        let tr = document.createElement("tr");
        tr.appendChild(th);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tableBody.appendChild(tr);
    }
    // Create row for real-feel (if selected):
    if(feelsLike.checked){
        // row title:
        let th = document.createElement("th");
        let textNode = document.createTextNode("Feels Like");
        th.appendChild(textNode);
        // real feel for both cities:
        let td1 = document.createElement("td");
        textNode = document.createTextNode(weather.city1.feelsLike);
        td1.appendChild(textNode);
        let td2 = document.createElement("td");
        textNode = document.createTextNode(weather.city2.feelsLike);
        td2.appendChild(textNode);
        let tr = document.createElement("tr");
        tr.appendChild(th);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tableBody.appendChild(tr);
    }
// Clearing the weather object for next time:
    for(var left in weather){
        delete weather[left]
    }
}

// **** Comparing 3-Day History: ********

// Initializing objects for both places:
let historyObjPlace1 = {};
let historyObjPlace2 = {};

function getHistWeather(placeNum,latitude,longitude){  
    // First, clear both history objects:
    for(item in historyObjPlace1){
        delete historyObjPlace1[item]
    };
    for(item in historyObjPlace2){
        delete historyObjPlace2[item]
    }
    // Call the weather history:    
    let url = "https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=";
    for(var i = 3; i >0; i--){  
        let year = new Date().getFullYear();
        let month = new Date().getMonth()+1;
        let day = new Date().getDate()-i;
        console.log(`month = ${month}, day = ${day} - for counter ${i}`)//***
        let date = Date.UTC(year,month,day)/1000;
        // Creates the URL and sends to the function that makes the API call and constructs the object:
        histWeatherCall(placeNum,i,url+latitude+"&lon="+longitude+"&dt="+date+apiPrefix+apiKey);
    }
}

// The actual API call.  
function histWeatherCall(placeNum,dayNum,url){
    let day = dayNum.toString();
    let place = placeNum.toString();
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if(placeNum === 1){
                historyObjPlace1["name"] = city1.value;
                historyObjPlace1[day] = data;
                getHighs(placeNum, day, historyObjPlace1[day].hourly);
            } else {
                historyObjPlace2["name"] = city2.value;
                historyObjPlace2[day] = data;
                getHighs(placeNum, day, historyObjPlace2[day].hourly);
            }
        })
        .catch(error => {
            if(histCounter===1){
                errorMessage();
            }
        })
}

// Pulls apart and analyzes the historical data:
function getHighs(placeNum, day, arr){
    //count off how many history calls - from 1 to 6
    histCounter++;  
    // each arr is a different day and place.  It has an object with temp, feels_like, and humidity. 
    let highTemp = 0;
    let highHumidity = 0;
    let highFeelsLike = 0;
    arr.forEach(hour => {
        highTemp = hour.temp > highTemp ? hour.temp : highTemp;
        highHumidity = hour.humidity > highHumidity ? hour.humidity : highHumidity;
        highFeelsLike = hour.feels_like > highFeelsLike ? hour.feels_like : highFeelsLike;
    })
    // Convert from Kelvin to either Farenheit or Celcius:
    let highTempFar = (highTemp - 273) * 1.8 + 32;
    let highTempCel = highTemp - 273.15;
    highTemp = farenheit.checked ? Math.round(highTempFar) : Math.round(highTempCel);
    let highFeelsLikeFar = (highFeelsLike - 273) * 1.8 + 32;
    let highFeelsLikeCel = highFeelsLike - 273.15;
    highFeelsLike = farenheit.checked ? Math.round(highFeelsLikeFar) : Math.round(highFeelsLikeCel);

    if(placeNum === 1){
        historyObjPlace1[day]["highs"] = {
            temp: highTemp,
            humidity: highHumidity,
            feelsLike: highFeelsLike
        }
    } else {
        historyObjPlace2[day]["highs"] = {
            temp: highTemp,
            humidity: highHumidity,
            feelsLike: highFeelsLike
        }
    }
    
    // Only create the chart when we've done all 6 API history calls.
    if(histCounter === 6){
        console.log(historyObjPlace1)
        console.log(historyObjPlace2)
        makeChart();
    }

}

// Declaring myChart outside the function so it can be properly destroyed upon closing the chart.
// will create the chart and assign it to myChart inside the makeChart function.
var myChart; 
let data1 = [];
let data2 = [];

function makeChart(){
    // Create the canvas element for the chart and set its id:
    let chart = document.createElement("canvas");
    chart.setAttribute("id","chart");
    // add the canvas to the DOM:
    let chartDiv = document.getElementById("chartDiv");
    chartDiv.appendChild(chart);

    // set the data for the chart:
    if(temp.checked){
        data1 = [historyObjPlace1[1].highs.temp, historyObjPlace1[2].highs.temp, historyObjPlace1[3].highs.temp];
        data2 = [historyObjPlace2[1].highs.temp, historyObjPlace2[2].highs.temp, historyObjPlace2[3].highs.temp];
    } else if (humid.checked){
        data1 = [historyObjPlace1[1].highs.humidity, historyObjPlace1[2].highs.humidity, historyObjPlace1[3].highs.humidity];
        data2 = [historyObjPlace2[1].highs.humidity, historyObjPlace2[2].highs.humidity, historyObjPlace2[3].highs.humidity];
    } else {
        data1 = [historyObjPlace1[1].highs.feelsLike, historyObjPlace1[2].highs.feelsLike, historyObjPlace1[3].highs.feelsLike];
        data2 = [historyObjPlace2[1].highs.feelsLike, historyObjPlace2[2].highs.feelsLike, historyObjPlace2[3].highs.feelsLike];    
    }

    // Line Chart from chartjs:
    var ctx = document.getElementById("chart").getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3'],
            datasets: [{
                label: historyObjPlace1["name"],
                data: data1,
                backgroundColor: [
                    'blue'
                ],
                borderColor: [
                    'blue'
                ],
                borderWidth: 1
            },
            {
                label: historyObjPlace2["name"],
                data: data2,
                backgroundColor: [
                    'red'
                ],
                borderColor: [
                    'red'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Error Message
let stormIcon = "";
function errorMessage(){
    title.textContent = "Sorry! Something went wrong.";
    stormIcon = document.createElement("img");
    stormIcon.src = "http://openweathermap.org/img/wn/11d@2x.png";
    stormIcon.classList.add("storm");
    titleDiv.appendChild(stormIcon);
}


//  ********** Clean Up: **********
function resetChart(){
    while(tableBody.firstChild){
        tableBody.removeChild(tableBody.firstChild);
        tableCity1.textContent = "";
        tableCity2.textContent = "";
    }
    title.textContent = "";
    if(!!stormIcon){
        stormIcon.remove();
    } 
}

function clearInputs(){
    city1.value = "";
    city2.value = "";
}

function destroyHistChart(){
    // Destroys chart if one exists.  Need to do this before chartjs can make another on the same canvas.
    if(!!myChart){
        myChart.destroy();
    }
}




