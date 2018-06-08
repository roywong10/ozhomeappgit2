import { TranslateService } from '@ngx-translate/core';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { AlertService } from './../../shared/alert.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController, AlertController } from 'ionic-angular';
import { Diagnostic } from '@ionic-native/diagnostic';
import { LoginPage } from './../login/login';
import { GlobalSettings } from "../../shared/shared";
import { SignUpPage } from "../sign-up/sign-up";
import { permissionService } from "../../shared/permissionService";

@IonicPage()
@Component({
  selector: 'page-request-location-access',
  templateUrl: 'request-location-access.html',
})
export class RequestLocationAccessPage {

  appFirstTime: boolean;

  constructor(public navCtrl: NavController,
    private viewCtrl: ViewController,
    public navParams: NavParams,
    private platform: Platform,
    private diagnostic: Diagnostic,
    private locationAccuracy: LocationAccuracy,
    private alertService: AlertService,
    private alertCtrl: AlertController,
    private globalSettings: GlobalSettings,
    private translate: TranslateService,
    private permissionService: permissionService) {
    this.appFirstTime = this.globalSettings.getSettings().appOpenedFirstTime;
  }

  skipLocationAccessUp() {

    if (this.appFirstTime) {
      this.navCtrl.setRoot(LoginPage);
    }
    else {
      this.viewCtrl.dismiss();
    }

  }

  requestAccess() {

    this.permissionService.checkLocationPermissions().then(hasLocationPermissions => {
      if (hasLocationPermissions) {
        //Check for location service setting is enabled
        this.permissionService.checkLocationEnabled().then(available => {
          if (available) {
            this.skipLocationAccessUp();
          } else {
            this.requestEnableLocation();
          }
        })

      } else {
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
    })

  }

  private requestEnableLocation() {

    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        // the accuracy option will be ignored by iOS
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(() => {
          this.skipLocationAccessUp();
        }, error => {
          this.skipLocationAccessUp();
        });
      }
    });

  }
}
