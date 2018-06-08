import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SplitPage } from './split';

@NgModule({
  declarations: [
    SplitPage,
  ],
  imports: [
    IonicPageModule.forChild(SplitPage),
  ],
  exports: [
    SplitPage
  ]
})
export class SplitPageModule {}
