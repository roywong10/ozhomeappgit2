import { StorageService } from './../../services/storage.service';
import { SignUpPage } from './../sign-up/sign-up';
import { LoginPage } from './../login/login';
import { RequestLocationAccessPage } from "../request-location-access/request-location-access";

import { GlobalSettings } from './../../shared/shared';
import { TabsPage } from './../tabs/tabs';
import { PropertyListPage } from './../property-list/property-list';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {TranslateService} from '@ngx-translate/core';


@IonicPage()
@Component({
  selector: 'page-select-language',
  templateUrl: 'select-language.html'
})
export class SelectLanguagePage {

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private storageService: StorageService,
    private globalSettings: GlobalSettings,
    private translate: TranslateService) {
  }

  setLanguage(lang: string) {
    this.globalSettings.setLanguage(lang);
    this.translate.use(lang);
    this.navCtrl.setRoot(RequestLocationAccessPage);
  }

}
