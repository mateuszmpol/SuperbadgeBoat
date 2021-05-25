import { LightningElement, api, wire, track } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';

export default class BoatsNearMe extends LightningElement {
    @api boatTypeId;
    @track mapMarkers = [];
    @track isLoading = true;
    @track isRendered = false;
    @track latitude;
    @track longitude;

    // Add the wired method from the Apex Class
    // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
    // Handle the result and calls createMapMarkers
    @wire(getBoatsByLocation, {latitude:'$latitude',longitude:'$longitude',boatTypeId:'$boatTypeId'})
    wiredBoatsJSON({error,data}) {
        if (data) {
            this.createMapMarkers(data);
        } else if (error) {
            this.dispatchEvent(new ShowToastEvent({
                title: ERROR_TITLE,
                message: error.body.message,
                variant: ERROR_VARIANT
            }));
            this.isLoading = false;
        }
    }

    // Controls the isRendered property
    // Calls getLocationFromBrowser()
    renderedCallback() {
        if (this.isRendered == false) {
            this.getLocationFromBrowser();
        }
        this.isRendered = true;
    }

    // Gets the location from the Browser
    // position => {latitude and longitude}
    getLocationFromBrowser() {
        navigator.geolocation.getCurrentPosition(position => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
        });
    }

    // Creates the map markers
    createMapMarkers(boatData) {
        const boatDataJSON = JSON.parse(boatData);
        const newMarkers = boatDataJSON.map(rowBoat => {
            const Latitude = rowBoat.Geolocation__Latitude__s;
            const Longitude = rowBoat.Geolocation__Longitude__s;
            return {
                location: { 
                    Latitude,
                    Longitude
                },
                title: rowBoat.Name,
                // description: `Coords: ${Latitude}, ${Longitude}`,
                icon: 'utility:anchor'
            };
        });
        newMarkers.unshift({
            location: {
                Latitude: this.latitude,
                Longitude: this.longitude
            },
            title: LABEL_YOU_ARE_HERE,
            icon: ICON_STANDARD_USER
        });
        this.mapMarkers = newMarkers;
        this.isLoading = false;

        // const boats = JSON.parse(boatData);
        // console.log("JSON: " + boats);
        // this.mapMarkers = boats.map(rowBoat => {
        //     // const latitude = rowBoat.Geolocation__Latitude__s.value;
        //     // const longitude = rowBoat.Geolocation__Longitude__s.value;
        //     return {
        //         location: { 
        //             Latitude: rowBoat.Geolocation__Latitude__s,
        //             Longitude: rowBoat.Geolocation__Longitude__s
        //         },
        //         title: rowBoat.Name,
        //         // description: `Coords: ${Latitude}, ${Longitude}`,
        //         // icon: 'utility:anchor'
        //     };
        // });
        // this.mapMarkers.unshift({
        //     location: {
        //         Latitude: this.latitude.value,
        //         Longitude: this.longitude.value
        //     },
        //     title: LABEL_YOU_ARE_HERE,
        //     icon: ICON_STANDARD_USER
        // });
        // this.isLoading = false;
    }
}