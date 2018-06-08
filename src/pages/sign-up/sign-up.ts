import { SignUpFormPage } from './../sign-up-form/sign-up-form';
import { StorageService } from './../../services/storage.service';
import { TabsPage } from './../tabs/tabs';
import { GlobalSettings } from './../../shared/shared';
import { LoginPage } from './../login/login';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html'
})
export class SignUpPage {

  isFirstTime: boolean = true;
  tabBarElement: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private modalCtrl: ModalController,
    private storageService: StorageService,
    private globalSettings: GlobalSettings) {

    this.isFirstTime = this.globalSettings.getSettings().appOpenedFirstTime;
	  this.tabBarElement = document.querySelector('.tabbar.show-tabbar');

  }

  goLoginPage() {
    this.navCtrl.push(LoginPage);
  }

  goSignUpForm() {
    this.navCtrl.push(SignUpFormPage);
  }

  ionViewWillEnter() {
    if (this.tabBarElement) {
      this.tabBarElement.style.display = 'none';
    }
  }

  ionViewWillLeave() {
    if (this.tabBarElement) {
      this.tabBarElement.style.display = 'flex';
    }
  }

  skipSignUp() {
    this.globalSettings.setAppOpenedFirstTime(false);
    this.navCtrl.setRoot(TabsPage);
  }

}
