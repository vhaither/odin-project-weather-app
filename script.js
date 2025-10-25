const apiKeyWeatherAPI = "a9f6d0c35cf7463d97c185107252310 ";
const apiKeyVisualCrossing = "D5W8VDPZAFFDNTWSY2S3MW5MF";

const unitGroupInput = document.querySelector("#unitGroup");
const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchButton");
const currentInfoHeader = document.querySelector("#currentInfoHeader");
const suggestionListElement = document.querySelector("#suggestionList");
const currentDataDiv = document.querySelector("#currentInfoData");
const currentIconDiv = document.querySelector("#currentInfoIcon");
const dailyWeatherCardsDiv = document.querySelector("#dailyWeatherCards");
const addressFoundDiv = document.querySelector("#adressFound");

searchWeather("onLoad");

searchButton.addEventListener("click", () => searchWeather("onSearch"));

searchInput.addEventListener("input", (search) => citySearch(search));

function citySearch(search) {
  suggestionListElement.innerHTML = "";

  if (!search.target.value) {
    return;
  }

  console.log(search.target.value);
  const searchedLocation = search.target.value;
  const apiURL =
    "https://api.weatherapi.com/v1/search.json?key=" +
    apiKeyWeatherAPI +
    "&q=" +
    searchedLocation;

  fetch(apiURL, {
    method: "GET",
    headers: {},
  })
    .then((response) => response.json())
    .then((data) => searchModal(data));
}

function searchModal(data) {
  console.log(data);
  data.forEach((result) => {
    if (!result.name) {
      return;
    }
    const cityName = result.name;
    const regionName = result.region ? ", " + result.region : "";
    const countryName = result.country ? ", " + result.country : "";
    const liElement = document.createElement("li");
    liElement.className = "searchResult";
    const buttonElement = document.createElement("button");
    buttonElement.type = "button";
    buttonElement.className = "searchResultButton";
    buttonElement.textContent = cityName + regionName + countryName;
    buttonElement.onclick = function (bt) {
      searchInput.value = bt.target.textContent;
      suggestionListElement.innerHTML = "";
    };
    liElement.appendChild(buttonElement);
    suggestionListElement.appendChild(liElement);
  });
}

function searchWeather(callType) {
  const apiURL =
    "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
  let searchedLocation;
  if (callType === "onSearch" && searchInput.value) {
    searchedLocation = searchInput.value;
  } else if (callType === "onLoad") {
    searchedLocation = "Barcelona";
  } else {
    console.log("Search Failed");
    return;
  }
  const unitGroup = unitGroupInput.value;

  fetch(
    apiURL +
      searchedLocation +
      "?unitGroup=" +
      unitGroup +
      "&key=" +
      apiKeyVisualCrossing +
      "&iconSet=icons2" +
      "&contentType=json",
    {
      method: "GET",
      headers: {},
    }
  )
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      updateDOM(response);
    })
    .catch((err) => {
      console.error(err);
    });
}

