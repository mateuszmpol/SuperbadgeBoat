import { LightningElement, wire, api } from "lwc";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import {
    subscribe,
    unsubscribe,
    MessageContext,
    APPLICATION_SCOPE,
} from "lightning/messageService";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { NavigationMixin } from "lightning/navigation";

import labelDetails from "@salesforce/label/c.Details";
import labelReviews from "@salesforce/label/c.Reviews";
import labelAddReview from "@salesforce/label/c.Add_Review";
import labelFullDetails from "@salesforce/label/c.Full_Details";
import labelPleaseSelectABoat from "@salesforce/label/c.Please_select_a_boat";

// Boat__c Schema Imports
// import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
// import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
const BOAT_ID_FIELD = "Boat__c.Id";
const BOAT_NAME_FIELD = "Boat__c.Name";
const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];

export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
    boatId;
    // wiredRecord;
    label = {
        labelDetails,
        labelReviews,
        labelAddReview,
        labelFullDetails,
        labelPleaseSelectABoat,
    };

    @wire(getRecord, { recordId: "$boatId", fields: BOAT_FIELDS })
    wiredRecord;

    // Decide when to show or hide the icon
    // returns 'utility:anchor' or null
    get detailsTabIconName() {
        return this.wiredRecord && this.wiredRecord.data ? "utility:anchor" : null;
    }

    // Utilize getFieldValue to extract the boat name from the record wire
    get boatName() {
        return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
    }

    // Private
    subscription = null;

    @wire(MessageContext)
    messageContext;

    // Subscribe to the message channel
    subscribeMC() {
        // recordId is populated on Record Pages, and this component
        // should not update when this component is on a record page.
        if (this.subscription || this.boatId) {
            return;
        }
        // Subscribe to the message channel to retrieve the recordId and explicitly assign it to boatId.
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                BOATMC,
                (message) => {
                    this.boatId = message.recordId;
                },
                { scope: APPLICATION_SCOPE },
            );
        }
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    // Calls subscribeMC()
    connectedCallback() {
        this.subscribeMC();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }

    // Navigates to record page
    navigateToRecordViewPage() {
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                objectApiName: "Boat__c",
                recordId: this.boatId,
                actionName: "view",
            },
        });
    }

    // Navigates back to the review list, and refreshes reviews component
    handleReviewCreated() {
        console.log("handleReviewCreated");
        this.template.querySelector('lightning-tabset').activeTabValue = 'review';
        this.template.querySelector('c-boat-reviews').refresh();
    }
}
