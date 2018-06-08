import { TranslateService } from '@ngx-translate/core';
import { PropertyMapFilterService } from './../../services/property.mapFilter.service';
import { IPropertyMapFilter } from './../../models/propertyMapFilter';
import { PropertyFilterService } from './../../services/property.filter.service';
import { GlobalSettings } from './../../shared/globalSettings';
import { IPropertySummary } from './../../models/propertySummary';
import { IPropertyFilter } from './../../models/propertyFilter';
import { PropertyService } from './../../services/property.service';
import { PropertySortPage } from './../property-sort/property-sort';
import { PropertyDetailPage } from './../property-detail/property-detail';
import { PropertyMapPage } from './../property-map/property-map';
import { PropertyFiltersPage } from './../property-filters/property-filters';
import { Component, OnInit, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, LoadingController, Loading, Events, InfiniteScroll, ToastController } from 'ionic-angular';
import { IPropertySearchApiResult } from "./../../models/api/propertySearchApiResult";
import { IPropertySearchResult } from "./../../models/api/propertySearchResult";
import * as _ from "lodash";
import { Subscription } from "rxjs/Subscription";

declare var Bugsnag: any;

@IonicPage()
@Component({
  selector: 'page-property-list',
  templateUrl: 'rent-list.html'
})
export class RentalListPage implements OnInit {

  propertyDetailPage = PropertyDetailPage;

