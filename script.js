'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// 1. How to get the Geolocation - navigator.geolocation.getCurrentPosition
// -- takes in 2 functions , 1st what happens when you get the current position- uses the position argument , 2nd is what happens when it cant get your location.
// -- created an alert to let people know when current position is unattainable
// --create variable{latitude}/{longitude} from the coords attained from the 'position' - console.log(position)
// -- go to google maps and create a template literal and assign the attained latitude and longitude to the template - use console.log to check it.
// using leaflet to display a 3rd party library - go to leaflet.com download page , copy url for hosted version ( or npm manager) and paste urls in the html document and remember to 'defer' the js script in the header. go back to Leafy.com / overview page and copy the js to create the marker and past it in the 'received successful' part of the getCurrentPosition function - then adapt it to our current situation -  (l.map(''name of html element') - create array with lat and long like in setView[lat,long] - replace setView and L.marker with newly created coords array

// 2. Displaying a marker - use map.on as an event listener for the map - use console.log to check if working  - create {lat,lng} object, destructure and link to map.Event - move l.marker into mapOn function, change coords to const {lat,lng}
// going to edit the bindPopup function so the markers tags dont disappear when a new click is performed - add function L.Popup to the bindPopup function and then add option retrieved from the doc section of leafy.com to an object inside the L.Popup function.
// display content in the tag  - use setPopupContent in the marker function

// 3. Rendering the Workout form
// using DOM manipulation to render the form visible when map is clicked

class Workout {
  //need a date and new id when new workout is created
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;
  constructor(coords, distance, duration) {
    // 3 arguments that are common parent to child
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
    
  }

  _setDescription() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;

    // created a template literal to insert in the html to set the description, takes the workout type changes the first letter to uppercase .
    // this.date.get month returns month via 0-11, we can use the numbering system to like it to the month in our months array
  }
  click(){
    this.clicks++;
  }
}

class Running extends Workout {
  //makes running the child of workout
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    //add new arguments
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    //creating calcPAce function
    this.pace = this.duration / this.distance; // create this.place variable
    return this.pace; // remember to return the values if they are being called elsewhere
  }
}

class Cycling extends Workout {
  //makes running the child of workout
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    //add new arguments
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([26, 28], 5.2, 24, 178);
// const cycling1 = new Cycling([26, 28], 27, 95, 523);
// console.log(run1, cycling1);

//////////////////////////////////////////////////////////////////////
// refactoring for OOPS
// 1. create the class APP according to the 'Architecture plan.
// 2. start splitting up your functions into appropriate sections.start at top
// 3.copy the complete if statement used to get the position and past in the _get position function.
// 4.take the navigator.geolocation.getCurrentPosition call back function used to load the map and place it in the _loadMap function. get rid of function key word and place the argument into the _loadMap argument then go back to _getPosition function and set the 'successfully found coords' section and replace it with the this._loadMap function parameter and dont forget to bind the 'this key word to object so the rest of your 'this' keywords refer to the Object and dont come back undefined.( as in a regular function call the this keyword is set to undefined, hence it needs to be set)
// 5. we need to get the position as a new app is created , therefor we need to call  the _getPosition function in the constructor function of the Class App. dont forget to change it to the this key word of the current object. ie - this._getPosition().
// load map triggers the constructor which then gets the position and then loads the map.
// need to move the globally declared variables(map, mapEvents) inside the Class App and declare them as private properties  - copy and paste them above the constructor function and remember the #. then go back into your code and change .map to 'this.#map' and mapEvent to this.#mapEvent
// 6. now we want to work with the event listeners , we need to move them to the constructor function so that they can be executed when they page is loaded - refactor code and move the pasted form submit function to the _newWorkout as well as the marker. dont forget to move the argument to the new function - remember change the the function on the form event listener in the constructor to the newly made function inside the class, bind the this keyword from the app to the function as it will be set to the form because event handler function will ALWAYS have the 'this' keyword of the DOM element onto which it is attached  - change all the map and mapEvents to point to 'this'
// 7. now we want to show the form, so move the click on map event listener to the _showForm function, remember the argument and now modify original event listener to take in newly made _showForm function and bind the app keyword to the this key word because an event handler function will ALWAYS have the 'this' keyword of the DOM element onto which it is attached
// 8.Repeat the same procedure for the InputType event listener and place it inside the toggleElevation function - this event handler doesn't use the this keyword so no need to bind it to the app in the function
// 9. remove unwanted global variables now

// an event handler function will ALWAYS have the 'this' keyword of the DOM element onto which it is attached//

class App {
  #map;
  #mapEvent;
  #workouts = [];
  #mapZoomLevel = 13;
  

