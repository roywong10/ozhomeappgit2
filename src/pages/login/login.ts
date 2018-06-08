import { TranslateService } from '@ngx-translate/core';
import { AlertService } from './../../shared/alert.service';
import { ForgotPasswordPage } from './../forgot-password/forgot-password';
import { SignUpFormPage } from './../sign-up-form/sign-up-form';
import { TabsPage } from './../tabs/tabs';
import { Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { ShortlistMergeService } from './../../services/shortlistmerge.service';

import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController, LoadingController } from 'ionic-angular';
import { GlobalSettings, User, Authentication } from "../../shared/shared";

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class LoginPage implements OnInit {

  isFirstTime: boolean = true;
  hasSubmitted: boolean = false;
  loginForm: FormGroup;
  errorMessage: string = '';
  tabBarElement: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private auth: Authentication,
    private user: User,
    private globalSettings: GlobalSettings,
    private translate: TranslateService,
    private viewCtrl: ViewController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private alertService: AlertService,
    private ShortlistMergeService: ShortlistMergeService) {

    this.isFirstTime = this.globalSettings.getSettings().appOpenedFirstTime;
	  this.tabBarElement = document.querySelector('.tabbar.show-tabbar');

  }

  ngOnInit(): void {
    this.initForm();
  }

  ionViewWillEnter() {
    if (this.tabBarElement) {
      this.tabBarElement.style.display = 'none';
    }
  }

  ionViewWillLeave() {
    if (this.tabBarElement) {
      this.tabBarElement.style.display = null;
    }
  }

  skipLogin(){
     this.globalSettings.setAppOpenedFirstTime(false);
     this.navCtrl.setRoot(TabsPage);
  }

  initForm() {

    let username = '';
    let password = '';

    this.loginForm = new FormGroup({
      username: new FormControl(username, [Validators.required, Validators.email]),
      password: new FormControl(password, [Validators.required]),
    });

  }
  goSignUpForm(){
    this.navCtrl.push(SignUpFormPage);
  }

  goForgotPwd() {
    this.navCtrl.push(ForgotPasswordPage);
  }

  facebookLogin () {

    let loader = this.loadingCtrl.create({
        content: this.translate.instant("LoginMessage"),
        duration: 1000,
		    spinner: "crescent"
      });

    loader.present();

    if(this.isFirstTime){
      this.navCtrl.setRoot(TabsPage);
    }
    this.auth.facebookLogin()
    .subscribe( token => {
      // Now use the retrieved access token to perform authenticated requests to the API

        let newUser = {
          email: token.email
        }

        this.user.setUser(newUser);
        this.ShortlistMergeService.readMergeShorlistedProperties().then()

        if(this.isFirstTime){
          this.globalSettings.setAppOpenedFirstTime(false);


        }else{
          this.navCtrl.pop();
        }
    });
  }

  onSubmit() {
    this.errorMessage = "";
    this.hasSubmitted = true;

    if (this.loginForm.dirty && this.loginForm.valid) {

      let values = this.loginForm.value;

      var loginModel = {
        Username: values.username,
        Password: values.password,
      }

      let loader = this.loadingCtrl.create({
        content: this.translate.instant("LoginMessage"),
        duration: 1000,
		    spinner: "crescent"
      });

      loader.present();

      this.auth.credentialsLogin({
        username: loginModel.Username,
        password: loginModel.Password
      }).subscribe(token => {

        let newUser = {
          email: loginModel.Username
        }

        this.user.setUser(newUser);

        this.ShortlistMergeService.readMergeShorlistedProperties().then()

        if(this.isFirstTime){
          this.globalSettings.setAppOpenedFirstTime(false);
          this.navCtrl.setRoot(TabsPage);
        } else {

        /*   let currentIndex = this.viewCtrl.index;
          let startIndex =  (currentIndex  <= 1) ?  1 :  currentIndex - 1 ;
          let removeCount = (currentIndex <= 1) ? 1: 2;
          this.navCtrl.remove(startIndex, removeCount); */
          this.navCtrl.pop();
        }
      }, error => {

         this.errorMessage = error;

      });

    }

  }

}
