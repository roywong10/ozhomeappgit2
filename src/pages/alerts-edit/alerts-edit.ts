import { Authentication } from './../../shared/authentication.service';
import { Geolocation } from '@ionic-native/geolocation';
import { TranslateService } from '@ngx-translate/core';
import { IPropertyAlert } from './../../models/propertyAlert';
import { Observable } from 'rxjs/Observable';
import { ISuburb } from './../../models/suburb';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Checkbox, Searchbar, LoadingController, ToastController, AlertController } from 'ionic-angular';
import { SuburbServiceService } from "../../services/suburb.service";
import { AlertService, GlobalSettings } from "../../shared/shared";
import { PropertyAlertsService } from "../../services/alerts.service";
import { Events } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-alerts-edit',
  templateUrl: 'alerts-edit.html',
})
export class AlertsEditPage {

  @ViewChild('searchBar') searchBar: Searchbar;

  alert: IPropertyAlert;

  private _expiredTokenHandler: () => void;

  //Suburbs
  showSuburbFilters: boolean;
  showSuburbResults: boolean;
  showPreviousSearchList: boolean;
  items: Array<ISuburb>;
  tags: Array<string>;
  previouslySearchedSuburbs: Array<ISuburb>;
  suburbSearchTerm: string;

  //Main filters
  showMe: string;
  propertyTypeDescripion: string;
  toggleData: Array<{ showDetails: boolean, icon: string, id: number }> = [];
  priceRangeFilter: any;
  propertyTypeFilter: any;
  bedroomFilter: any;
  bathroomFilter: any;
  carparkFilter: any;
  beds: string;
  baths: string;
  cars: string;

