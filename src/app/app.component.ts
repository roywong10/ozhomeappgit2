import { NetworkService } from './../services/network.service';
import { Authentication } from './../shared/authentication.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { GlobalSettings, User } from './../shared/shared';
import { Component, ViewChild } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TabsPage } from '../pages/tabs/tabs';
import { RequestLocationAccessPage } from '../pages/request-location-access/request-location-access';
import { Storage } from '@ionic/storage';
import { SelectLanguagePage } from "../pages/select-language/select-language";
import { TranslateService } from '@ngx-translate/core';
import { Events, NavController } from 'ionic-angular';
import { LoginPage } from '../pages/login/login';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any;
  @ViewChild('rootNav') nav: NavController;

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private screenOrientation: ScreenOrientation,
    private storage: Storage,
    private user: User,
    private auth: Authentication,
    private globalSettings: GlobalSettings,
    private translate: TranslateService,
    private networkService: NetworkService,
    private event: Events) {
    this.translate.setDefaultLang('zh');
    this.translate.setDefaultLang('en');
    this.initialiseApp();
  }

  initialiseApp() {

    this.platform.ready().then(() => {

      this.setScreenOrientation().then(() => {

        this.splashScreen.show();

        this.storage.ready().then(() => {

          this.globalSettings.initSettingsFromStorage().then(() => {

            this.auth.initAccessToken().then(() => {
                  this.inititalAppPage();
            });
          });
        });
      });
    });

  }

  private inititalAppPage(): void {
    if (this.globalSettings.getSettings().language === "") {
      this.rootPage = SelectLanguagePage;
    } else if (this.globalSettings.getSettings().appOpenedFirstTime === true) {
      //how far did they get through the sign up porcess ?
      if (this.auth.isUserLoggedIn()) {
        //have they granted access to location servies (and has it not yet been denied ?)
        this.rootPage = RequestLocationAccessPage;
      } else {
        //this.user.
        this.rootPage = LoginPage;
      }
    } else {
      this.rootPage = TabsPage;
    }

    // Okay, so the platform is ready and our plugins are available.
    // Here you can do any higher level native things you might need.
    this.statusBar.styleDefault();
    setTimeout(() => {
      this.splashScreen.hide();
    }, 100);

    this.event.subscribe('token:expired', () => {
      this.auth.clearLoginDetails();
    });

    this.event.subscribe('network:error', ()=> {
      this.networkService.showNetworkAlert();
    });

  }

  setScreenOrientation(): Promise<any> {
    
    this.globalSettings.lockDeviceOrientation();

    //Browser 
    return Promise.resolve();

  }

}