  propertyFilter: IPropertyFilter;
  mapFilter: IPropertyMapFilter;
  hasFilters: boolean;
  hasMapFilters: boolean;
  filterSuburbSummary: string;
  filterSummary: string;
  propertySearchResults: IPropertySearchApiResult;
  errorMessage: string;
  pageNumber: number;
  itemsPerPage: number;
  totalPages: number;
  numPropertiesLoad: number;
  isTablet: boolean;
  updatedFitlerSub: Subscription;
  updatedMapFilterSub: Subscription;
  sortFilter: string;
  infiniteScroll: InfiniteScroll;
  loadingProperty: boolean = false; //To prevent multiple clicks from happening
  isLoading: boolean = true; //Initial loading

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private propertySvc: PropertyService,
    private propertyFiltersSvc: PropertyFilterService,
    private mapFiltersSvc: PropertyMapFilterService,
    public loading: LoadingController,
    public globalSettings: GlobalSettings,
    private event: Events,
    private translate: TranslateService,
    private zone: NgZone) {

    this.isTablet = this.globalSettings.isDeviceTablet();
    this.pageNumber = 1;
    this.propertySearchResults = <IPropertySearchApiResult>{ ReturnValue: <IPropertySearchResult>{ Items: new Array<IPropertySummary>() } };

  }

  ngOnInit(): void {
    if (this.isTablet) {
      this.event.subscribe('splitpage:enter', () => {
        this.initFilters();
        this.loadInitialProperties(!this.isTablet, this.hasMapFilters);
      });

      this.event.subscribe('splitpage:leave', () => {
        this.ionViewWillLeave();
      });
    }
  }

  ionViewWillEnter() {
    if (!this.isTablet) {
      this.initFilters();
      this.loadInitialProperties(true, this.hasMapFilters);
    }
  }

  ionViewWillLeave() {
    this.updatedFitlerSub.unsubscribe();
    this.updatedMapFilterSub.unsubscribe();
  }

  initFilters() {
    this.propertyFilter = this.propertyFiltersSvc.getFilters();
    this.mapFilter = this.mapFiltersSvc.getFilters();
    this.hasFilters = this.propertyFiltersSvc.hasFilters();
    this.hasMapFilters = this.mapFiltersSvc.hasFilters();
    this.sortFilter = this.hasMapFilters ? this.mapFilter.orderby : this.propertyFilter.orderby;

    this.filterSuburbSummary = this.hasMapFilters ? this.translate.instant("Current Map View") : this.propertyFiltersSvc.getSuburbSummary();
    this.filterSummary = this.hasMapFilters ? this.mapFiltersSvc.getFilterSummary() : this.propertyFiltersSvc.getFilterSummary();

    this.subscribeToFilters();
  }

  subscribeToFilters() {
    this.updatedFitlerSub = this.propertyFiltersSvc.updatedFilters().subscribe(filters => {
      this.pageNumber = 1;
      this.propertyFilter = filters;
      this.sortFilter = this.propertyFilter.orderby;
      this.hasFilters = true;
      this.mapFiltersSvc.clearFilter();
      this.hasMapFilters = false;
      this.filterSuburbSummary = this.propertyFiltersSvc.getSuburbSummary();
      this.filterSummary = this.propertyFiltersSvc.getFilterSummary();
      this.loadInitialProperties(false, false);
    })

    this.updatedMapFilterSub = this.mapFiltersSvc.updatedFilters().subscribe(filters => {
      this.mapFilter = filters;
      this.hasMapFilters = this.mapFiltersSvc.hasFilters();
      this.sortFilter = this.mapFilter.orderby;
      this.filterSuburbSummary = this.translate.instant("Current Map View");
      this.filterSummary = "";
      this.loadInitialProperties(false, true);
    })
  }

  onViewFilters(defaultToSuburb: boolean): void {
    let filterModal = this.modalCtrl.create(PropertyFiltersPage,
      { currentFilter: _.cloneDeep(this.propertyFilter), defaultToSuburb: defaultToSuburb },
      { cssClass: 'filters-modal' });
    filterModal.present();
  }

  onViewSort(): void {
    let sortModal = this.modalCtrl.create(PropertySortPage, { orderby: this.sortFilter });
    sortModal.onDidDismiss(sort => {
      if (sort) {
        this.onSortSelected(sort);
      }
    })
    sortModal.present();
  }

  onSortSelected(sortOrder) {
    if (this.sortFilter != sortOrder) {
      this.sortFilter = sortOrder;
      this.loadInitialProperties(true, this.hasMapFilters);
    }
  }

  onToggleMapView() {
    this.navCtrl.setRoot(PropertyMapPage);
  }

  onViewProperty(propertyId: number) {
    if (!this.loadingProperty) {

      this.loadingProperty = true;
      this.propertySvc.getPropertyById(propertyId).subscribe(p => {
        if (p.IsValid) {
          let propertyModal = this.modalCtrl.create(PropertyDetailPage, { property: p.ReturnValue }, { cssClass: 'property-modal' });
          propertyModal.present().then(() => {
            this.loadingProperty = false;
          });
        } else {

          if (Bugsnag) {
            Bugsnag.notify("getPropertyById", "Property-list.ts onViewProperty with " + JSON.stringify(p.Errors) + " Property Id " + propertyId);
          }

          var toast = this.toastCtrl.create({
            message: 'Error. There were issues loading property details.',
            position: 'bottom',
            duration: 1500
          });

          toast.present();

          this.loadingProperty = false;
        }
      });

    }
  }

  loadMoreProperties(infiniteScroll: InfiniteScroll): void {
    this.infiniteScroll = infiniteScroll;
    if (this.hasMapFilters) {
      if (this.mapFilter.pageNum < this.totalPages) {
        setTimeout(() => {

          this.pageNumber += 1;
          this.mapFilter.pageNum = this.pageNumber;
          this.propertySvc.getPropertiesByBounds(this.mapFilter, true)
            .subscribe(results => {
              infiniteScroll.complete();
              if (results.IsValid) {
                this.propertySearchResults.ReturnValue.Items = this.propertySearchResults.ReturnValue.Items.concat(results.ReturnValue.Items);
                this.numPropertiesLoad += results.ReturnValue.Items.length;

                if (this.totalPages === this.mapFilter.pageNum)
                  infiniteScroll.enable(false);
              } else {
                if (Bugsnag) {
                  Bugsnag.notify("getPropertiesByBounds", "property-list.ts loadMoreProperties " + JSON.stringify(results.Errors));
                }
              }
            },
            error => this.errorMessage = <any>error);
        }, 500);
      } else {
        infiniteScroll.enable(false);
      }
    } else {


      if (this.propertyFilter.pageNum < this.totalPages) {

        setTimeout(() => {

          this.pageNumber += 1;
          this.propertyFilter.pageNum = this.pageNumber;
          this.propertySvc.getProperties(this.propertyFilter)
            .subscribe(results => {
              infiniteScroll.complete();
              if (results.IsValid) {
                this.propertySearchResults.ReturnValue.Items = this.propertySearchResults.ReturnValue.Items.concat(results.ReturnValue.Items);
                this.numPropertiesLoad += results.ReturnValue.Items.length;
              } else {
                if (Bugsnag) {
                  Bugsnag.notify("getProperties", "property-list loadMoreProperties " + JSON.stringify(results.Errors) + " property filter " + JSON.stringify(this.propertyFilter));
                }
              }
              if (this.totalPages === this.propertyFilter.pageNum)
                infiniteScroll.enable(false);
            },
            error => this.errorMessage = <any>error);
        }, 500);
      } else {
        infiniteScroll.enable(false);
      }
    }
  }

  loadInitialProperties(showLoader: boolean, isMap: boolean): void {
    this.isLoading = true;
    if (this.infiniteScroll) {
      this.infiniteScroll.enable(true);
    }
    this.pageNumber = 1;
    this.propertyFilter.pageNum = 1;
    this.mapFilter.pageNum = 1;
    this.propertyFilter.itemsPerPage = this.globalSettings.getSettings().itemsPerPage;
    if (showLoader) {
      let loader = this.createLoader();
      loader.present().then(() => {
        if (isMap) {
          this.getMapProperties(loader);
        } else {
          this.getProperties(loader);
        }
      })
    } else {
      if (isMap) {
        this.getMapProperties();
      } else {
        this.getProperties();
      }
    }
  }

  getProperties(loader: Loading = null) {
    this.propertyFilter.orderby = this.sortFilter;
    this.propertySvc.getProperties(this.propertyFilter)
      .subscribe(results => {
        this.propertySearchResults = results;
        this.numPropertiesLoad = this.propertySearchResults.ReturnValue.Items.length;
        this.totalPages = this.propertySearchResults.ReturnValue.TotalPages;
        if (loader != null) {
          loader.dismiss();
        }
        this.isLoading = false;
      },
      error => {
        this.errorMessage = <any>error;
        if (loader != null) {
          loader.dismiss();
        }
        this.isLoading = false;
      });
  }

  getMapProperties(loader: Loading = null) {
    this.mapFilter.orderby = this.sortFilter;
    this.propertySvc.getPropertiesByBounds(this.mapFilter, true)
      .subscribe(results => {
        if (results.IsValid) {
          this.propertySearchResults = results;
          this.numPropertiesLoad = this.propertySearchResults.ReturnValue.Items.length;
          this.totalPages = this.propertySearchResults.ReturnValue.TotalPages;
        } else {
          if (Bugsnag) {
            Bugsnag.notify("getPropertiesByBounds", "property-list getMapProperties " + JSON.stringify(results.Errors) + " map filter " + JSON.stringify(this.mapFilter));
          }
        }
        if (loader != null) {
          loader.dismiss();
        }
        this.isLoading = false;
      },
      error => {
        this.errorMessage = <any>error;
        this.isLoading = false;
      },
      () => {

      });

  }

  createLoader() {
    return this.loading.create({
      content: this.translate.instant('LoadingPropertiesLoader'),
      spinner: "crescent"
    });
  }
}
