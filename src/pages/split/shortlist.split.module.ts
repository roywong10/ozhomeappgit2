import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShortlistSplitPage } from './shortlist.split';

@NgModule({
  declarations: [
    ShortlistSplitPage,
  ],
  imports: [
    IonicPageModule.forChild(ShortlistSplitPage),
  ],
  exports: [
    ShortlistSplitPage
  ]
})
export class ShortlistSplitPageModule {}
