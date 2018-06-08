import { LoginPage } from './../login/login';
import { PropertyService } from './../../services/property.service';
import { ShortlistMergeService } from './../../services/shortlistmerge.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { IonicPage, NavController, ModalController, Events } from 'ionic-angular';
import { ShortlistMapPage } from './../shortlist-map/shortlist-map';
import { PropertyDetailPage } from './../property-detail/property-detail';
import { IPropertySummary } from "../../models/propertySummary";
import { GlobalSettings, Authentication } from "../../shared/shared";
import { Subscription } from "rxjs";

declare var Bugsnag: any;

@IonicPage()
@Component({
  selector: 'page-shortlist',
  templateUrl: 'shortlist.html',
})
export class ShortlistPage implements OnInit, AfterViewInit {
  shortlistProperties: Array<IPropertySummary>;
  errorMessage: string;
  pageNum: number;
  isTablet: boolean;
  isLoggedIn: boolean;
  subscription: Subscription = null;
  loadingProperty:boolean = false; //To prevent multiple clicks from happening

  constructor(public navCtrl: NavController,
    private propertyService: PropertyService,
    private shortlistMergeService: ShortlistMergeService,
    private authentication: Authentication,
    private globalSettings: GlobalSettings,
    private modalCtrl: ModalController,
    private event:Events) {
    this.shortlistProperties = new Array<IPropertySummary>();
    this.pageNum = 1;
    this.isTablet = this.globalSettings.isDeviceTablet();
  }

  onToggleMapView() {
    this.navCtrl.setRoot(ShortlistMapPage, { properties: this.shortlistProperties });
  }

  ngOnInit(): void {
      
  }

  ionViewDidLeave() {
      this.subscription.unsubscribe();
      this.event.unsubscribe("shortlistsplitpage:enter");
  }
    
  ionViewDidEnter(): void {
      this.isLoggedIn = this.authentication.isUserLoggedIn();
      this.event.subscribe("shortlistsplitpage:enter",()=>{
        this.isLoggedIn = this.authentication.isUserLoggedIn();
      });
       this.subscription = this.shortlistMergeService.currentShortlistedProperties.subscribe(properties => {
        this.shortlistProperties = properties; 
      });
    
  }
   ngAfterViewInit(){
     this.shortlistMergeService.readMergeShorlistedProperties().then();
   }

   onViewProperty(propertyId: number) {
     if (!this.loadingProperty) {
       this.loadingProperty = true;
       this.propertyService.getPropertyById(propertyId).subscribe(p => {
         if (p.IsValid) {
           let propertyModal = this.modalCtrl.create(PropertyDetailPage, { property: p.ReturnValue }, { cssClass: 'property-modal' });
           propertyModal.present().then(() => {
             this.loadingProperty = false;
           });
         } else {
           if (Bugsnag) {
             Bugsnag.notify("getPropertyById", "shortlist.ts onViewProperty " + JSON.stringify(p.Errors) + " property Id " + propertyId);
           }
            this.loadingProperty = false;
         }
       });
     }
   }

  goLoginPage() {
    this.navCtrl.push(LoginPage);
  }
}
