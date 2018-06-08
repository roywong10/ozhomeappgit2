import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EnquiryForm } from './enquiry-form';

@NgModule({
  declarations: [
    EnquiryForm,
  ],
  imports: [
    IonicPageModule.forChild(EnquiryForm),
  ],
  exports: [
    EnquiryForm
  ]
})
export class EnquiryFormModule {}
