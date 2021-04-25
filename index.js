// ***DOM Objects:***
// Input for choosing lookup type:
const current = document.getElementById("current");
const histWeather = document.getElementById("histWeather");
// Inputs for cities:
// const city1 = document.getElementById("city1"); restore after development
// const city2 = document.getElementById("city2"); restore after develoipment 
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
// Positionstack api
const urlPs = "http://api.positionstack.com/v1/forward?access_key=";
const psApiKey = "e3494ffc53b658274332f7aeb9a564c8";
const psQuery = "&query="

// *** Event Listeners: ***
submit.addEventListener("click", (e)=>{
    e.preventDefault();
     if(city1.value === "" || city2.value === ""){
         title.textContent = "Whoops! Looks like you're missing some info."
     } else {
         getLatLong(1);
         getLatLong(2);
     }
})
x.addEventListener("click",(e)=>{
    e.preventDefault();
    resetChart();
})
newComparison.addEventListener("click",(e)=>{
    e.preventDefault(e);
    resetChart();
    clearInputs();
})

// ***Functions:***
// API call for latitude and longitude (for either info:)
let latitude;
let longitude;
function getLatLong(num){
    let city = num === 1 ? city1.value : city2.value;
    fetch(urlPs+psApiKey+psQuery+city)
        .then(response => response.json())
        .then(data => {
            if(!data.data[0].latitude || !data.data[0].latitude){
                getLatLong(num)
            } else {
                latitude = data.data[0].latitude.toFixed(2);
                longitude = data.data[0].longitude.toFixed(2);
                if(current.checked){
                    getCurrentWeather(num,latitude,longitude);
                } else {
                    getHistWeather(num,latitude,longitude);
                }
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
    if(weatherObj.cod==="404"){
        title.textContent = "Sorry! One or both of your cities can't be found."
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
    title.textContent = `Comparing ${weather.city1.name} and ${weather.city2.name}`
    // Setting table headers:
    tableCity1.textContent = weather.city1.name;
    tableCity2.textContent = weather.city2.name;
    // Create row for conditions icon:
    let th = document.createElement("th");
    let textNode = document.createTextNode("Conditions");
    th.appendChild(textNode);
    let td1 = document.createElement("td");
    let img1 = document.createElement("img");
    img1.src = "http://openweathermap.org/img/wn/" + weather.city1.conditions + "@2x.png";
    td1.appendChild(img1);
    let td2 = document.createElement("td");
    let img2 = document.createElement("img");
    img2.src = "http://openweathermap.org/img/wn/" + weather.city2.conditions + "@2x.png";
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
        // temperature for both cities:
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
        // temperature for both cities:
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

// The API calls for 5 day history:
let historyObjPlace1 = {};
let historyObjPlace2 = {};

function getHistWeather(placeNum,latitude,longitude){  
    let url = "https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=";
    for(var i = 5; i > 0; i--){
        let year = new Date().getFullYear();
        let month = new Date().getMonth();
        let day = new Date().getDate()-i;
        let date = Date.UTC(year,month,day)/1000;
        // Creates the URL and sends to the function that makes the API call and constructs the object:
        histWeatherCall(placeNum,i,url+latitude+"&lon="+longitude+"&dt="+date+apiPrefix+apiKey);
    }
}

// The actual API call.  
function histWeatherCall(placeNum,dayNum,url){
    let day = dayNum.toString();
    let place = placeNum.toString();
    // console.log(historyObj);
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if(placeNum === 1){
                historyObjPlace1[day] = data;
                getHighs(placeNum, day, historyObjPlace1[day].hourly);
            } else {
                historyObjPlace2[day] = data;
                // getHighs(historyObjPlace2[day].hourly);
            }
        })
}

// Pulls apart and analyzes the data:
function getHighs(placeNum, day, arr){
    // each arr is a different day and place.  It has an object with temp, feels_like, and humidity. 
    let highTemp = 0;
    let highHumidity = 0;
    let highFeelsLike = 0;
    arr.forEach(hour => {
        highTemp = hour.temp > highTemp ? hour.temp : highTemp;
        highHumidity = hour.humidity > highHumidity ? hour.humidity : highHumidity;
        highFeelsLike = hour.feels_like > highFeelsLike ? hour.feels_like : highFeelsLike;
    })
    // console.log(`Day ${day}, placeNum ${placeNum}, high temp = ${highTemp}
    // high humidity = ${highHumidity}, and high feels like = ${highFeelsLike}`)
    if(placeNum === 1){
        historyObjPlace1["highs"] = {
            temp: highTemp,
            humidity: highHumidity,
            feelsLike: highFeelsLike
        }
    } else {
        historyObjPlace2["highs"] = {
            temp: highTemp,
            humidity: highHumidity,
            feelsLike: highFeelsLike
        }
    }
}

// ********** Clean Up: **********
function resetChart(){
    while(tableBody.firstChild){
        tableBody.removeChild(tableBody.firstChild);
        tableCity1.textContent = "";
        tableCity2.textContent = "";
        title.textContent = "";
    }
}
function clearInputs(){
    city1.value = "";
    city2.value = "";
}

// 5-day History:




