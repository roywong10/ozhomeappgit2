import { TranslateService } from '@ngx-translate/core';
import { AlertService } from './../../shared/alert.service';
import { permissionService } from './../../shared/permissionService';
import { PropertyMapFilterService } from './../../services/property.mapFilter.service';
import { IPropertyMapFilter } from './../../models/propertyMapFilter';
import { Subscription } from 'rxjs/Subscription';
import { PropertyFilterService } from './../../services/property.filter.service';
import { GlobalSettings } from './../../shared/globalSettings';
import { IPropertySummary } from './../../models/propertySummary';
import { PropertyService } from './../../services/property.service';
import { IPropertyFilter } from './../../models/propertyFilter';
import { PropertyFiltersPage } from './../property-filters/property-filters';
import { PropertyDetailPage } from './../property-detail/property-detail';
import { PropertyListPage } from './../property-list/property-list';
import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, LoadingController, AlertController, Alert, ViewController, Events } from 'ionic-angular';
import { LatLng } from "@ionic-native/google-maps";
import { Geolocation } from "@ionic-native/geolocation"
import { IMapSearchResultApi } from "../../models/api/mapSearchResultApi";
import { IPropertyBase } from "../../models/propertyBase";
import { ISuburb } from "../../models/suburb";
import * as _ from "lodash";
import * as MarkerClusterer from 'node-js-marker-clusterer';

declare var google;
declare var Bugsnag: any;

@IonicPage()
@Component({
  selector: 'page-property-map',
  templateUrl: 'property-map.html',
})
export class PropertyMapPage implements OnInit {
  @ViewChild('map') mapElement: ElementRef;

  isTablet: boolean;
  propertyFilter: IPropertyFilter;
  mapFilter: IPropertyMapFilter;
  hasFilters: boolean;
  hasMapFilters: boolean;
  filterSuburbSummary: string;
  filterSummary: string;
  propertySearchResults: IMapSearchResultApi;
  defaultLocationAlert: Alert;

