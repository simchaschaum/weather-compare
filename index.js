// ***DOM Objects:***
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

// API urls - 
const url = "https://api.openweathermap.org/data/2.5/weather?q=";
const apiPrefix = "&APPID="
const apiKey = "2e293695acd59dd8de6e33f2e330cf8b";

// *** Event Listeners: ***
submit.addEventListener("click", (e)=>{
    e.preventDefault();
    // if(!temp.checked && !humid.checked && !feelsLike.checked){
        // title.textContent = "Please check at least one box for comparison."
    // } else {
        if(city1.value === "" || city2.value === ""){
            title.textContent = "Whoops! Looks like you're missing some info."
        } else {
            getWeather(1,url+city1.value+apiPrefix+apiKey);
            getWeather(2,url+city2.value+apiPrefix+apiKey);
        }
    // }
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
// The API call:
function getWeather(num, endpoint){
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.onreadystatechange = () => {
      if(xhr.readyState===XMLHttpRequest.DONE){
        // console.log(xhr.response);
        weatherObj = xhr.response;
        dataPrep(num, weatherObj);
      }
    }
    xhr.open('GET',endpoint);
    xhr.send();
}

// Initializing weather object for dataPrep function:
let weather = {};

function dataPrep(num,weatherObj){
    console.log(weatherObj);
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
    console.log(conditionIconCode);
 
    let cityObj = {
        name: name,
        temperature: farenheit.checked ? tempFar.toFixed(1)+String.fromCharCode(176) : tempCel.toFixed(1)+"&deg;",
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

function resetChart(){
    while(tableBody.firstChild){
        tableBody.removeChild(tableBody.firstChild);
    }
}
function clearInputs(){
    city1.value = "";
    city2.value = "";
}

/* To do:
1) * Title in JS - "comparing..."
2) Design answer display
- * What it will look like
- [What data can we get more than this minute? ] https://openweathermap.org/api/one-call-api#history
- *finish function display - how to display the data
- * on form, put radio buttons for fareinheit and celcius 
- for "new comparison - delete rows in table "  - use myObject.remove()  - https://www.w3schools.com/jsref/met_element_remove.asp
3) Get list of cities and put in dropdown
*/

