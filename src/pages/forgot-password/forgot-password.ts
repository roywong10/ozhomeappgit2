import { TranslateService } from '@ngx-translate/core';
import { AlertService } from './../../shared/alert.service';
import { LoginPage } from './../login/login';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { User } from "../../shared/shared";


@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage implements OnInit {

  loginPage = LoginPage;
  forgotPwdForm: FormGroup;
  hasSubmitted: boolean = false;
  formSuccess: boolean = false;
  errorMessage: string;
  tabBarElement: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private user: User,
    private translate: TranslateService,
    private alertService: AlertService,
	private nativePageTransitions: NativePageTransitions) {
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
	// Does not seems to work
    let options: NativeTransitionOptions = {
      direction: 'right'
    };

    this.nativePageTransitions.slide(options);

    if (this.tabBarElement) {
      this.tabBarElement.style.display = 'flex';
    }
  }

  initForm() {
    let email = '';

    this.forgotPwdForm = new FormGroup({
      email: new FormControl(email, [Validators.required, Validators.email])
    });
  }

  onSubmit() {
    this.errorMessage = "";
    this.hasSubmitted = true;

    if (this.forgotPwdForm.dirty && this.forgotPwdForm.valid) {
      let values = this.forgotPwdForm.value;

      this.user.forgotPassword(values.email)
        .subscribe(response => {
          if (response.IsValid === true) {
            var successMsg = this.translate.instant('ForgotPwdSuccessMsg', {email: values.email});
            this.alertService.showAlert(this.translate.instant('Email sent'), successMsg, () => {
              this.navCtrl.pop();
            }, this.translate.instant("OK"))
          }
          else
          {
            this.errorMessage = response.Errors[0].ErrorMessage;
          }
        }, error => {
          var errorMsg = 'Could not send email';
          this.alertService.showAlert('Error', errorMsg, null)
        });
    }
  }

}
