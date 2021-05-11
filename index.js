// ***DOM Objects:***
// Input for choosing lookup type:
const current = document.getElementById("current");
const histWeather = document.getElementById("histWeather");
// Inputs for cities:
const city1 = document.getElementById("city1"); 
const city2 = document.getElementById("city2"); 
// Radio inputs for F/C:
const farenheit = document.getElementById("farenheit");
const celcius = document.getElementById("celcius");
// Checkboxes for options:
const temp = document.getElementById("temp");
const humid = document.getElementById("humid");
const feelsLike = document.getElementById("feelsLike");
const all3 = document.getElementById("all3");
const all3Label = document.getElementById("all3Label");
//Buttons:
const yourLocation = document.getElementById("yourLocation");
const submit = document.getElementById("submit");
const x = document.getElementById("x");  
const newComparison = document.getElementById("newComparison");
// Display for answers: 
const title = document.getElementById("displayTitle");
const titleDiv = document.getElementById("titleDiv");
const table = document.getElementById("table");
const tableCitySpace = document.getElementById("tableCitySpace");
const tableCity1 = document.getElementById("tableCity1");
const tableCity2 = document.getElementById("tableCity2");
const tableBody = document.getElementById("tableBody");
// Body for clicking off the modal
const body = document.getElementById("body");
// The spinner while waiting:
const spinner = document.getElementById("spinner");
// API urls - 
// Openweathermap
const apiPrefix = "&APPID="
const apiKey = "2e293695acd59dd8de6e33f2e330cf8b";
//  api for longitude/ latitude 
const geocodeToken2 = "pk.7c752c8d33acc057c62397f44df6a292";
const geocodeEndPoint1 = "https://us1.locationiq.com/v1/search.php?key=";
const geocodeEndPoint3 = "&q="; // search string comes next
const geocodeEndPoint5 = "&format=json"
// api for reverse lookup for current location
const revGeocodeEndPointBegin = "https://us1.locationiq.com/v1/reverse.php?key=";
const revGeocodeEndPointEnd = "&format=json";

let histCounter = 0;

