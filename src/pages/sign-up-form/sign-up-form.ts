import { TranslateService } from '@ngx-translate/core';
import { IUserAccount } from './../../models/userAccount';
import { PrivacyPolicyPage } from './../privacy-policy/privacy-policy';
import { TermsConditionsPage } from './../terms-conditions/terms-conditions';
import { Component, OnInit } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators } from "@angular/forms";
import { IonicPage, NavController, NavParams, ViewController, LoadingController, ModalController } from 'ionic-angular';
import { User, GlobalSettings, Authentication } from './../../shared/shared';
import { RequestLocationAccessPage } from "../request-location-access/request-location-access";

@IonicPage()
@Component({
  selector: 'page-sign-up-form',
  templateUrl: 'sign-up-form.html',
})
export class SignUpFormPage implements OnInit {

  signupForm: FormGroup;
  errorMessage: string = '';
  isFirstTime: boolean;
  hasSubmitted: boolean = false;
  newUser: IUserAccount;
  tabBarElement: any;
  language: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private loadingCtrl: LoadingController,
    private auth: Authentication,
    private user: User,
    private globalSettings: GlobalSettings,
    private modalCtrl: ModalController,
    private translate: TranslateService) {
    this.language = this.globalSettings.getSettings().language;
    this.isFirstTime = this.globalSettings.getSettings().appOpenedFirstTime;
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
  }

  //https://www.joshmorony.com/advanced-forms-validation-in-ionic-2/
  ngOnInit() {
    this.initForm();
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

  initForm() {
    let firstName = '';
    let lastName = '';
    let email = '';
    let password = '';
    let state = '';
    let postcode = '';
    let agreeTerms = false;

    this.signupForm = new FormGroup({
      firstName: new FormControl(firstName, Validators.required),
      lastName: new FormControl(lastName),
      email: new FormControl(email, [Validators.required, Validators.email]),
      password: new FormControl(password, [Validators.required, Validators.minLength(8)]),
      state: new FormControl(state),
      postcode: new FormControl(postcode, [Validators.minLength(4), Validators.maxLength(4)]),
      agreeTerms: new FormControl(agreeTerms, [Validators.requiredTrue]),
    });
  }

  goBackToPreviousPage() {
    if (this.isFirstTime === true) {
      this.navCtrl.setRoot(RequestLocationAccessPage)
    } else {
      //Request location page
      //My account
      //Alerts
      //Shortlist
      this.navCtrl.remove(this.viewCtrl.index - 1, 2);
    }
  }

  onSubmit() {
    this.errorMessage = "";
    this.hasSubmitted = true;

    if (this.signupForm.dirty && this.signupForm.valid) {

      let values = this.signupForm.value;
      //todo: creata nice model for this to extend from userprofile
      var registerModel = {
        Email: values.email,
        Password: values.password,
        FirstName: values.firstName,
        LastName: values.lastName,
        Suburb: values.suburb,
        Postcode: values.postcode,
        State: values.state
      }

      let loader = this.loadingCtrl.create({
        content: this.translate.instant("Registering") + " ...",
        duration: 1000,
        spinner: "crescent"
      });

      loader.present();

      this.user.registerLocalUser(registerModel)
        .subscribe((response: any) => {

          if (response.IsValid === true) {

            this.auth.credentialsLogin({
              username: registerModel.Email,
              password: registerModel.Password
            }).subscribe(token => {

              this.newUser = {
                email: registerModel.Email,
                firstName: registerModel.FirstName,
                lastName: registerModel.LastName
              }

              this.user.setUser(this.newUser);

              this.goBackToPreviousPage();

            });

          } else {
            this.errorMessage = this.translate.instant(response.Errors[0].ErrorMessage);
          }

        });
    }

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
