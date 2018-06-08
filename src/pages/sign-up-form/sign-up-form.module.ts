import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SignUpFormPage } from './sign-up-form';

@NgModule({
  declarations: [
    SignUpFormPage,
  ],
  imports: [
    IonicPageModule.forChild(SignUpFormPage),
  ],
  exports: [
    SignUpFormPage
  ]
})
export class SignUpFormModule {}