  constructor() {
    // get users position
    this._getPosition();

    // get data from local storage
      this._getLocalStorage();

    // attach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this) )
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert(`could not find your current position`);
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(`https://www.google.com/maps/@-${latitude},${longitude},13z`);

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling the clicks on the map
    this.#map.on('click', this._showForm.bind(this));


    // render the markers from local storage on the map  after the map has loaded
      this.#workouts.forEach( work => { 
         this._renderWorkoutMarker(work)
    })
  
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  //   _newWorkout(e) {
  //     e.preventDefault();
  //     inputDistance.value =
  //       inputDuration.value =
  //       inputCadence.value =
  //       inputElevation.value =
  //         '';

  //     const { lat, lng } = this.#mapEvent.latlng;

  //     L.marker({ lat, lng })
  //       .addTo(this.#map)
  //       .bindPopup(
  //         L.popup({
  //           maxWidth: 250,
  //           minWidth: 100,
  //           autoClose: false,
  //           closeOnClick: false,
  //           className: 'running-popup',
  //         })
  //       )
  //       .setPopupContent('Workout')
  //       .openPopup();
  //   }
  // }

  //  const app = new App();

  // creating a new form
  // 1. go to function that creates a newWorkout
  // 2. make a list of what needs to happen when a new workout is created

  _newWorkout(e) {
    // creating a  helper function to replace the duplicate number checking if statement in both the running and cycling object

    // (...) rest operator turns it into an array - creating a function which creates an array from the inputs, then we loop over the array with the every method which only returns true if every input is a number.
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    // another helper function to check if the numbers are positive numbers
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();
    // ---get data from form
    const type = inputType.value;
    const distance = +inputDistance.value; // use + to convert to number
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    //  ---if workout is running , create running object
    if (type === 'running') {
      //check if type is running (from html)
      const cadence = +inputCadence.value;
      // ---check if the data is valid -check if number
      // if(!Number.isFinite(distance)|| !Number.isFinite(duration)|| !Number.isFinite(cadence)){
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert(`Inputs have to be positive numbers!`);

      workout = new Running([lat, lng], distance, duration, cadence);
      console.log(workout);
    }

    //  ---if workout is cycling , create cycling object
    if (type === 'cycling') {
      //check if type is cycling (from html)
      const elevation = +inputElevation.value;
      // ---check if the data is valid - checking if distance/duration/elevation are numbers
      // if(!Number.isFinite(distance)|| !Number.isFinite(duration)|| !Number.isFinite(elevation)){
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert(`Inputs have to be positive numbers!`);

      workout = new Cycling([lat, lng], distance, duration, elevation);
      console.log(workout);
    }
    // ---add new object to the workout array
    this.#workouts.push(workout);
    // ---render workout on the map as a marker
    this._renderWorkoutMarker(workout);

    // --- render workout on the list
    this._renderWorkout(workout); // created a function thats going to do DOM manipulation on the html

    // --- Hide the form and clear input fields
    this._hideForm();

    // --- Set local storage to all workouts
    this._setLocalStorage();

  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === 'running')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;

