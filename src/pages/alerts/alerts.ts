import { AlertService } from './../../shared/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { PropertyFilterService } from './../../services/property.filter.service';
import { ISuburb } from './../../models/suburb';
import { AlertsEditPage } from './../alerts-edit/alerts-edit';
import { Authentication } from './../../shared/authentication.service';
import { PropertyAlertsService } from './../../services/alerts.service';
import { LoginPage } from './../login/login';
import { SignUpFormPage } from './../sign-up-form/sign-up-form';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Events } from 'ionic-angular';
import { GlobalSettings } from "../../shared/shared";
import { IPropertyAlert } from "../../models/propertyAlert";

@IonicPage()
@Component({
  selector: 'page-alerts',
  templateUrl: 'alerts.html',
})
export class AlertsPage {

  alerts: Array<IPropertyAlert>;
  isLoggedIn: boolean;
  isLoading: boolean = true;
  tabBarElement: any;
   private _expiredTokenHandler: () => void;

  //Misc
  isTablet: boolean;
  anyStr = "Any";
  allStr = "All";
  maxPrice = 5000000;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private alertsService: PropertyAlertsService,
    private propertyFilterService: PropertyFilterService,
    private auth: Authentication,
    public globalSettings: GlobalSettings,
    private alertService: AlertService,
    private modalCtrl: ModalController,
    private event: Events,
    private translate: TranslateService) {

    this._expiredTokenHandler =  ()=>{
        this.isLoggedIn = false;
        this.alerts =  new Array<IPropertyAlert>();
    };

    this.alerts = new Array<IPropertyAlert>();
    this.isTablet = this.globalSettings.isDeviceTablet();
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.alerts = new Array<IPropertyAlert>();
    this.isLoggedIn = this.auth.isUserLoggedIn();
    if (this.isLoggedIn) {
      this.getAlertList();
    }else{
      this.isLoading = false;
    }
  }

  ionViewDidLoad(){
    this.event.subscribe('token:expired', this._expiredTokenHandler);
  }

  ionViewWillUnload(){
    this.event.unsubscribe('token:expired', this._expiredTokenHandler);
  }

  goLoginPage() {
    this.navCtrl.push(LoginPage);
  }

  getAlertList() {
    this.isLoading = true;
    this.alertsService.getUserAlerts(this.auth.getAccessToken())
      .subscribe(data => {
        this.alerts = data.ReturnValue;
        this.isLoading = false;
      });
  }



  goSignUpForm() {
    this.navCtrl.push(SignUpFormPage);
  }

  createAlert() {
    let newAlert = <IPropertyAlert>{
      Id: '',
      AlertName: '',
      PriceFrom: 0,
      PriceTo: 0,
      Locations: '',
      PropertyType: this.translate.instant(this.allStr),
      propertyTypeList: new Array<string>('All'),
      Bedrooms: 0,
      Parking: 0,
      Bathrooms: 0,
      IsSold: false,
      IncludeSurroundingSuburb: true,
      suburbs: new Array<ISuburb>(),
    };

    let createModal = this.modalCtrl.create(AlertsEditPage, { propertyAlert: newAlert });
    createModal.onDidDismiss(data => {
      this.getAlertList();
    });
    createModal.present();

  }

  editAlert(alert: IPropertyAlert) {
    let editModal = this.modalCtrl.create(AlertsEditPage, { propertyAlert: alert });
    editModal.onDidDismiss(data => {
      this.getAlertList();
    });
    editModal.present();
  }

  onSearch(alert: IPropertyAlert) {
    let searchFilter = this.propertyFilterService.getFilterFromAlert(alert);
    this.propertyFilterService.setFilter(searchFilter);
    // this.event.publish('alert:search');
    this.navCtrl.parent.select(0);
  }

  getDisplayPropertyTypes(propertyTypes: Array<string>) {
    let typeStr = this.translate.instant(this.allStr);

    if (propertyTypes.length > 0 && propertyTypes[0] != "All") {
      typeStr = this.translate.instant(propertyTypes[0]);

      if (propertyTypes.length > 1) {
        typeStr += "+" + (propertyTypes.length - 1);
      }
    }

    return typeStr;
  }

  getDisplayPrice(min: number, max: number) {
    var minPriceStr = this.translate.instant(this.anyStr);
    var maxPriceStr = this.translate.instant(this.anyStr);

    if (min > 0) {
      minPriceStr = "$" + min.toLocaleString("en-US") + (min == this.maxPrice ? '+' : '');
    }
    if (max > 0) {
      maxPriceStr = "$" + max.toLocaleString("en-US") + (max == this.maxPrice ? '+' : '');
    }

    return minPriceStr + ' - ' + maxPriceStr;
  }

  getDisplaySuburbs(suburbs: Array<ISuburb>) {
    let suburbStr = "";
    if (suburbs.length > 0) {
      if (suburbs.length > 4) {
        suburbStr = suburbs[0].Suburb;
        suburbStr += " +" + (suburbs.length - 1) + " " + this.translate.instant('more');
      } else {
        var list = [];
        suburbs.map(s => {
          list.push(s.Suburb)
        });
        suburbStr = list.join(', ');
      }
    }
    return suburbStr
  }
}
