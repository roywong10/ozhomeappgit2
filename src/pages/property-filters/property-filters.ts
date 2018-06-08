import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { permissionService } from './../../shared/permissionService';
import { AlertService } from './../../shared/alert.service';
import { GlobalSettings } from './../../shared/globalSettings';
import { Geolocation } from '@ionic-native/geolocation';
import { PropertyFilterService } from './../../services/property.filter.service';
import { ISuburb } from './../../models/suburb';
import { IPropertyFilter } from './../../models/propertyFilter';
import { Component, ViewChild, NgZone, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, Searchbar, Checkbox, LoadingController, ModalController, AlertController } from 'ionic-angular';
import { SuburbServiceService } from "../../services/suburb.service";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs/Observable";
import { PropertyMapFilterService } from '../../services/property.mapFilter.service';


@IonicPage()
@Component({
  selector: 'page-property-filters',
  templateUrl: 'property-filters.html'
})
export class PropertyFiltersPage implements OnInit {
  @ViewChild('searchBar') searchBar: Searchbar;

  filter = <IPropertyFilter>{};

  showSuburbFilters: boolean;
  showSuburbResults: boolean;
  showPreviousSearchList: boolean;
  items: Array<ISuburb>;
  tags: Array<string>;
  previouslySearchedSuburbs: Array<ISuburb>;
  suburbSearchTerm: string;
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
  isTablet: boolean;
  maxPrice: number;
  OkButtonStr: string;

  constructor(public navCtrl: NavController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private navParams: NavParams,
    private suburbService: SuburbServiceService,
    private propertyFilterService: PropertyFilterService,
    private permissionService: permissionService,
    private alertService: AlertService,
    private loading: LoadingController,
    private geolocation: Geolocation,
    private locationAccuracy: LocationAccuracy,
    private globalSettings: GlobalSettings,
    private translate: TranslateService,
    private mapFiltersSvc: PropertyMapFilterService,
    private zone: NgZone) {

    this.filter = this.navParams.get("currentFilter");
    this.beds = this.filter.beds.toString();
    this.baths = this.filter.baths.toString();
    this.cars = this.filter.cars.toString();
    this.tags = new Array<string>();
    this.showSuburbFilters = false;
    this.items = new Array<ISuburb>();
    this.maxPrice = 5000000;
    this.OkButtonStr = this.translate.instant("OK");
    //Suburbs
    this.suburbService.getPrevioulsySearchSuburbs().then(suburbs => {
      this.previouslySearchedSuburbs = suburbs;
      this.previouslySearchedSuburbs.forEach(s => {
        s.checked = this.filter.suburbs.findIndex(sub => sub.SearchResult === s.SearchResult) > -1;
      });
      if(this.previouslySearchedSuburbs.length > 0){
        this.showPreviousSearchList = true;
      }
      if (this.filter.suburbs.length > 0) {
        this.filter.suburbs.forEach(s => { this.tags.push(s.Suburb) });
      } else if (this.filter.lat != 0 && this.filter.lon != 0) {
        this.tags.push(this.translate.instant('Current location'));
      }
    })
    this.showSuburbFilters = this.navParams.get("defaultToSuburb") !== undefined ? this.navParams.get("defaultToSuburb") : false;

    //Main filters
    this.showMe = this.filter.isSold ? 'sold' : 'sale';
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

    this.isTablet = this.globalSettings.isDeviceTablet();
  }

