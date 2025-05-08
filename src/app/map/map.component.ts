import { Component, AfterViewInit, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ValueChangeEvent,
} from '@angular/forms';
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
export class MapComponent implements AfterViewInit, OnInit {
  map: any;
  mapEvent: any;
  schedule: any[] = [];
  currentPosition: any;
  formView: boolean = false;
  markers: any = {};

  // Form Group
  todoForm = new FormGroup({
    day: new FormControl(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(31),
    ]),
    month: new FormControl(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(12),
    ]),
    year: new FormControl(null, [Validators.required, Validators.min(2025)]),
    title: new FormControl(null, [Validators.required]),
  });

  getPosition() {
    if (navigator.geolocation) {
      //==> getCurrentPosition(callbackfunc(position))
      navigator.geolocation.getCurrentPosition(this.initMap.bind(this), () =>
        alert(`couldn't fetch position`)
      );
    } else {
      alert("this browser doesn't have geolocation API");
    }
  }

  initMap(position: any): void {
    // Make map in position
    this.currentPosition = position;
    const { latitude, longitude } = position.coords;
    this.map = L.map('map', {
      // center: [53.5939, 9.9724]
      center: [latitude, longitude],
      zoom: 16,
    });
    // Create map tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    // Add circular marker
    L.circleMarker([latitude, longitude], {
      radius: 10,
      fillOpacity: 0.9,
    })
      .addTo(this.map)
      .bindPopup('your are here', { className: `clicked-popup` })
      .openPopup();

    // Adding a click handler
    this.map.on('click', this.showForm.bind(this));

    // Rendering local storage schedule on map
    this.schedule.forEach((el) => {
      this.addMarker(el);
    });

    // move to current position
    const myPosition = { coords: [latitude, longitude] };
    this.moveToPopup(myPosition);
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

    // add todo map marker
    this.addMarker(todo);

    // add todo object to schedule array
    this.schedule.push(todo);

    // hide form + clear inputs field
    this.hideForm();

    // save schedule in local storage
    this.saveLocalStorage();
  }

  saveLocalStorage() {
    localStorage.setItem('schedule', JSON.stringify(this.schedule));
  }

  getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('schedule') || '[]');
    if (data.length == 0) return;
    this.schedule = data;
  }

  hideForm() {
    this.todoForm.reset();
    this.formView = false;
  }

  addMarker(todo: any) {
    const marker = L.marker(todo.coords).bindPopup(
      `<p>${todo.title} on </p>  <p>${todo.day}/${todo.month}/${todo.year}</p>`,
      {
        // minWidth: 100,
        maxWidth: 250,
        autoClose: false,
        closeOnClick: false,
        className: `clicked-popup`,
      }
    );
    marker.addTo(this.map).openPopup();

    // add to markers array
    this.markers[todo.id] = marker;
  }

  moveToPopup(todo: any) {
    this.map.setView(todo.coords, 16, {
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
      this.schedule.splice(index, 1);
      this.saveLocalStorage();
    }
  }

  ngOnInit(): void {
    this.getLocalStorage();
  }

  ngAfterViewInit(): void {
    this.getPosition();
  }
}
