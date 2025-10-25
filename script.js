(function () {
  const apiKeys = {
    weatherAPI: "a9f6d0c35cf7463d97c185107252310",
    visualCrossing: "D5W8VDPZAFFDNTWSY2S3MW5MF",
  };

  const DOM = {
    unitGroupInput: document.querySelector("#unitGroup"),
    searchInput: document.querySelector("#searchInput"),
    searchButton: document.querySelector("#searchButton"),
    currentInfoHeader: document.querySelector("#currentInfoHeader"),
    suggestionListElement: document.querySelector("#suggestionList"),
    currentDataDiv: document.querySelector("#currentInfoData"),
    currentIconDiv: document.querySelector("#currentInfoIcon"),
    dailyWeatherCardsDiv: document.querySelector("#dailyWeatherCards"),
    addressFoundDiv: document.querySelector("#addressFound"),
  };

  searchWeather("onLoad");

  DOM.searchButton.addEventListener("click", () => searchWeather("onSearch"));

  DOM.searchInput.addEventListener("input", (search) => citySearch(search));

  function citySearch(search) {
    DOM.suggestionListElement.innerHTML = "";

    if (!search.target.value) {
      return;
    }

    const searchedLocation = search.target.value;
    const apiURL =
      "https://api.weatherapi.com/v1/search.json?key=" +
      apiKeys.weatherAPI +
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
        DOM.searchInput.value = bt.target.textContent;
        DOM.suggestionListElement.innerHTML = "";
      };
      liElement.appendChild(buttonElement);
      DOM.suggestionListElement.appendChild(liElement);
    });
  }

  function searchWeather(callType) {
    const apiURL =
      "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
    let searchedLocation;
    if (callType === "onSearch" && DOM.searchInput.value) {
      searchedLocation = DOM.searchInput.value;
    } else if (callType === "onLoad") {
      searchedLocation = "Barcelona";
    } else {
      console.error("Search Failed");
      return;
    }
    const unitGroup = DOM.unitGroupInput.value;

    fetch(
      apiURL +
        searchedLocation +
        "?unitGroup=" +
        unitGroup +
        "&key=" +
        apiKeys.visualCrossing +
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
        updateDOM(response);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function updateDOM(response) {
    const unitGroup = DOM.unitGroupInput.value;
    const units = getUnits(unitGroup);

    clearDOM();

    const address = response.resolvedAddress;
    const addressH1 = document.createElement("h1");
    addressH1.textContent = "Results for: " + address;
    DOM.addressFoundDiv.appendChild(addressH1);

    renderCurrentWeather(response, units);

    render5DayForecast(response, units);
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
        DOM.searchInput.contains(event.target)
      )
    ) {
      DOM.suggestionListElement.innerHTML = "";
    }
  }

  function renderCurrentWeather(response, units) {
    const currentConditions = response.currentConditions;
    const currentDate = new Date(
      response.currentConditions.datetimeEpoch * 1000
    );
    const formattedCurrentDate = currentDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const currentDateElement = document.createElement("h3");
    currentDateElement.textContent = formattedCurrentDate;

    const currentTempDiv = createInfoBlock(
      "Temperature",
      `${currentConditions.temp} ${units.temp}`
    );

    const currentHumidityDiv = createInfoBlock(
      "Humidity",
      `${currentConditions.humidity} %`
    );

    const currentWindSpeedDiv = createInfoBlock(
      "Wind Speed",
      `${currentConditions.windspeed} ${units.wind}`
    );

    DOM.currentInfoHeader.appendChild(currentDateElement);
    DOM.currentDataDiv.appendChild(currentTempDiv);
    DOM.currentDataDiv.appendChild(currentHumidityDiv);
    DOM.currentDataDiv.appendChild(currentWindSpeedDiv);

    const currentWeatherDescription = document.createElement("h3");
    currentWeatherDescription.textContent = currentConditions.conditions;
    DOM.currentInfoHeader.appendChild(currentWeatherDescription);

    const currentIcon = document.createElement("img");
    currentIcon.id = "liveWeatherIcon";
    currentIcon.src = `./svgs/${currentConditions.icon}.svg`;
    DOM.currentIconDiv.appendChild(currentIcon);
  }

  function render5DayForecast(response, units) {
    const nextDaysConditions = response.days.slice(1, 6);

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

      DOM.dailyWeatherCardsDiv.appendChild(dailyCard);
    });
  }

  function clearDOM() {
    DOM.currentDataDiv.innerHTML = "";
    DOM.currentIconDiv.innerHTML = "";
    DOM.dailyWeatherCardsDiv.innerHTML = "";
    DOM.addressFoundDiv.innerHTML = "";
    DOM.currentInfoHeader.innerHTML = "";
  }
})();