  //Map
  mapZoomLevel: number;
  minZoomLevel: number;
  disableZoomTrigger: boolean;
  showZoomMessage: boolean;
  propertyMap: any;
  infoWindow = null;
  selectedProperty: IPropertySummary = null;
  errorMessage: string;
  mapType: string;
  totalProperties: number;
  currentMapMarkers: Array<any>;
  updatedFilterSub: Subscription;
  updatedMapFilterSub: Subscription;
  markerCluster: any;
  showLocationAlert: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private modalCtrl: ModalController,
    private propertySvc: PropertyService,
    private propertyFiltersSvc: PropertyFilterService,
    private mapFiltersSvc: PropertyMapFilterService,
    private permissionService: permissionService,
    private alertService: AlertService,
    private geolocation: Geolocation,
    private zone: NgZone,
    private globalSettings: GlobalSettings,
    public loading: LoadingController,
    private viewCtrl: ViewController,
    public alertCtrl: AlertController,
    private translate: TranslateService,
    private event: Events) {

    this.propertySearchResults = <IMapSearchResultApi>{};
    this.selectedProperty = <IPropertySummary>{};
    this.mapZoomLevel = 14;
    this.minZoomLevel = this.isTablet ? 13 : 12;
    this.currentMapMarkers = new Array<any>();

  }

  ngOnInit() {
    this.isTablet = this.globalSettings.isDeviceTablet();
    this.mapType = "roadmap";
    this.initMap();

    if (this.isTablet) {
      this.event.subscribe('splitpage:enter', () => {
        this.initFilters();
        this.getPinsForLocation();
      });

      this.event.subscribe('splitpage:leave', () => {
        this.ionViewWillLeave();
      });
    }
  }
  
  //This will be called once on tablet - on tablet, never leaves.
  ionViewWillEnter() {
    if (!this.isTablet) {
      this.initFilters();
      this.getPinsForLocation();
    }
  }

  ionViewWillLeave() {
    this.showLocationAlert = false;
    this.updatedFilterSub.unsubscribe();
    this.updatedMapFilterSub.unsubscribe();
  }

  initFilters() {
    this.propertyFilter = this.propertyFiltersSvc.getFilters();
    this.hasFilters = this.propertyFiltersSvc.hasFilters();
    this.mapFilter = this.mapFiltersSvc.getFilters();
    this.hasMapFilters = this.mapFiltersSvc.hasFilters();
    this.centerMap();
    this.filterSuburbSummary = this.hasMapFilters ? this.translate.instant("Current Map View") : this.propertyFiltersSvc.getSuburbSummary();
    this.filterSummary = this.hasMapFilters ? this.mapFiltersSvc.getFilterSummary() : this.propertyFiltersSvc.getFilterSummary();

    this.subscribeToFilters();
  }

  subscribeToFilters() {
    this.updatedFilterSub = this.propertyFiltersSvc.updatedFilters().subscribe(filters => {
      this.propertyFilter = filters;
      this.hasFilters = true;
      this.mapFiltersSvc.clearFilter();
      this.hasMapFilters = false;
      this.filterSuburbSummary = this.propertyFiltersSvc.getSuburbSummary();
      this.filterSummary = this.propertyFiltersSvc.getFilterSummary();
      this.loadPropertyFilterPins();
    });

    this.updatedMapFilterSub = this.mapFiltersSvc.updatedFilters().subscribe(filters => {
      this.mapFilter = filters;
      this.hasMapFilters = true;
      this.filterSuburbSummary = this.translate.instant("Map View");
      this.filterSummary = this.mapFiltersSvc.getFilterSummary();
      this.loadMapFilterPins();
    });
  }

  centerMap(){
     if (this.hasMapFilters) {
      var ne = new LatLng(this.mapFilter.north, this.mapFilter.east);
      var sw = new LatLng(this.mapFilter.south, this.mapFilter.west);
      let bounds = new google.maps.LatLngBounds(sw, ne);
      this.propertyMap.fitBounds(bounds);
    } else {

      var latlng = new google.maps.LatLng("-28.1713237", "133.5440245");
      this.propertyMap.setCenter(latlng)
      this.propertyMap.setZoom(this.isTablet ? 4 : 3);
    }
  }

  initMap() {
    let mapOptions = {
      zoom: this.mapZoomLevel,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      setMyLocationEnabled: true //todo work out
    }

    this.propertyMap = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    google.maps.event.addListenerOnce(this.propertyMap, 'idle', () => {
      
      //Drag event
      google.maps.event.addListener(this.propertyMap, 'dragstart', () => {
        this.zone.run(() => {
          this.selectedProperty = null;
        })
      });

      google.maps.event.addListener(this.propertyMap, 'dragend', () => {
        this.zone.run(() => {
          if (this.propertyMap.getZoom() < this.minZoomLevel) {
            this.showZoomMessage = true;
          } else {
            this.showZoomMessage = false;
            // if (!this.checkIfInBounds()) {
            this.debouncedUpdateFilterBounds();
            // }
          }
        });
      });

      google.maps.event.addListener(this.propertyMap, 'zoom_changed', () => {
        if (!this.disableZoomTrigger) {
          this.zone.run(() => {
            if (this.propertyMap.getZoom() < this.minZoomLevel) {
              this.showZoomMessage = true;
            } else {
              this.showZoomMessage = false;
              //  if (!this.checkIfInBounds()) {
              this.debouncedUpdateFilterBounds();
              //}else{

              //}
            }
          });
        }
      });

    });
  }

  //V2 performance enhancement
  checkIfInBounds(): boolean {
    var ne = new LatLng(this.mapFilter.north, this.mapFilter.east);
    var sw = new LatLng(this.mapFilter.south, this.mapFilter.west);
    let bounds = new google.maps.LatLngBounds(sw, ne);
    let currBounds = this.propertyMap.getBounds();
    return bounds.contains(currBounds.getNorthEast()) && bounds.contains(currBounds.getSouthWest());
  }

  getPinsForLocation() {

    if (this.hasMapFilters) {
      this.loadMapFilterPins();
    } else {
      if (this.propertyFilter.suburbs.length == 0) {
        this.permissionService.checkLocationPermissions().then(hasLocationPermissions => {
          if (hasLocationPermissions) {
            //Check for location service setting is enabled
            this.permissionService.checkLocationEnabled().then(available => {
              if (available) {
                this.geolocation.getCurrentPosition({ timeout: 20000 }).then((resp) => {
                  this.propertyFilter.lat = resp.coords.latitude;
                  this.propertyFilter.lon = resp.coords.longitude;
                  this.propertyFilter.suburbs = new Array<ISuburb>();
                  this.propertyFiltersSvc.setFilter(this.propertyFilter);
                  return;
                }).catch(error => {
                  this.showLocationAlert = true;
                });
              } else {
                this.showLocationAlert = true;
              }
            });
          } else {
            this.showLocationAlert = true;
          }
        });
      }
      else {
        this.loadPropertyFilterPins();
      }
    }
  }

  private debouncedUpdateFilterBounds = _.debounce(() => {

    var mapBounds = this.propertyMap.getBounds();
    //https://stackoverflow.com/questions/33682558/how-do-you-find-the-4-corners-of-a-google-map-v3-when-the-map-is-rotated
    //north - NE lat, south - SW lat, east - NE lng, west SW lng
    this.updateFilterBounds(mapBounds.getNorthEast().lat(), mapBounds.getSouthWest().lat(),
      mapBounds.getNorthEast().lng(), mapBounds.getSouthWest().lng())

  }, 1200);

  updateFilterBounds(north: number, south: number, east: number, west: number) {
    this.mapFilter = this.mapFiltersSvc.getFilters();
    this.mapFilter.north = north;
    this.mapFilter.south = south;
    this.mapFilter.east = east;
    this.mapFilter.west = west;


    this.mapFiltersSvc.setFilter(this.mapFilter);
  }

  loadPropertyFilterPins() {
    this.showLocationAlert = false;
    let loader = this.createLoader();

    loader.present().then(() => {
      this.propertySvc.getPropertiesForMap(this.propertyFilter)
        .subscribe(data => {
          this.setMapMarkers(data);
          loader.dismiss();
        },
        error => this.errorMessage = <any>error);
    });

  }

  loadMapFilterPins() {
    this.showLocationAlert = false;
    let loader = this.createLoader();

    loader.present().then(() => {
      this.propertySvc.getPropertiesByBounds(this.mapFilter, false)
        .subscribe(data => {
          this.setMapMarkers(data);
          loader.dismiss();
        },
        error => this.errorMessage = <any>error);
    });

  }

  setMapMarkers(data) {
    //remove any current map markers
    for (var i = 0; i < this.currentMapMarkers.length; i++) {
      this.currentMapMarkers[i].setMap(null);
    }
    
    this.currentMapMarkers = new Array<any>();
    this.propertySearchResults = data;
    let properties = this.propertySearchResults.ReturnValue || new Array<IPropertySummary>();
    this.totalProperties = properties.length;

    let bounds = new google.maps.LatLngBounds();
    for (let property of properties) {
       this.addMarker(property, bounds);
    }

    if (!this.hasMapFilters && this.totalProperties > 0) {
      this.disableZoomTrigger = true;
      this.propertyMap.fitBounds(bounds);
      this.propertyMap.setZoom(this.propertyMap.getZoom() + 1)
      this.disableZoomTrigger = false;
    }

    var getGoogleClusterInlineSvg = function () {
      var encoded = window.btoa('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30" height="32" viewBox="0 0 30 32"><g fill="none" fill-rule="evenodd" transform="translate(2 2)"><circle cx="13" cy="13" r="14" fill="#F7941F" stroke="#FFF" stroke-width="2"/></g></svg>');

      return ('data:image/svg+xml;base64,' + encoded);
    };

    var cluster_styles = [
      {
        width: 30,
        height: 30,
        url: getGoogleClusterInlineSvg(),
        textColor: 'white',
        textSize: 14
      }
    ];

    if(this.markerCluster){
      this.markerCluster.clearMarkers();
    }

    this.markerCluster = new MarkerClusterer(this.propertyMap, this.currentMapMarkers, {
      //imagePath: 'assets/svg/m',
      maxZoom: 15,
      styles: cluster_styles,
      minimumClusterSize: 3
    });

  }

  addMarker(property: IPropertyBase, bounds: any) {
    //create LatLng object
    let latLng: LatLng = new LatLng(property.Latitude, property.Longtitude);
    let marker = new google.maps.Marker({
      map: this.propertyMap,
      position: latLng,
      icon: 'assets/svg/pin.svg'
    });

    this.currentMapMarkers.push(marker);

    if (bounds) {
      bounds.extend(latLng);
    }

    google.maps.event.addListener(marker, 'click', () => {
      //see https://medium.com/@MertzAlertz/what-the-hell-is-zone-js-and-why-is-it-in-my-angular-2-6ff28bcf943e
      this.zone.run(() => {
        this.propertySvc.getPropertyById(property.PropertyID).subscribe(result => {
          if (result.IsValid) {
            this.selectedProperty = result.ReturnValue;
          }
        });
      })
    });
  }

  //Map page
  onSelectRoadMap() {
    this.propertyMap.setMapTypeId('roadmap');
  }

  onSelectSatellite() {
    this.propertyMap.setMapTypeId('satellite');
  }

  onToggleListView() {
    this.navCtrl.setRoot(PropertyListPage, { filters: this.propertyFilter });
  }

  onViewProperty(propertyId: number) {
    this.propertySvc.getPropertyById(propertyId).subscribe(p => {
      if(p.IsValid){
        let propertyModal = this.modalCtrl.create(PropertyDetailPage, { property: p.ReturnValue }, { cssClass: 'property-modal' });
        propertyModal.present();
      }else{
          if(Bugsnag){
            Bugsnag.notify("getPropertyById", "property-map.ts onViewProperty "+JSON.stringify(p.Errors)+ " property Id "+propertyId);
          }
      }
    })
  }

  onViewFilters(showSuburbs: boolean) {
    let filterModal = this.modalCtrl.create(PropertyFiltersPage, {
      currentFilter: _.cloneDeep(this.propertyFilter),
      defaultToSuburb: showSuburbs
    }, {
        cssClass: 'filters-modal',
        enableBackdropDismiss: !showSuburbs
      });
    filterModal.present();
  }

  createLoader() {
    return this.loading.create({
      content: this.translate.instant('LoadingPropertiesLoader'),
      spinner: "crescent"
    });
  }

}
