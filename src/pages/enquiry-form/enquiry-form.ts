import { TranslateService } from '@ngx-translate/core';
import { AlertService } from './../../shared/alert.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, LoadingController } from 'ionic-angular';
import { IPropertyEnquiry } from "../../models/propertyEnquiry";
import { PrivacyPolicyPage } from "./../privacy-policy/privacy-policy";
import { EnquiryService } from "../../services/enquiry.service";
import { GlobalSettings } from "../../shared/shared";

@IonicPage()
@Component({
  selector: 'page-enquiry-form',
  templateUrl: 'enquiry-form.html',
})
export class EnquiryForm implements OnInit {

  privacyPolicy = PrivacyPolicyPage;

  enquiryForm: FormGroup;
  enquiryDetails: IPropertyEnquiry;
  errorMessage: string = '';
  hasSubmitted: boolean = false;
  language: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private alertService: AlertService,
    private enquiryService: EnquiryService,
    private globalSettings: GlobalSettings,
    private translate: TranslateService) {
      this.language = this.globalSettings.getSettings().language;
      this.enquiryDetails = this.navParams.get('enquiryOptions');
  }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    let enquiryType = this.enquiryDetails;
    let phone = '';
    let name = '';
    let email = '';
    let weChatId = '';
    let other = '';

    this.enquiryForm = new FormGroup({
      enquiryType: new FormControl(enquiryType, Validators.required),
      name: new FormControl(name, Validators.required),
      phone: new FormControl(phone, null),
      email: new FormControl(email, [Validators.required, Validators.email]),
      weChatId: new FormControl(weChatId, null),
      other: new FormControl(other, null)
    });
  }

  hasEnquiryType() {
    return this.enquiryDetails.contractOfSale == true || this.enquiryDetails.priceGuide == true
      || this.enquiryDetails.inspectionTimes == true || this.enquiryDetails.similarProperties == true;
  }

  viewPrivacyPolicy() {
    let privacyModal = this.modalCtrl.create(PrivacyPolicyPage);
    privacyModal.present();
  }

  onSubmit() {
    this.errorMessage = "";
    
    this.hasSubmitted = true;

    if (this.enquiryForm.dirty && this.enquiryForm.valid && this.hasEnquiryType()) {
      let values = this.enquiryForm.value;
      this.enquiryDetails.name = values.name;
      this.enquiryDetails.email = values.email;
      this.enquiryDetails.phone = values.phone;
      this.enquiryDetails.other = values.other;

      let loader = this.loadingCtrl.create({
        content: this.translate.instant("Submitting") + " ...",
        duration: 1000,
        spinner: "crescent"
      });

      loader.present();
      this.enquiryService.sendEnquiry(this.enquiryDetails).subscribe(response => {
        if (response.IsValid === true) {
          this.alertService.showAlert(this.translate.instant('Sent'), this.translate.instant('EnquirySent'), () => {
            this.navCtrl.pop();
          });
        } else {
          this.errorMessage = response.Errors[0].ErrorMessage;
        }
      },
        err => this.errorMessage = err
    );
    };
  }

}
