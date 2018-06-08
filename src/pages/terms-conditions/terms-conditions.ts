import { PrivacyPolicyPage } from './../privacy-policy/privacy-policy';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

/**
 * Generated class for the TermsConditions page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-terms-conditions',
  templateUrl: 'terms-conditions.html',
})
export class TermsConditionsPage {

  constructor(public navCtrl: NavController, 
   private modalCtrl: ModalController,
   public navParams: NavParams) {
  }


viewPrivacyPolicy() {
    let privacyModal = this.modalCtrl.create(PrivacyPolicyPage);
    privacyModal.present();
  }

  viewTermsConditions() {
    let termsModal = this.modalCtrl.create(TermsConditionsPage);
    termsModal.present();
  }
}
