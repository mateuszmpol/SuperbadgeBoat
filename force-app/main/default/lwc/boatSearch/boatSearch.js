import { LightningElement, wire, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class BoatSearch extends NavigationMixin(LightningElement)  {
    @api isLoading = false;

    // Handles loading event
    handleLoading() {
        this.isLoading = true;
    }

    // Handles done loading event
    handleDoneLoading() {
        window.clearTimeout(this.delayTimeout);
        this.delayTimeout = setTimeout(() => {
			this.isLoading = false;
		}, 300);
        // this.isLoading = false;
    }

    // Handles search boat event
    // This custom event comes from the form
    searchBoats(event) {
        this.template.querySelector('c-boat-search-results').searchBoats(event.detail.boatTypeId);
     }

    createNewBoat() { 
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Boat__c',
                actionName: 'new'
            }
        });
    }
}
