import { IRealEstateAgent } from './../../models/realEstateAgent';
import { TranslateService } from '@ngx-translate/core';
import { permissionService } from './../../shared/permissionService';
import { AlertService } from './../../shared/alert.service';
import { IPropertyEnquiry } from './../../models/propertyEnquiry';
import { IInspection } from './../../models/inspection';
import { Calendar } from '@ionic-native/calendar';
import { IPropertySummary } from './../../models/propertySummary';
import { SocialSharing } from '@ionic-native/social-sharing';
import { PropertyService } from './../../services/property.service';
import { IProperty } from './../../models/property';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Platform, LoadingController, AlertController, ToastController, ViewController, Slides } from 'ionic-angular';
import { SMS } from "@ionic-native/sms";
import { EnquiryForm } from './../enquiry-form/enquiry-form';
import * as moment from 'moment';
import { ImagePopoverComponent } from './image-popover';
import { GlobalSettings } from "../../shared/shared";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

declare var google;
declare var Bugsnag: any;

@IonicPage()
@Component({
  selector: 'page-property-detail',
  templateUrl: 'property-detail.html'
})
export class PropertyDetailPage implements OnInit {

  @ViewChild('map') mapElement: ElementRef;
  propertyMap: any;
  errorMessage: any;
  property: IProperty;
  images: Array<any>;
  isFullDescriptionShown: boolean;
  smsEnabled: boolean;
  isDataLoaded: boolean;
  tabBarElement: any;
  isTablet: boolean;
  showInspectionAuctionTimes: boolean = true;
  videoEmbedUrl: SafeResourceUrl;
  primaryAgent: IRealEstateAgent;
  hasMoreThanOneSlide: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private viewCtrl: ViewController,
    private alertService: AlertService,
    private propertyService: PropertyService,
    private permissionService: permissionService,
    private socialSharing: SocialSharing,
    private platform: Platform,
    private sms: SMS,
    private calendar: Calendar,
    private loadingCtrl: LoadingController,
    private globalSettings: GlobalSettings,
    private translate: TranslateService,
    private sanitizer: DomSanitizer
  ) {
    this.property = this.navParams.get('property');
    this.isFullDescriptionShown = false;
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    this.isTablet = this.globalSettings.isDeviceTablet();
  }

  ionViewWillEnter() {
    this.showInspectionAuctionTimes = this.hasTimesToShow();
    //this.tabBarElement.style.display = 'none';
  }

  ionViewWillLeave() {
    //this.tabBarElement.style.display = 'flex';
  }

  ionViewDidLoad() {
    //this.loadMap();
  }

  ngOnInit(): void {
 

    if (this.property.VideoUrl != null && this.property.VideoUrl != '') {
      //https://ctrlq.org/code/19797-regex-youtube-id
      const youtube_regex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
      var match = this.property.VideoUrl.match(youtube_regex);
      console.log(match)
      if (match && match[7].length == 11) {
        this.videoEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + match[7] + '?rel=0');
      }
    }

    this.primaryAgent = this.property.Agents.find(agent => agent.AgentContactMobile.length > 0 || agent.AgentContactPhone.length > 0);
    this.smsEnabled = this.primaryAgent != null && this.primaryAgent.AgentContactMobile.length > 0;
    this.hasMoreThanOneSlide = this.property.Images && (this.property.Images.length > 1 || (this.property.Images.length == 0 && this.property.VideoUrl != ''));
  }

  hasTimesToShow(): boolean {
    if (this.property.IsSold) {
      return false;
    }

    if (this.property.SaleType.toLowerCase() == "auction") {
      return moment().isBefore(moment(this.property.AuctionDate));
    }

    return this.property.Inspections.length > 0;
  }

  showImages(index: number) {
    if (!this.isTablet) {
      const imageModel = this.modalCtrl.create(ImagePopoverComponent, { index: index, images: this.property.Images, videoUrl: this.videoEmbedUrl }, { showBackdrop: true, enableBackdropDismiss: true })
      imageModel.present();
    }
  }

  showFloorplans() {
    const imageModel = this.modalCtrl.create(ImagePopoverComponent, { index: 0, images: this.property.FloorPlans }, { showBackdrop: true, enableBackdropDismiss: true })
    imageModel.present();
  }

  scheduleAppointment() {

    var enquiryModel = <IPropertyEnquiry>{
      propertyId: this.property.PropertyID,
      propertyType: this.property.PropertyType,
      inspectionTimes: true
    };

    const scheduleModal = this.modalCtrl.create(EnquiryForm, { enquiryOptions: enquiryModel });
    scheduleModal.present();

  }

  emailEnquiry() {
    var enquiryModel = <IPropertyEnquiry>{
      propertyId: this.property.PropertyID,
      propertyType: this.property.PropertyType
    };
    const propertyEnquiryModal = this.modalCtrl.create(EnquiryForm, { enquiryOptions: enquiryModel });
    propertyEnquiryModal.present();
  }

  showAgentNumber(agent: IRealEstateAgent): boolean {
    return agent.AgentContactMobile.length > 0 || agent.AgentContactPhone.length > 0;
  }

  callAgent(agent: IRealEstateAgent) {
    var number = this.getAgentNumber(agent);
    setTimeout(() => {
      window.open('tel:' + number.replace(/\s/g, ''), "_self");
    }, 300);
  }

  getAgentNumber(agent: IRealEstateAgent, showDisplayFormat: boolean = false): string {
    var number = agent.AgentContactMobile.length > 0 ? agent.AgentContactMobile : agent.AgentContactPhone;

    if (showDisplayFormat) {
      var phStatecode_regex = /^[0-9][0-9]\s+/
      var match = number.match(phStatecode_regex);
      if (match && match.length > 0) {
        number = '(' + match[0].substr(0, 2) + ')' + number.substr(2);
      }
    }
    return number;
  }

  smsAgent() {
    if (this.platform.is('cordova')) {
      this.sendSms();
    } else {
      this.alertService.showAlert('Error', 'SMS is native', null)
    }
  }

  sendSms() {
    var msgContent = "Property Request for : " + this.property.Address + ". \r\n\r\n" + this.property.WebsiteUrl;
    this.sms.send(this.primaryAgent.AgentContactMobile, msgContent, { android: { intent: 'INTENT' } })
      .then((result) => {
        //Do nothing
      }, (error) => {
        let errorToast = this.toastCtrl.create({
          message: this.translate.instant('Message not sent'),
          duration: 3000
        })
        errorToast.present();
      });
  }



  getDateTimeComponent(dateTime: Date): string {
    return moment(dateTime).format('h:mma');
  }

  getDateComponent(dateTime: Date): string {
    return moment(dateTime).format('ddd D MMM, YYYY');
  }

  addInspectionToCalendar(property: IProperty, inspection: IInspection) {

    this.permissionService.checkCalendarPermissions().then(authorized => {
      if (authorized) {
        this.calendar.createEventInteractively("Inspection for " + property.Address, property.Address, '', new Date(inspection.startDateTime), new Date(inspection.endDatetime));
      } else {
        this.alertService.showAlert('Error', 'Calendar access is required.', null);
      }
    });

  }

  addAuctionToCalendar(property: IProperty) {

    this.permissionService.checkCalendarPermissions().then(authorized => {
      if (authorized) {
        this.calendar.createEventInteractivelyWithOptions("Auction for " + property.Address, property.Address, '', new Date(property.AuctionDate));
      } else {
        this.alertService.showAlert('Error', 'Calendar access is required.', null);
      }
    });

  }

  toggleDescription() {
    this.isFullDescriptionShown = !this.isFullDescriptionShown;
  }

  onSocialShare() {
    this.socialSharing.share("Check out this property on OzHome:", "OzHome: " + this.property.Address, this.property.Images[0], this.property.WebsiteUrl);
  }

  onViewRelatedProperty(property: IPropertySummary) {
    this.propertyService.getPropertyById(property.PropertyID).subscribe(p => {
      if (p.IsValid) {
        let propertyModal = this.modalCtrl.create(PropertyDetailPage, { property: p.ReturnValue }, { cssClass: 'property-modal' });
        propertyModal.present();
      } else {
        if (Bugsnag) {
          let propId = (property) ? property.PropertyID : 'undefined property';
          Bugsnag.notify("getPropertyById", "property-details.ts onViewRelatedProperty " + JSON.stringify(p.Errors) + " property id " + propId);
        }
      }
    });
  }

  loadExternalMaps() {
    let destination = this.property.Latitude + ',' + this.property.Longtitude;

    if (this.platform.is('ios')) {
      window.open('maps://?q=' + destination, '_system');
    } else {
      let label = encodeURI('Map');
      window.open('geo:0,0?q=' + destination + '(' + label + ')', '_system');
    }
  }

}