  //Misc
  isTablet: boolean;
  isEdit: boolean;
  hasSubmitted: boolean;
  maxPrice = 5000000;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public suburbService: SuburbServiceService,
    private alertService: AlertService,
    private alertCtrl: AlertController,
    private propertyAlertService: PropertyAlertsService,
    public loading: LoadingController,
    private geolocation: Geolocation,
    private auth: Authentication,
    public globalSettings: GlobalSettings,
    private translate: TranslateService,
    private toastCtrl: ToastController,
    private event: Events) {

    this.alert = this.navParams.get("propertyAlert");
    this.beds = this.alert.Bedrooms.toString();
    this.baths = this.alert.Bathrooms.toString();
    this.cars = this.alert.Parking.toString();
    this.tags = new Array<string>();
    this.isEdit = this.alert.Id != '';
    this.isTablet = this.globalSettings.isDeviceTablet();

    //Suburbs
    this.suburbService.getPrevioulsySearchSuburbs().then(suburbs => {
      this.previouslySearchedSuburbs = suburbs;
      this.previouslySearchedSuburbs.forEach(s => {
        s.checked = this.alert.suburbs.findIndex(sub => sub.SearchResult === s.SearchResult) > -1;
      });
      this.alert.suburbs.forEach(s => { this.tags.push(s.Suburb) });
    })

    //Main filters
    this.showMe = this.alert.IsSold ? 'sold' : 'sale';
    this.priceRangeFilter = { showDetails: false, id: 1, icon: "arrow-down" };
    this.toggleData.push(this.priceRangeFilter);
    this.propertyTypeFilter = { showDetails: false, id: 2, icon: "arrow-down" };
    this.toggleData.push(this.propertyTypeFilter)
    this.bedroomFilter = { showDetails: false, id: 3, icon: "arrow-down" }
    this.toggleData.push(this.bedroomFilter)
    this.bathroomFilter = { showDetails: false, id: 4, icon: "arrow-down" }
    this.toggleData.push(this.bathroomFilter)
    this.carparkFilter = { showDetails: false, id: 5, icon: "arrow-down" };
    this.toggleData.push(this.carparkFilter)
    this.getPropertyTypeDescription();

  }

  ngOnInit() {
    if (this.showSuburbFilters) {
      setTimeout(() => {
        this.searchBar.setFocus();
      }, 500)
    }
    this._expiredTokenHandler = () => {
      this.navCtrl.pop();
    };

    this.event.subscribe('token:expired', this._expiredTokenHandler);
  }

  ionViewWillLeave() {
    this.event.unsubscribe('token:expired', this._expiredTokenHandler);
  }

  toggleDetails(data) {
    if (data.showDetails) {
      data.showDetails = false;
      data.icon = 'arrow-down';
    } else {
      data.showDetails = true;
      data.icon = 'arrow-up';
    }

    //now ensure all others are closed
    this.toggleData.forEach(toggleData => {
      if (data.id != toggleData.id) {
        toggleData.showDetails = false;
        toggleData.icon = 'arrow-down';
      }
    })
  }

  selectPropertyType(checkBox: Checkbox, type: string) {

    if (checkBox.checked) {

      let index = this.alert.propertyTypeList.findIndex(pt => pt === type)
      if (index < 0) {
        this.alert.propertyTypeList.push(type);

        //remove all from property type as we now have an option
        index = this.alert.propertyTypeList.findIndex(pt => pt === 'All')
        if (index > -1) {
          this.alert.propertyTypeList.splice(index, 1);
        }
      }

    } else {

      let index = this.alert.propertyTypeList.findIndex(pt => pt === type)
      if (index > -1) {
        this.alert.propertyTypeList.splice(index, 1)

        //if no property types left then add all as default option
        if (!this.alert.propertyTypeList.length) {
          this.alert.propertyTypeList.push('All');
        }
      }

    }
    this.getPropertyTypeDescription();
  }

  getPropertyTypeDescription() {

    let propertyTypeDescription = '';

    let results: Array<Observable<any>> = [];

    this.alert.propertyTypeList.forEach(pt => results.push(this.translate.get(pt)));
    results.push(this.translate.get("more"));

    Observable.forkJoin(results).subscribe(data => {

      let moreTranslate = data[data.length - 1];
      data.splice(-1, 1);

      data.forEach(i => {
        if (this.alert.propertyTypeList.length <= 2) {
          propertyTypeDescription = propertyTypeDescription + i + ", "
        }
      });

      if (this.alert.propertyTypeList.length <= 2) {
        this.propertyTypeDescripion = propertyTypeDescription.slice(0, -2);
      } else {
        this.propertyTypeDescripion = data[0] + ", " + data[1] + " + " + (this.alert.propertyTypeList.length - 2) + " " + moreTranslate;
      }
    });

  }

 getPriceRangeStr() {
    var minPriceStr = this.translate.instant('Any');
    var maxPriceStr = this.translate.instant('Any');

    if (this.alert.PriceFrom > 0) {
      minPriceStr = "$" + this.alert.PriceFrom.toLocaleString("en");
    }
    if (this.alert.PriceTo > 0) {
      maxPriceStr = "$" + this.alert.PriceTo.toLocaleString("en") + (this.alert.PriceTo == this.maxPrice ? '+' : '');
    }

    return minPriceStr + ' - ' + maxPriceStr;
  }

  onTapSearchBox(ev) {
    this.showSuburbFilters = true;
  }

  onSearchBoxFocusEvent(ev: FocusEvent) {

    if (ev.type === "focusin") {
      if (this.previouslySearchedSuburbs.length) {
        this.showPreviousSearchList = true;
      }
    }
  }

  toggleSuburb(ev: Checkbox, suburb: ISuburb) {

    if (ev.checked) {
      let index = this.alert.suburbs.findIndex(sub => sub.SearchResult === suburb.SearchResult)
      if (index < 0) {
        this.alert.suburbs.push(suburb);
        this.tags.push(suburb.Suburb);
      }
    } else {
      let index = this.alert.suburbs.findIndex(sub => sub.SearchResult === suburb.SearchResult)
      if (index > -1) {
        this.alert.suburbs.splice(index, 1)
      }
      index = this.tags.indexOf(suburb.Suburb);
      if (index > -1) {
        this.tags.splice(index, 1)
      }
    }

    this.suburbSearchTerm = '';
    this.showSuburbResults = false;
    this.items = [];
    this.searchBar.setFocus();
  }

  onRemoveSuburbTag(suburb: string) {
    let index = this.alert.suburbs.findIndex(sub => sub.Suburb === suburb)
    if (index > -1) {
      this.alert.suburbs.splice(index, 1)
    }

    //now make sure it is untagged in previoulsy searched suburbs AND currently searched for items
    if (this.items && this.items.find(s => s.Suburb === suburb) != undefined) {
      this.items.find(s => s.Suburb === suburb).checked = false;
    }

    if (this.previouslySearchedSuburbs && this.previouslySearchedSuburbs.find(s => s.Suburb === suburb)) {
      this.previouslySearchedSuburbs.find(s => s.Suburb === suburb).checked = false;
    }
  }

  cancelGetSuburbItems(ev: any) {

    this.items = [];
    this.showSuburbFilters = false;
    this.suburbSearchTerm = "";

  }

  getSuburbItems(ev: any) {

    // if the value is an empty string don't filter the items
    if (this.suburbSearchTerm && this.suburbSearchTerm.trim() != '' && this.suburbSearchTerm.length > 2) {

      this.suburbService.getSuburbs(this.suburbSearchTerm.trim()).subscribe(result => {

        if (result.IsValid) {
          this.items = result.ReturnValue;

          //now check if any are already part of the filter
          this.items.forEach(s => { if (this.alert.suburbs.findIndex(sub => sub.SearchResult === s.SearchResult) > -1) s.checked = true; })

          // Show the results
          this.showSuburbResults = true;
          this.showPreviousSearchList = false;
        }

      });
    }
    else {
      //Hide results
      this.showSuburbResults = true;
      this.items = [];
    }
  }
  onDelete(id: string, name: string) {
    let confirm = this.alertCtrl.create({
      title: this.translate.instant('DeleteAlertTitle'),
      message: this.translate.instant('DeleteAlertMsg', {name: name}),
      cssClass: 'confirm-alert',
      buttons: [
        {
          text: this.translate.instant('Yes'),
          handler: () => {
            this.propertyAlertService.removeAlert(id, this.auth.getAccessToken()).subscribe(response => {
              if (response.IsValid) {
                let toast = this.toastCtrl.create({
                  message: this.translate.instant('AlertDeleteSuccessMsg'),
                  duration: 1200,
                  showCloseButton: true,
                  closeButtonText: this.translate.instant('Close')
                });
                toast.present();
                this.navCtrl.pop();
              } else {
                let errorToast = this.toastCtrl.create({
                  duration: 1200,
                  message: 'Error deleting your alert.'
                });
                errorToast.present();
              }
            })
          }
        },
        {
          text: this.translate.instant('No'),
          cssClass: 'button-outline-ios',
          handler: () => {
            //Do nothing
          }
        }
      ]
    });
    confirm.present();

  }

  onSave() {
    this.hasSubmitted = true;
    //Need to have chosen current location / suburb to filter.
    if (this.alert.AlertName == '') {
      return;
    }
    else if (this.alert.suburbs.length == 0) {
      this.alertService.showAlert("", this.translate.instant("You must select a location"), null);
    }
    else if (this.alert.PriceFrom != 0 && this.alert.PriceTo != 0 && (this.alert.PriceFrom != 0 && this.alert.PriceTo < this.alert.PriceFrom) || (this.alert.PriceTo && this.alert.PriceFrom > this.alert.PriceTo)) {
      this.alertService.showAlert(this.translate.instant("Price Range"), this.translate.instant("InvalidPriceRange"), null, this.translate.instant("OK"));
    }
    else {
      this.suburbService.updatedPrevioulsySearchSuburbs(this.alert.suburbs);
      this.alert.Bedrooms = +this.beds;
      this.alert.Bathrooms = +this.baths;
      this.alert.Parking = +this.cars;
      this.alert.IsSold = this.showMe == 'sold';
      
      if (this.isEdit) {
        this.propertyAlertService.updateAlert(this.alert, this.auth.getAccessToken())
          .subscribe(resp => {
            if (resp.IsValid) {
              let toast = this.toastCtrl.create({
                message: this.translate.instant("AlertSuccessMsg"),
                duration: 1200,
                showCloseButton: true,
                closeButtonText: this.translate.instant('Close')
              });
              toast.present();
              this.navCtrl.pop();
            } else {
              let errorToast = this.toastCtrl.create({
                duration: 1200,
                message:  this.translate.instant("AlertErrorMsg")
              });
              errorToast.present();
            }
          },
          error => {
            this.navCtrl.pop();
          });
      } else {
        this.propertyAlertService.addAlert(this.alert, this.auth.getAccessToken())
          .subscribe(resp => {
            if (resp.IsValid) {
              this.navCtrl.pop();
            } else {
              let errorToast = this.toastCtrl.create({
                duration: 1200,
                message: 'Error creating your alert.'
              });
              errorToast.present();
            }
          });
      }

    }
  }
}