  ngOnInit() {
    if (this.showSuburbFilters) {
      setTimeout(() => {
        this.searchBar.setFocus();
      }, 500)
    }
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

      let index = this.filter.propertyTypeArray.findIndex(pt => pt === type)
      if (index < 0) {
        this.filter.propertyTypeArray.push(type);

        //remove all from property type as we now have an option
        index = this.filter.propertyTypeArray.findIndex(pt => pt === 'All')
        if (index > -1) {
          this.filter.propertyTypeArray.splice(index, 1);
        }
      }

    } else {

      let index = this.filter.propertyTypeArray.findIndex(pt => pt === type)
      if (index > -1) {
        this.filter.propertyTypeArray.splice(index, 1)

        //if no property types left then add all as default option
        if (!this.filter.propertyTypeArray.length) {
          this.filter.propertyTypeArray.push('All');
        }
      }

    }
    this.getPropertyTypeDescription();
  }

  getPropertyTypeDescription() {

    let propertyTypeDescription = '';

    let results: Array<Observable<any>> = [];

    this.filter.propertyTypeArray.forEach(pt => results.push(this.translate.get(pt)));
    results.push(this.translate.get("more"));

    Observable.forkJoin(results).subscribe(data => {

      let moreTranslate = data[data.length - 1];
      data.splice(-1, 1);

      data.forEach(i => {
        if (this.filter.propertyTypeArray.length <= 2) {
          propertyTypeDescription = propertyTypeDescription + i + ", "
        }
      });

      if (this.filter.propertyTypeArray.length <= 2) {
        this.propertyTypeDescripion = propertyTypeDescription.slice(0, -2);
      } else {
        this.propertyTypeDescripion = data[0] + ", " + data[1] + " + " + (this.filter.propertyTypeArray.length - 2) + " " + moreTranslate;
      }
    });

  }

  getPriceRangeStr() {
    var minPriceStr = this.translate.instant('Any');
    var maxPriceStr = this.translate.instant('Any');

    if (this.filter.pricefrom > 0) {
      minPriceStr = "$" + this.filter.pricefrom.toLocaleString("en-US");
    }
    if (this.filter.priceto > 0) {
      maxPriceStr = "$" + this.filter.priceto.toLocaleString("en-US") + (this.filter.priceto == this.maxPrice ? '+' : '');
    }

    return minPriceStr + ' - ' + maxPriceStr;
  }

  onTapSearchBox(ev) {
    this.showSuburbFilters = true;
  }

  onSearchBoxFocusEvent(ev: FocusEvent) {
    this.showSuburbFilters = true;
  }

  getCurrentLocation() {
    this.permissionService.checkLocationPermissions().then(hasLocationPermissions => {
      if (hasLocationPermissions) {
        //Check for location service setting is enabled
        this.permissionService.checkLocationEnabled().then(available => {
          if (available) {
            this.geolocation.getCurrentPosition().then((resp) => {
               this.setCurrentLocation(resp.coords.latitude,resp.coords.longitude);
            })
          } else {
              this.requestEnableLocation();
          }
        });
      } else{
        let alert = this.alertCtrl.create({
          title: this.translate.instant('Denied'),
          message: this.translate.instant('DeniedSettinsAlert'),
          cssClass: 'denied-alert',
          enableBackdropDismiss: false,
          buttons: [
            {
              text: this.translate.instant("Settings"),
              handler: () => {
                this.permissionService.switchToLocationSettings();
              }
            },
            {
              text: this.translate.instant("SettingsOK"),
              handler: () => {}
            }
          ]
        });
        alert.present();
      }
    });
  }

  private requestEnableLocation() {

    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
          // the accuracy option will be ignored by iOS
          this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(() => {
              this.geolocation.getCurrentPosition().then((resp) => {
                this.zone.run(() => {
                  this.setCurrentLocation(resp.coords.latitude,resp.coords.longitude);
                });
              });
            }, error => { });
      }
    });
  }

  private setCurrentLocation(lat, lng) {
    this.filter.lat = lat;
    this.filter.lon = lng;
    this.filter.suburbs = new Array<ISuburb>();
    this.tags = new Array<string>();
    this.tags.push(this.translate.instant('Current location'));
  }

  toggleSuburb(ev: Checkbox, suburb: ISuburb) {
     this.clearCurrentLocation();

    if (ev.checked) {
      let index = this.filter.suburbs.findIndex(sub => sub.SearchResult === suburb.SearchResult)
      if (index < 0) {
        this.filter.suburbs.push(suburb);
        this.tags.push(suburb.Suburb);
      }


      let indexCurrentLocation = this.tags.findIndex(tagname => tagname === this.translate.instant('Current location'))
      if (indexCurrentLocation > -1) {
        this.tags.splice(indexCurrentLocation, 1);
      }

    } else
    {

      let index = this.filter.suburbs.findIndex(sub => sub.SearchResult === suburb.SearchResult)
      if (index > -1) {
        this.filter.suburbs.splice(index, 1)
      }
      index = this.tags.indexOf(suburb.Suburb);
      if (index > -1) {
        this.tags.splice(index, 1)
      }
    }

    this.suburbSearchTerm = '';
    this.showSuburbResults = false;
    this.items = new Array<ISuburb>();
    this.searchBar.setFocus();
  }

  clearCurrentLocation() {
    this.filter.lat = 0;
    this.filter.lon = 0;
  }

  clearSuburbFilters() {
    this.filter.lat = 0;
    this.filter.lon = 0;
    this.tags = new Array<string>();
    //TODO reveiw
    this.previouslySearchedSuburbs.forEach(s => {
      s.checked = false;
    });
  }

  onRemoveSuburbTag(suburb: string) {
    let index = this.filter.suburbs.findIndex(sub => sub.Suburb === suburb)
    if (index > -1) {
      this.filter.suburbs.splice(index, 1)
    }

    //now make sure it is untagged in previoulsy searched suburbs AND currently searched for items
    if (this.items && this.items.find(s => s.Suburb === suburb) != undefined) {
      this.items.find(s => s.Suburb === suburb).checked = false;
    }
    //TODO review if need to get from service
    if (this.previouslySearchedSuburbs && this.previouslySearchedSuburbs.find(s => s.Suburb === suburb)) {
      this.previouslySearchedSuburbs.find(s => s.Suburb === suburb).checked = false;
    }
  }

  cancelGetSuburbItems(ev: any) {
    this.zone.run(()=>{
      this.items = new Array<ISuburb>();
      this.showSuburbFilters = false;
      this.suburbSearchTerm = "";
    });
  }

  getSuburbItems(ev: any) {

    // if the value is an empty string don't filter the items
    if (this.suburbSearchTerm && this.suburbSearchTerm.trim() != '' && this.suburbSearchTerm.length > 2) {

      this.suburbService.getSuburbs(this.suburbSearchTerm.trim()).subscribe(result => {

        if (result.IsValid) {
          this.items = result.ReturnValue;

          //now check if any are already part of the filter
          this.items.forEach(s => { if (this.filter.suburbs.findIndex(sub => sub.SearchResult === s.SearchResult) > -1) s.checked = true; })

          // Show the results
          this.showSuburbResults = true;
          this.showPreviousSearchList = false;
        }

      });
    }
    else {
      //Hide results
      this.showSuburbResults = true;
      this.items = new Array<ISuburb>();
    }
  }

  onSearch() {

    //Need to have chosen current location / suburb to filter.
    if (this.tags.length == 0) {
      this.alertService.showAlert("", this.translate.instant('RequiredLocationMessage'), null, this.OkButtonStr);
    }
    else if (this.filter.priceto != 0 && this.filter.pricefrom != 0 && ((this.filter.pricefrom != 0 && this.filter.priceto < this.filter.pricefrom) || (this.filter.priceto != 0 && this.filter.pricefrom > this.filter.priceto))) {
      this.alertService.showAlert(this.translate.instant('Price Range'), this.translate.instant('InvalidPriceRange'), null, this.OkButtonStr);
    }
    else {
      this.zone.run(() => {
        this.filter.isSold = this.showMe == 'sold';
        this.filter.beds = +this.beds;
        this.filter.baths = +this.baths;
        this.filter.cars = +this.cars;
        this.propertyFilterService.setFilter(this.filter);
         let mapFilter = this.mapFiltersSvc.getFilters();
         mapFilter.beds = this.filter.beds;
         mapFilter.baths = this.filter.baths;
         mapFilter.cars = this.filter.cars;
         mapFilter.isSold = this.filter.isSold;
         mapFilter.pricefrom = this.filter.pricefrom;
         mapFilter.priceto = this.filter.priceto;
         mapFilter.propertyType = this.filter.propertyType;
         mapFilter.propertyTypeArray = this.filter.propertyTypeArray;

        this.suburbService.updatedPrevioulsySearchSuburbs(this.filter.suburbs);
        this.navCtrl.pop();
      });
    }

  }
}
