import { ShortlistMergeService } from './../../services/shortlistmerge.service';
import { LoginPage } from './../login/login';
import { TermsConditionsPage } from './../terms-conditions/terms-conditions';
import { PrivacyPolicyPage } from './../privacy-policy/privacy-policy';
import { IUserAccount } from './../../models/userAccount';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, LoadingController, ToastController } from 'ionic-angular';
import { GlobalSettings, User, Authentication } from "../../shared/shared";
import { EditProfilePage } from "../edit-profile/edit-profile";
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-my-account',
  templateUrl: 'my-account.html',
})
export class MyAccountPage {
  userAccount: IUserAccount = null;
  isLoggedIn: boolean;
  language: string;
  feedbackEmail: string;
  feedbackSubject: string;
  tabBarElement: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private auth: Authentication,
    private user: User,
    private globalSettings: GlobalSettings,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private translate: TranslateService,
    private shortlistMergeService: ShortlistMergeService) {
      translate.use(globalSettings.getSettings().language);
      this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    }

  ionViewWillEnter() {
    this.language = this.globalSettings.getSettings().language;
    this.feedbackEmail = this.globalSettings.getSettings().feedbackEmail;
    this.feedbackSubject = this.globalSettings.getSettings().feedbackSubject;
    this.isLoggedIn = this.auth.isUserLoggedIn();
    this.userAccount = this.user.getUser();

    if (this.tabBarElement) {
      this.tabBarElement.style.display = 'flex';
    }
    //throw new Error('some error')
  }

  goSignupPage() {
    this.navCtrl.push(LoginPage);
  }

  logOut() {

    let loader = this.loadingCtrl.create({
      content: this.translate.instant('LogoutMessage'),
      duration: 1000,
      spinner: "crescent"
    });

    loader.present();

    this.auth.logout().subscribe(() => {
      this.isLoggedIn = false;
      this.userAccount = null;
      this.shortlistMergeService.clearShortlist();
    });
  }

  editProfile() {

    this.user.getCurrentMemberData(this.auth.getAccessToken())
      .subscribe(data => {
        if (data && data.IsValid) {
          let profileInfo = data.ReturnValue;

          let userProfile = {
            email: profileInfo.Email,
            firstName: profileInfo.FirstName,
            lastName: profileInfo.LastName,
            state: profileInfo.State,
            suburb: '',
            postcode: profileInfo.Postcode,
            isSocialLogin: profileInfo.IsSocialLogin
          }

          let editProfileModal = this.modalCtrl.create(EditProfilePage, { userProfile: userProfile });
          editProfileModal.present();
        }

      }, error => {
        this.isLoggedIn = false;
        this.userAccount = null;
      });
  }

  changeLanguage(lang) {
    this.globalSettings.setLanguage(lang);
    this.translate.use(lang);
    this.language = lang;
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