    if (workout.type === 'cycling')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;

    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e){
    const workoutEL = e.target.closest('.workout')//selecting the parent element , anywhere i click on the running activity , it provides me with the id and i can use the id to locate the appropriate marker
    // console.log(workoutEL);

    if(!workoutEL){
       return; //stops the click from returning null when clicked outside the running activity on the form
    
      };
    const workout = this.#workouts.find( work => work.id === workoutEL.dataset.id);
    // using the find method to find the workout element where there dataset id matches the work.id
    // console.log(workout);

    this.#map.setView(workout.coords,this.#mapZoomLevel ,{
      animate: true,
      pan: {
        duration:1,
      }
    } );
     // setView ( first argument are the set of coords and second the zoom size)
    
    
    //Using the public interface to interact and count how many times the user clicks on the activity
    
    //  workout.click();
  }
  _setLocalStorage(){//dont you for large amounts of data
    localStorage.setItem('workouts', JSON.stringify(this.#workouts))// name of workout and then convert workouts to a string and save in local storage
  }

  _getLocalStorage(){

    const data = JSON.parse(localStorage.getItem('workouts'));//get the workouts from local storage and convert back into an object
    // console.log(data);

    if(!data) return; //guard clause , if no data return

    this.#workouts = data

    this.#workouts.forEach( work => { 
      this._renderWorkout(work);
      })

  }


  // can now use app.reset() in console to get rid of local storage
  reset(){
    localStorage.removeItem('workouts');// removes workouts object from teh localStorage
    location.reload(); // reloads the page
  }


}
const app = new App();



/////////////////////////////////////////////////////////////////////////

// let map, mapEvent; //adding map to global scope

// if (navigator.geolocation)
//   //check if nav.geo exists

//   navigator.geolocation.getCurrentPosition(
//     function (position) {
//       //   console.log(position);
//       const { latitude } = position.coords;
//       const { longitude } = position.coords;
//       console.log(`https://www.google.com/maps/@-${latitude},${longitude},13z`);

//       const coords = [latitude, longitude];

//       // ('map') must be the name of an html element
//       map = L.map('map').setView(coords, 13); // 13 size of map view - change const to let to and make it global scoped

//       L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
//         attribution:
//           '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//       }).addTo(map);

//       //   Handling clicks on the map
//       map.on('click', function (mapE) {
//         mapEvent = mapE; //create mapEvent in global scope and link to function
//         form.classList.remove('hidden'); //remove hidden class from the hHTML when map is clicked
//         inputDistance.focus(); // focus the cursor on the Distance input

//         console.log(mapEvent); //- worked creating event in the console , now going to use the generated coords(latlng) to place a marker on the map

//         // const { lat, lng } = mapEvent.latlng;

//         // L.marker({lat, lng})
//         //   .addTo(map)
//         //   .bindPopup(L.popup({
//         //     maxWidth: 250,
//         //     minWidth: 100,
//         //     autoClose:false, //stops closing behavior when user crates another Popup
//         //     closeOnClick:false,//stop closing behavior when user clicks on the map
//         //     className: 'running-popup',//adding className from css to apply style to marker

//         //   }))
//         //   .setPopupContent('Workout')//setting content in tag on marker
//         //   .openPopup();
//       });
//     },
//     function () {
//       alert(`could not find your current position`);
//     }
//   );

// add an even listener to use the inputted data and log it to the map via the tag

// form.addEventListener('submit', function (e) {
//   e.preventDefault(); // stop marker from disappearing when page reloads

//   // clearing the input fields
//   inputDistance.value =
//     inputDuration.value =
//     inputCadence.value =
//     inputElevation.value =
//       '';

//   // Displaying the marker - copy and Paste from above and then add encapsulated variables to global scope - use let - eg map, mapEvent.latlng
//   const { lat, lng } = mapEvent.latlng;

//   L.marker({ lat, lng })
//     .addTo(map)
//     .bindPopup(
//       L.popup({
//         maxWidth: 250,
//         minWidth: 100,
//         autoClose: false, //stops closing behavior when user crates another Popup
//         closeOnClick: false, //stop closing behavior when user clicks on the map
//         className: 'running-popup', //adding className from css to apply style to marker
//       })
//     )
//     .setPopupContent('Workout') //setting content in tag on marker
//     .openPopup();
// });

// // Listening for addEventListener from from when changing running to cycling on the form

// inputType.addEventListener('change', function () {
//   // selecting the closest parent element(DOM traversal) to the form__row--hidden and display which ever one isn't hidden

//   inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
//   inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
// });
