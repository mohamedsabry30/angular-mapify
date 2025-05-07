import { Component, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as L from 'leaflet';

// Set default Icon Image marker
const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements AfterViewInit {
  map: any;
  mapEvent: any;
  schedule: any[] = [];
  currentPosition: any;
  formView: boolean = false;
  markers: any = {};

  // Form Group
  todoForm = new FormGroup({
    day: new FormControl(null, [Validators.required]),
    month: new FormControl(null, [Validators.required]),
    year: new FormControl(null, [Validators.required]),
    title: new FormControl(null, [Validators.required]),
  });

  getPosition() {
    if (navigator.geolocation) {
      //==> getCurrentPosition(callbackfunc(position))
      navigator.geolocation.getCurrentPosition(this.initMap.bind(this), () =>
        console.log(`couldn't fetch position`)
      );
    } else alert("this browser doesn't have geolocation API");
  }

  initMap(position: any): void {
    // Make map in position
    this.currentPosition = position;
    const { latitude, longitude } = position.coords;
    this.map = L.map('map', {
      center: [53.5939, 9.9724],
      zoom: 17,
    });

    // Create map tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    // Add circular marker
    L.circleMarker([53.5939, 9.9724], {
      radius: 10,
      fillOpacity: 0.9,
    })
      .addTo(this.map)
      .bindPopup('your are here')
      .openPopup();

    // Adding a click handler
    // this.map.on('click', this._callClickedmarker.bind(this));
    this.map.on('click', this.showForm.bind(this));
  }

  showForm(mapE: any) {
    this.mapEvent = mapE;
    this.formView = true;
  }

  todoFormSubmit(todoData: FormGroup) {
    // get form data + mapE coords and set new todo object
    const { lat, lng } = this.mapEvent.latlng;
    let todo = todoData.value;
    const id = (Date.now() + '').slice(-10);
    todo.id = id;
    todo.coords = [lat, lng];

    // add todod map marker
    this.addMarker(todo);

    // add todo object to schedule array
    this.schedule.push(todo);
    console.log('schedule is working', this.schedule);

    // render schedule on list view

    // hide form + clear inputs field
    this.hideForm();

    // save schedule in local storage
  }

  hideForm() {
    this.todoForm.reset();
    this.formView = false;
  }

  addMarker(todo: any) {
    const marker = L.marker(todo.coords).bindPopup(`${todo.title}`, {
      // minWidth: 100,
      maxWidth: 250,
      autoClose: false,
      closeOnClick: false,
      className: `clicked-popup`,
    });
    marker.addTo(this.map).openPopup();
    // add to markers array
    this.markers[todo.id] = marker;
  }

  moveToPopup(todo: any) {
    this.map.setView(todo.coords, 17, {
      animate: true,
      pan: { duration: 1.5 },
    });
  }

  delete(e: Event, todo: any) {
    e.stopPropagation();
    // delete marker
    const id = todo.id;
    this.markers[id].remove();
    delete this.markers[id];

    // delelte data from list
    const itemToDelete = this.schedule.find((el) => el.id === id);
    const index = this.schedule.indexOf(itemToDelete);
    if (index > -1) {
      // only splice array when item is found
      this.schedule.splice(index, 1); // 2nd parameter means remove one item only
    }
  }

  ngAfterViewInit(): void {
    this.getPosition();
  }
}

// test() {
//   this.formView = !this.formView;
//   console.log('formview', this.formView);
// }

// _currentPositionMarker(map: L.Map) {
//   // Add circular marker
//   L.circleMarker([53.5939, 9.9724], {
//     radius: 10,
//     fillOpacity: 0.9,
//   })
//     .addTo(map)
//     .bindPopup('your are here')
//     .openPopup();
// }

// _addMarker(map: L.Map) {
//   L.marker([53.5954, 9.9687])
//     .addTo(map)
//     .bindPopup(`clicked here`, {
//       minWidth: 100,
//       maxWidth: 250,
//       autoClose: false,
//       closeOnClick: false,
//       className: `clicked-popup`,
//     })
//     .openPopup();
// }

// _addClickedMarker(mapEvent: any, map: L.Map) {
//   // adding a marker on map
//   const { lat, lng } = mapEvent.latlng;
//   console.log(lat, lng);
//   L.marker([lat, lng])
//     .addTo(map)
//     .bindPopup(`clicked here`, {
//       minWidth: 100,
//       maxWidth: 250,
//       autoClose: false,
//       closeOnClick: false,
//       className: `clicked-popup`,
//     })
//     .openPopup();
// }
