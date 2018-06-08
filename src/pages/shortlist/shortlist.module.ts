import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShortlistPage } from './shortlist';

@NgModule({
  declarations: [
    ShortlistPage,
  ],
  imports: [
    IonicPageModule.forChild(ShortlistPage),
  ],
  exports: [
    ShortlistPage
  ]
})
export class ShortlistModule {}
