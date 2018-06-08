import { TranslateService } from '@ngx-translate/core';
import { Authentication } from './../../shared/authentication.service';
import { IChangePassword } from './../../models/changePassword';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { User } from "../../shared/shared";

@IonicPage()
@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html',
})
export class ChangePasswordPage implements OnInit {

  changePasswordForm: FormGroup;
  changePwdModel: IChangePassword;
  errorMessage: string;
  hasSubmitted: boolean = false;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private user: User,
    private auth: Authentication,
    private translate: TranslateService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    let oldPassword = '';
    let newPassword = '';
    let confirmPassword = '';

    this.changePasswordForm = new FormGroup({
      oldPassword: new FormControl(oldPassword, Validators.required),
      newPassword: new FormControl(newPassword, [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl(confirmPassword, Validators.required)
    });
  }

  onSubmit() {
    this.hasSubmitted = true;

    if (this.changePasswordForm.dirty && this.changePasswordForm.valid) {

      let values = this.changePasswordForm.value;

      this.changePwdModel = {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      }

      this.user.changePassword(this.changePwdModel, this.auth.getAccessToken())
        .subscribe(response => {
          if (response.IsValid === true) {
            let toast = this.toastCtrl.create({
              message: this.translate.instant('ChangePwdSuccessMsg'),
              duration: 2000
            });
            toast.present().then(() => {
              this.navCtrl.pop();
            });
          }
          else
          {
            this.errorMessage = response.Errors[0].ErrorMessage;
          }
        }, error => {
          let alert = this.alertCtrl.create({
            title: 'Error',
            subTitle: 'Password could not be updated',
            buttons: ['OK']
          });
          alert.present();
        });
    }
  }
}
