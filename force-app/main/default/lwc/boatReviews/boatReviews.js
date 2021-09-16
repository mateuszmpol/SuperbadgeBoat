import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';

// imports
export default class BoatReviews extends NavigationMixin(LightningElement) {
    // Private
    boatId;
    error;
    @track
    boatReviews;
    isLoading = false;
    
    // Getter and Setter to allow for logic to run on recordId change
    @api
    get recordId() { 
      return this.boatId;
    }
    set recordId(value) {
      //sets boatId attribute
      //sets boatId assignment
      //get reviews associated with boatId
      this.setAttribute("boatId", value);
      this.boatId = value;
      this.getReviews();
    }
    
    // Getter to determine if there are reviews to display
    get reviewsToShow() {
      console.log( 'this.boatReviews  ==> ' +this.boatReviews);
      return (this.boatReviews != undefined && this.boatReviews != null && this.boatReviews != '') ? true : false;
   }
    
    // Public method to force a refresh of the reviews invoking getReviews
    @api
    refresh() { 
      this.getReviews();
    }
    
    // Imperative Apex call to get reviews for given boat
    // returns immediately if boatId is empty or null
    // sets isLoading to true during the process and false when it’s completed
    // Gets all the boatReviews from the result, checking for errors.
    getReviews() {
      this.isLoading = true;
      getAllReviews({
        boatId: this.boatId
      })
      .then((reviews) => {
        if(reviews.length > 0) {
          this.boatReviews = reviews;
          console.log("Reviews: " + reviews);
        } else {
          this.boatReviews = null;
          console.log("Reviews: null");
        }
      })
      .catch((error) => {
        this.boatReviews = undefined;
        this.error = error;
        console.log("get Review -> error")
      })
      .finally(() => {
        this.isLoading = false;
      })
     }
    
    // Helper method to use NavigationMixin to navigate to a given record on click
    navigateToRecord(event) {
      const userId = event.target.dataset.recordId;
      console.log('userId >>> ' + userId);
      //Generate a URL to a User record page 
      this[NavigationMixin.Navigate]({
        type: "standard__recordPage",
        attribute: { 
          objectApiName: "User",
          recordId: event.target.dataset.recordId,
          actionName: "view",
        },
      });
    }
  }
  