import { LightningElement, wire, api } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from '@salesforce/apex';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';


const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
    columns = [
        {label: 'Name', fieldName: 'Name', type: 'text', editable: true},
        {label: 'Length', fieldName: 'Length__c', type: 'number', editable: true},
        {label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true},
        {label: 'Description', fieldName: 'Description__c', type: 'text', editable: true}
    ];

    selectedBoatId;
    boatTypeId = '';
    boats;
    isLoading = false;

    draftValues = [];

    // wired message context
    @wire(MessageContext)
    messageContext;

    // wired getBoats method 
    @wire(getBoats, { boatTypeId: '$boatTypeId' })
    wiredBoats(result) {
        this.notifyLoading(false);
        this.boats = result;
        if (result.error) {
            console.log(result.error.message);
        }
        this.notifyLoading(false);
    }

    // public function that updates the existing boatTypeId property
    // uses notifyLoading
    @api
    searchBoats(boatTypeId) {
        this.notifyLoading(true);
        this.boatTypeId = boatTypeId;
        this.notifyLoading(false);
     }

    // this public function must refresh the boats asynchronously
    // uses notifyLoading
    @api
    async refresh() {
        this.notifyLoading(true);
        await refreshApex(this.boats);
        this.notifyLoading(false);
     }

    // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(this.selectedBoatId);
    }

    // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) {
        // explicitly pass boatId to the parameter recordId
        publish(this.messageContext, BOATMC, { recordId: boatId });
    }

    // The handleSave method must save the changes in the Boat Editor
    // passing the updated fields from draftValues to the 
    // Apex method updateBoatList(Object data).
    // Show a toast message with the title
    // clear lightning-datatable draft values
    handleSave(event) {
        // notify loading
        this.notifyLoading(true);

        const updatedFields = event.detail.draftValues;
        // Update the records via Apex
        updateBoatList({ data: updatedFields })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: SUCCESS_TITLE,
                        message: MESSAGE_SHIP_IT,
                        variant: SUCCESS_VARIANT
                    })
                );
                // clear all draftValues
                // this.draftValues = [];
                // Display fresh data in the datatable
                // return refreshApex(this.updatedFields);
                this.refresh();
             })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: ERROR_TITLE,
                        message: error.body.message,
                        variant: ERROR_VARIANT
                    })
                );
                this.notifyLoading(false);
             })
            .finally(() => {
                event.detail.draftValues = [];
             });
    }

    // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) {
        this.isLoading = isLoading;
        if(this.isLoading) {
            this.dispatchEvent(new CustomEvent('loading'));
        } else {
            this.dispatchEvent(new CustomEvent('doneloading',));
        }
        
     }
}