function updateDOM(response) {
  const unitGroup = unitGroupInput.value;
  const units = getUnits(unitGroup);

  currentDataDiv.innerHTML = "";
  currentIconDiv.innerHTML = "";
  dailyWeatherCardsDiv.innerHTML = "";
  addressFoundDiv.innerHTML = "";
  currentInfoHeader.innerHTML = "";

  const address = response.resolvedAddress;
  const currentConditions = response.currentConditions;
  const nextDaysConditions = response.days.slice(1, 6);

  const currentDate = new Date(response.currentConditions.datetimeEpoch * 1000);
  const formattedCurrentDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const addressH1 = document.createElement("h1");
  addressH1.textContent = "Results for: " + address;

  const currentDateElement = document.createElement("h3");
  currentDateElement.textContent = formattedCurrentDate;

  const currentTempDiv = createInfoBlock(
    "Temperature",
    `${currentConditions.temp} ${units.temp}`
  );

  /*
  const currentThermicSensationDiv = createInfoBlock(
    "Thermic Sensation",
    `${currentConditions.feelslike} ${units.temp}`
  );
  */

  const currentHumiditynDiv = createInfoBlock(
    "Humidity",
    `${currentConditions.humidity} %`
  );

  const currentWindSpeedDiv = createInfoBlock(
    "Wind Speed",
    `${currentConditions.windspeed} ${units.wind}`
  );

  /*
  const rainProbDiv = createInfoBlock(
    "Precipitation Probability",
    `${currentConditions.precipprob} %`
  );
  */

  addressFoundDiv.appendChild(addressH1);
  currentInfoHeader.appendChild(currentDateElement);

  currentDataDiv.appendChild(currentTempDiv);
  //currentDataDiv.appendChild(currentThermicSensationDiv);
  currentDataDiv.appendChild(currentHumiditynDiv);
  currentDataDiv.appendChild(currentWindSpeedDiv);
  //currentDataDiv.appendChild(rainProbDiv);

  const currentWeatherDescription = document.createElement("h3");
  currentWeatherDescription.textContent = currentConditions.conditions;
  currentInfoHeader.appendChild(currentWeatherDescription);

  const currentIcon = document.createElement("img");
  currentIcon.id = "liveWeatherIcon";
  currentIcon.src = `./svgs/${currentConditions.icon}.svg`;
  currentIconDiv.appendChild(currentIcon);

  nextDaysConditions.forEach((day) => {
    const maxTemp = day.tempmax;
    const minTemp = day.tempmin;
    const description = day.conditions;

    const date = new Date(day.datetime);
    const monthDay = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const dailyCard = document.createElement("div");
    dailyCard.className = "dailyCard";
    const dailyCardHeaderDiv = document.createElement("div");
    dailyCardHeaderDiv.className = "dailyCardHeader";
    const dailyCardContent = document.createElement("div");
    dailyCardContent.className = "dailyCardContent";
    const dailyIconDiv = document.createElement("div");
    dailyIconDiv.className = "dailyCardIcon";
    const dailyDataDiv = document.createElement("div");
    dailyDataDiv.className = "dailyData";

    dailyCardContent.append(dailyIconDiv, dailyDataDiv);
    dailyCard.append(dailyCardHeaderDiv, dailyCardContent);

    const dailyIcon = document.createElement("img");
    dailyIcon.src = `./svgs/${day.icon}.svg`;
    dailyIcon.className = "dailyIcon";

    const maxTempElement = createInfoBlock(
      "Max Temp",
      `${maxTemp} ${units.temp}`
    );

    const minTempElement = createInfoBlock(
      "Min Temp",
      `${minTemp} ${units.temp}`
    );

    const dateElement = document.createElement("h3");
    dateElement.textContent = monthDay;

    const descriptionElement = document.createElement("h3");
    descriptionElement.textContent = description;

    dailyCardHeaderDiv.appendChild(dateElement);

    dailyCardHeaderDiv.appendChild(descriptionElement);
    dailyIconDiv.appendChild(dailyIcon);

    dailyDataDiv.appendChild(maxTempElement);
    dailyDataDiv.appendChild(minTempElement);

    dailyWeatherCards.appendChild(dailyCard);
  });
}

function getUnits(unitGroup) {
  switch (unitGroup) {
    case "metric":
      return {
        temp: "°C",
        wind: "km/h",
      };
    case "us":
      return {
        temp: "°F",
        wind: "mph",
      };
    case "uk":
      return {
        temp: "°C",
        wind: "mph",
      };
    default:
      return {
        temp: "",
        wind: "",
      };
  }
}

function createInfoBlock(label, value) {
  const div = document.createElement("div");
  const title = document.createElement("h3");
  const text = document.createElement("p");

  div.className = "infoBlocks";
  title.textContent = label;
  text.textContent = value;

  div.append(title, text);
  return div;
}

document.addEventListener("click", handleClickOutsideSuggestion);
const suggestionModal = document.querySelector("#suggestionModal");
function handleClickOutsideSuggestion(event) {
  if (
    !(
      suggestionModal.contains(event.target) ||
      searchInput.contains(event.target)
    )
  ) {
    suggestionListElement.innerHTML = "";
  }
}
