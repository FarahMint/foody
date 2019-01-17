class ZOMATO {
  // structure request

  // 1 get the response
  constructor() {
    // constructor run each time class is instantiated
    this.api = `6dd9e9ab3fa055f98a3c101862a4785d`;

    this.header = {
      method: "GET",
      headers: {
        "user-key": this.api,
        "Content-Type": "application/json"
      },
      credentials: "same-origin"
    };
  }
  // set up for search api req

  async searchApi(city, categoryID) {
    // async searchApi() {
    //category URL
    const categoryURL = `https://developers.zomato.com/api/v2.1/categories`;
    //city URL
    const cityURL = `https://developers.zomato.com/api/v2.1/cities?q=${city}`;

    // get category data
    const categoryInfo = await fetch(categoryURL, this.header);
    const categoryJSON = await categoryInfo.json();
    const categories = await categoryJSON.categories;

    // get city data
    const cityInfo = await fetch(cityURL, this.header);
    const cityJSON = await cityInfo.json();
    const cityLocation = await cityJSON.location_suggestions;

    let cityID = 0;
    if (cityLocation.length > 0) {
      cityID = await cityLocation[0].id;
    }
    //  search restaurant
    const restaurantURL = `https://developers.zomato.com/api/v2.1/search?entity_id=${cityID}&entity_type=city&category=${categoryID}sort=rating `;
    // get city data
    const restaurantInfo = await fetch(restaurantURL, this.header);
    const restaurantJSON = await restaurantInfo.json();
    const restaurants = await restaurantJSON.restaurants;

    return {
      //  categories:categories
      categories,
      cityID,
      restaurants
    };
  }
}

class UI {
  // display
  // constructor run each time class is instantiated
  constructor() {
    this.loader = document.querySelector(".loader");
    this.restaurantList = document.querySelector("#restaurant-list");
  }

  // selection method
  addSelectionOptions(categories) {
    const search = document.querySelector("#seachCategory");
    // initial value for option - get back array
    let output = `<option value='0' selected>select category</option>`;

    categories.forEach(category => {
      output += `<option value= '${category.categories.id}' selected>${
        category.categories.name
      }</option>`;
    });
    // when doc load->populate box
    search.innerHTML = output;
  }

  //Feedback
  showFeedback(text) {
    const feedback = document.querySelector(".feedback");
    feedback.classList.add("showItem");
    feedback.innerHTML = `<p>${text}<p/>`;
    setTimeout(() => {
      feedback.classList.remove("showItem");
    }, 3000);
  }

  showLoader() {
    this.loader.classList.add("showItem");
  }
  hideLoader() {
    this.loader.classList.remove("showItem");
  }

  getRestaurants(restaurants) {
    this.hideLoader();
    //  check if category does not exist in city
    if (restaurants.length === 0) {
      this.showFeedback("No such categories exist in the selected city");
    } else {
      // console.log(restaurants[0].restaurant);
      // remove prev content if search successful
      this.restaurantList.innerHTML = "";

      restaurants.forEach(restaurant => {
        const {
          thumb: img,
          name,
          location: { address },
          user_rating: { aggregate_rating },
          cuisines,
          average_cost_for_two: cost,
          menu_url,
          url
        } = restaurant.restaurant;

        if (img !== "") {
          this.showRestaurant(
            img,
            name,
            address,
            aggregate_rating,
            cuisines,
            cost,
            menu_url,
            url
          );
        }
      });
    }
  }

  showRestaurant(
    img,
    name,
    address,
    aggregate_rating,
    cuisines,
    cost,
    menu_url,
    url
  ) {
    const div = document.createElement("div");
    div.classList.add("mx-auto", "my-3", "col-sm-6", "col-md-5", "col-lg-4");
    // div.classList.add("col-12", "mx-auto", "my-3", "col-md-6 ,col-sm-6 ,col-md-5 ,col-lg-6" );

    div.innerHTML += `
      <div class="card">
       <div class="card">
        <div class="row p-1">
         <div class="col-5">
          <img src=${img} class="img-fluid img-thumbnail" alt="">
         </div>
         <div class="col-5 text-capitalize">
          <h6 class="text-uppercase pt-2 redText">${name.substring(0, 15)}...
          </h6>
          <p>${address}</p>
         </div>
         <div class="col-1">
          <div class="badge badge-success">
          ${aggregate_rating}
          </div>
         </div>
        </div>
        <hr>
        <div class="row py-2 ml-1">
         <div class="col-5 text-uppercase ">
          <p>cuisines:</p>
          <p>cost for two:</p>
         </div>
         <div class="col-7 text-uppercase">
          <p>${cuisines}</p>
          <p>${cost}</p>
          
         </div>
        </div>
        <hr>
        <div class="row text-center no-gutters pb-3">
         <div class="col-6">
          <a href="${menu_url}" target="_blank" class="btn redBtn  text-uppercase"><i class="fas fa-book"></i> menu</a>
         </div>
         <div class="col-6">
          <a href="${url}" target="_blank" class="btn redBtn  text-uppercase"><i class="fas fa-book"></i>website </a>
         </div>
        </div>
       </div>
 `;

    this.restaurantList.appendChild(div);
  }
}

(function() {
  const searchForm = document.querySelector("#searchForm");
  const searchCity = document.querySelector("#searchCity");
  const searchCategory = document.querySelector("#seachCategory");

  //  create instances of 2 classes
  const zomato = new ZOMATO();
  const ui = new UI();

  //  add select option
  //  done once the DOM content loaded event fire
  document.addEventListener("DOMContentLoaded", () => {
    // logic goes here
    zomato
      .searchApi()
      .then(data => ui.addSelectionOptions(data.categories))
      .catch(err => {
        console.log(err);
      });
  });

  //  submit form
  searchForm.addEventListener("submit", e => {
    e.preventDefault();

    const city = searchCity.value.toLowerCase();
    //  we want to get back the category
    // what is the value of each seach catgeory
    //want it as a number
    const categoryID = parseInt(searchCategory.value);

    // console.log(city, categoryID);

    if (city === "" || categoryID === 0) {
      ui.showFeedback("Please enter a city and select a category");
    } else {
      // search for city that exist if city as Id return it
      zomato.searchApi(city).then(cityData => {
        console.log(cityData.cityID);

        if (cityData.cityID === 0) {
          ui.showFeedback("Please enter a valid city!");
        } else {
          // grab cityID & category
          // 1rst show loader
          ui.showLoader();
          zomato.searchApi(city, categoryID).then(data => {
            // console.log(data);
            ui.getRestaurants(data.restaurants);
          });
        }
      });
    }
  });
})();

//  select all form
//  target iput city
//  want search category

//  1 populate from the api all category available to us
//  when want to populate search category -> want to populate right away when the doc load

//  2 work with form submission
//  setup event listener whenever we are submitting the form
