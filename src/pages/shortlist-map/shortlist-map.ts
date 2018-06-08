import { GlobalSettings } from './../../shared/globalSettings';
import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { IPropertySummary } from "../../models/propertySummary";
import { PropertyDetailPage } from './../property-detail/property-detail';
import { ShortlistPage } from './../shortlist/shortlist';
import { ShortlistMergeService } from './../../services/shortlistmerge.service';
import { IonicPage, NavController, NavParams, ModalController, LoadingController, AlertController, Alert } from 'ionic-angular';
import { LatLng } from "@ionic-native/google-maps";
import { PropertyService } from './../../services/property.service';
import { Subscription } from 'rxjs';

declare var google;
declare var Bugsnag: any;

@IonicPage()
@Component({
    selector: 'shortlist-map',
    templateUrl: 'shortlist-map.html'
})
export class ShortlistMapPage implements OnInit {

    @ViewChild('map') mapElement: ElementRef;

    private isTablet: boolean

    private propertyMap: any;

    private hasCentered: boolean = false;

    private shortlistProperties: Array<IPropertySummary>;

    private markers: Array<any> = [];

    private totalProperties: number = 0;

    private shortlistSubscription: Subscription = null;

    public selectedProperty: IPropertySummary = null;

    constructor(private navParams: NavParams,
        private globalSettings: GlobalSettings,
        private navCtrl: NavController,
        private shortlistMergeService: ShortlistMergeService,
        private zone: NgZone,
        private modalCtrl: ModalController,
        private propertyService: PropertyService) {
        this.isTablet = globalSettings.isDeviceTablet();
    }

    ngOnInit(): void {

    }

    ionViewWillEnter() {
        this.createMap();
        this.shortlistSubscription = this.shortlistMergeService.currentShortlistedProperties.subscribe(properties => {
            this.shortlistProperties = properties;
            this.totalProperties = this.shortlistProperties.length;
            this.selectedProperty = null;
            this.updateMarkers();
        });
    }

    ionViewWillLeave() {
        if (this.shortlistSubscription != null) {
            this.shortlistSubscription.unsubscribe();
        }
    }

    updateMarkers() {
        
        this.markers.forEach(m => m.setMap(null));
        this.markers = [];
            
        let bounds = new google.maps.LatLngBounds();
        this.shortlistProperties.forEach(sp => {
            this.addMarker(sp, bounds);
        });

        if (this.markers.length > 0) {
            this.propertyMap.fitBounds(bounds);
        } else {
            var latlng = new google.maps.LatLng("-37.8489670", "144.9889660");
            this.propertyMap.setCenter(latlng)
        }

    }

    addMarker(property: IPropertySummary, bounds: any): any {
        //create LatLng object
        let latLng: LatLng = new LatLng(property.Latitude, property.Longtitude);
        let marker = new google.maps.Marker({
            map: this.propertyMap,
            position: latLng,
            icon: 'assets/svg/pin.svg'
        });

        this.markers.push(marker);
        google.maps.event.addListener(marker, 'click', () => {

            //this.propertyMap.setCenter(marker.getPosition());
            this.zone.run(() => {
                this.selectedProperty = property;
            });

        });

        if (bounds) {
            bounds.extend(latLng);
        }
    }

    createMap(): void {

        let mapOptions = {
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            setMyLocationEnabled: false //todo work out
        }

        this.propertyMap = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        var latlng = new google.maps.LatLng("-37.8489670", "144.9889660");

        this.propertyMap.setCenter(latlng)
    }

    onSelectRoadMap() {
        this.propertyMap.setMapTypeId('roadmap');
    }

    onSelectSatellite() {
        this.propertyMap.setMapTypeId('satellite');
    }

    onToggleListView() {
        this.navCtrl.setRoot(ShortlistPage);
    }

    onViewProperty(propertyId: number) {
        this.propertyService.getPropertyById(propertyId).subscribe(p => {
            if(p.IsValid){
                const propertyDetailModal = this.modalCtrl.create(PropertyDetailPage, { property: p.ReturnValue }, { cssClass: 'property-modal' });
                propertyDetailModal.present();
            }else{
                if(Bugsnag){
                     Bugsnag.notify("getPropertyById", "shortlist-map.ts onViewProperty "+ JSON.stringify(p.Errors) + " property Id "+propertyId)
                }
            }
        });
    }

}