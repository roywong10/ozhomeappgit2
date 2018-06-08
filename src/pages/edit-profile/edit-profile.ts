import { TranslateService } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ModalController, ViewController } from 'ionic-angular';
import { User, Authentication, AlertService } from "../../shared/shared";
import { ChangePasswordPage } from "./../change-password/change-password";
import { IUserProfile } from "../../models/userProfile";

@IonicPage()
@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
})
export class EditProfilePage implements OnInit {

  editProfileForm: FormGroup;
  userProfile: IUserProfile;
  hasSubmitted: boolean = false;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private user: User,
    private auth: Authentication,
    private toastCtrl: ToastController,
    private viewCtrl: ViewController,
    private alertService: AlertService,
    private translate: TranslateService,
	private modalCtrl: ModalController,) {
    this.userProfile = this.navParams.get('userProfile');
  }

  ngOnInit(): void {

    this.initForm();

  }

  goToChangePwd() {
	  let changePasswordModal = this.modalCtrl.create(ChangePasswordPage);
    changePasswordModal.present();
  }

  initForm() {

    this.editProfileForm = new FormGroup({
      firstName: new FormControl(this.userProfile.firstName, Validators.required),
      lastName: new FormControl(this.userProfile.lastName),
      email: new FormControl(this.userProfile.email, [Validators.required, Validators.email]),
      state: new FormControl(this.userProfile.state),
      postcode: new FormControl(this.userProfile.postcode, [Validators.minLength(4), Validators.maxLength(4)]),
    });

  }

  onSubmit() {
    this.hasSubmitted = true;

    if (this.editProfileForm.dirty && this.editProfileForm.valid) {

      let values = this.editProfileForm.value;

      this.userProfile = {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        state: values.state,
        suburb: '',
        postcode: values.postcode,
        isSocialLogin : false
      }

      this.user.updateCurrentMemberData(this.userProfile, this.auth.getAccessToken())
        .subscribe(response => {
          if (response.IsValid === true) {
            let toast = this.toastCtrl.create({
              message: this.translate.instant('Profile updated successfully'),
              position: 'middle',
              cssClass: '',
              duration: 2000
            });
            toast.present().then(() => {
              this.navCtrl.pop();
            });
          }
        }, error => {
            if(error.status && error.status == 401){
                this.navCtrl.pop();
            }else{
              var errorMsg = 'Your profile could not be updated';
              this.alertService.showAlert('Error', errorMsg, null)
            }
        });
    }

  }
}