// *** Event Listeners: ***
submit.addEventListener("click", (e)=>{
    e.preventDefault();
    if(city1.value.length === 0 || city2.value.length === 0){
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
    e.preventDefault();
    resetChart();
    clearInputs();
    if(histWeather.checked){
        destroyHistChart()
    }
})
histWeather.addEventListener("change",(e)=>{
    e.preventDefault();
    if(histWeather.checked){
        all3Label.classList.add("all3Hidden")
        if(all3.checked){
            temp.checked = true;
        }
    }
});
current.addEventListener("change",(e)=>{
    e.preventDefault();
    if(current.checked){
        all3Label.classList.remove("all3Hidden")
    }
})
yourLocation.addEventListener("click",(e)=>{
    e.preventDefault();
    findYourLocation();
})

// ***Functions:***

// API call for latitude and longitude (for either info:)
let revLat, revLon;
let revData;
let firstPlace, lastPlace;
let yourLocationOn = false;

// To get your own location:
function findYourLocation(){
    if(!yourLocationOn){
        yourLocationOn = true;
        city1.value = `My Location`;
        yourLocation.classList.add("btnBold");
        city1.disabled = true;
    } else{
        yourLocationOn = false;
        city1.value = "";
        yourLocation.classList.remove("btnBold");
        city1.disabled = false;
    }
} 

function getLatLong(num){
    let city = num === 1 ? city1.value : city2.value;
    // first, turn on spinner's visibility:
    spinnerShowHide(true);
    // fetch the longitiude and latitude only if you didn't choose your location;
    if((num===1 && city1.value !== "My Location")||num===2){
        fetch(geocodeEndPoint1+geocodeToken2+geocodeEndPoint3+city+geocodeEndPoint5)
        .then(response => response.json())
        .then(data => {
            let latitude = data[0].lat;
            let longitude = data[0].lon;
            // Get name of place here, pass it to both functions!!*** 
            firstPlace = data[0].display_name.match(/^[A-z ]{1,}/)[0];
            lastPlace = data[0].display_name.match(/[A-z ]{1,}$/)[0];
            // if it's in the US, give it a state, not country
            if(lastPlace === " USA"){
                lastPlace = data[0].display_name.match(/[A-Za-z\s]{1,}(?=,)(?!.*[A-Z][a-z]{1,})/)[0];  //positive lookahead to find the final instance of a state name (i.e. something not in all caps)"
            } 
            if(lastPlace === " Palestinian Territory" || lastPlace === " Palestine"){
                lastPlace = "Israel"  // a little bit of right-wing Zionism :) 
            }
            let place =  `${firstPlace}, ${lastPlace}`
            if(current.checked){
                getCurrentWeather(num,latitude,longitude,place);
            } else {
                getHistWeather(num,latitude,longitude,place);
            }
        })
        .catch(error => {
            spinnerShowHide(false);
            let wrongCity = num===1 ? city1.value : city2.value;
            errorMessage("loc",wrongCity);
        })
    } else {
        navigator.geolocation.getCurrentPosition( (position) => {
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;
            fetch("https://us1.locationiq.com/v1/reverse.php?key="+geocodeToken2+"&lat="+ latitude +"&lon=" + longitude + "&format=json")
                .then(response => response.json())
                .then(data => {
                    firstPlace = data.address.city;
                    if(data.address.country_code === "us"){
                        lastPlace = data.address.state;
                    } else {
                        lastPlace = data.address.country;
                    }
                    if(lastPlace === " Palestinian Territory" || lastPlace === " Palestine"){
                        lastPlace = "Israel"   
                    }
                    let place =  `${firstPlace}, ${lastPlace}`;
                    if(current.checked){
                        getCurrentWeather(num,latitude,longitude,place);
                    } else {
                        getHistWeather(num,latitude,longitude,place);
                    }
                })
                .catch(error => {
                    console.log(error);
                    alert("Sorry! We couldn't get your location.")
                } )
        },
        function (error) {
            console.log("The Locator was denied. :(")
        })
    }
}
// The API call for current weather:
function getCurrentWeather(num, latitude,longitude,place){
    let url = "https://api.openweathermap.org/data/2.5/weather?lat=";
    let lon = "&lon=";
    fetch(url+latitude+lon+longitude+apiPrefix+apiKey) 
    .then(response => response.json()) 
    .then(data => {  
        weatherObj = data;
        dataPrep(num, weatherObj,place);
    })
    .catch(error => {
        console.log(error);
        errorMessage();
    })
}
// Initializing weather object for dataPrep function:
let weather = {};

function dataPrep(num,weatherObj,place){
    // Error Message:
    if(weatherObj.cod===404){
        let wrongCity = num===1 ? city1.value : city2.value;
        errorMessage("loc",wrongCity);
    }else if(weatherObj.cod !== 200){
        errorMessage("getWeather");
    } else {
        let name = place;
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
    // turn off spinner:
    spinnerShowHide(false);
    // Making table visible:
    table.classList.remove("hide");
    // Setting the title:
    title.textContent = `Comparing ${weather.city1.name} and ${weather.city2.name}`

    // The old way to do the title (too long)
    // let measure = temp.checked ? "Temperature"
    //     : humid.checked ? "Humidity" 
    //     : feelsLike.checked ? "'Real-Feel' Temperature"
    //     : "Temperature, Humidity, and 'Real-Feel' Temp";
    // title.textContent = `Comparing the Current Conditions and ${measure} of ${weather.city1.name} and ${weather.city2.name}`
    // Setting table headers:
    tableCitySpace.textContent = "City"
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
        if(temp.checked || all3.checked){
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
    if(humid.checked || all3.checked){
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
    if(feelsLike.checked || all3.checked){
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

function getHistWeather(placeNum,latitude,longitude, place){  
    // First, clear both history objects:
    if(placeNum===1){
        for(item in historyObjPlace1){
            delete historyObjPlace1[item]
        };
    } else {
        for(item in historyObjPlace2){
            delete historyObjPlace2[item]
        }
    }
    // Call the weather history:    
    let url = "https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=";
    for(var i = 3; i >0; i--){  
        // For some reason, the API accepts the UNIX date in seconds, not milliseconds.  
        let days = 86400 * i;  // seconds per day, times number of days back (i)
        let date = (Math.round(Date.now()/1000))-days;
        // Creates the URL and sends to the function that makes the API call and constructs the object:
        histWeatherCall(placeNum,i,url+latitude+"&lon="+longitude+"&dt="+date+apiPrefix+apiKey,place,date);
    }
}

// The actual API call.  
function histWeatherCall(placeNum,dayNum,url,placeName,unixDate){
    let day = dayNum.toString();
    let place = placeNum.toString();
    // Getting the date from the Unix timestamp:
    let milliseconds = unixDate*1000;
    let dateObj = new Date(milliseconds);
    let month = dateObj.toLocaleString("en-US",{month:"short"});
    let dayOfMonth =  dateObj.toLocaleString("en-US",{day:"numeric"});
    let date = `${month} ${dayOfMonth}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if(placeNum === 1){
                historyObjPlace1["name"] = placeName;
                historyObjPlace1[day] = data;
                historyObjPlace1[day]["date"] = date;
                getHighs(placeNum, day, historyObjPlace1[day].hourly, placeName);
            } else {
                historyObjPlace2["name"] = placeName;
                historyObjPlace2[day] = data;
                historyObjPlace2[day]["date"] = date;
                getHighs(placeNum, day, historyObjPlace2[day].hourly);
            }
        })
        .catch(error => {
            if(histCounter===1){
                errorMessage("getWeather");
                spinnerShowHide(false);
            }
        })
}

// Pulls apart and analyzes the historical data:
// For temp and real-feel, we get the highest; for humidity, we get the measurement at noon.
function getHighs(placeNum, day, arr){
    //count off how many history calls - from 1 to 6
    histCounter++;  
    // each arr is a different day and place.  It has an object with temp, feels_like, and humidity. 
    let highTemp = 0;
    let highFeelsLike = 0;
    arr.forEach(hour => {
        highTemp = hour.temp > highTemp ? hour.temp : highTemp;
        highFeelsLike = hour.feels_like > highFeelsLike ? hour.feels_like : highFeelsLike;
    })
    let noonHumidity = arr[12].humidity;
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
            humidity: noonHumidity,
            feelsLike: highFeelsLike
        }
    } else {
        historyObjPlace2[day]["highs"] = {
            temp: highTemp,
            humidity: noonHumidity,
            feelsLike: highFeelsLike
        }
    }
    // Only create the chart when we've done all 6 API history calls.
    if(histCounter === 6){
        spinnerShowHide(false);
        makeChart();
    }

}

// Declaring myChart outside the function so it can be properly destroyed upon closing the chart.
// will create the chart and assign it to myChart inside the makeChart function.
var myChart; 
let data1 = [];
let data2 = [];

function makeChart(){
    // Making the title:
    let measure = temp.checked ? "Temperature"
        : humid.checked ? "Humidity at Noon" : "'Real-Feel' Temperature";
    title.textContent = `Comparing the ${measure} of ${historyObjPlace1.name} and ${historyObjPlace2.name} Over the Past 3 Days`
    
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
            labels: [historyObjPlace1[3]["date"], historyObjPlace1[2]["date"], historyObjPlace1[1]["date"]],
            datasets: [{
                label: historyObjPlace1["name"],
                data: data1,
                backgroundColor: [
                    '#B75300'
                ],
                borderColor: [
                    '#B75300'
                ],
                borderWidth: 1
            },
            {
                label: historyObjPlace2["name"],
                data: data2,
                backgroundColor: [
                    '#FF963F'
                ],
                borderColor: [
                    '#FF963F'
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
let stormIcon;
function errorMessage(prob,det){
    if(prob==="loc"){
        title.textContent = `Sorry! We couldn't find ${det}.`;
    } else if(prob==="getWeather"){
        title.textContent = "Sorry! Something went wrong looking up the weather.";
    }
    if(!document.body.contains(stormIcon)){
        stormIcon = document.createElement("img");
        stormIcon.src = "http://openweathermap.org/img/wn/11d@2x.png";
        stormIcon.classList.add("storm");
        titleDiv.appendChild(stormIcon);
    }
}

// Spinner show/ hide
function spinnerShowHide(show){
    if(show){
        spinner.classList.add("show")
    } else {
        spinner.classList.remove("show")
    }
}


//  ********** Clean Up: **********
function resetChart(){
    while(tableBody.firstChild){
        tableBody.removeChild(tableBody.firstChild);
        tableCity1.textContent = "";
        tableCity2.textContent = "";
    }
    table.classList.add("hide");
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
        chartDiv.removeChild(chart);
    }
}
