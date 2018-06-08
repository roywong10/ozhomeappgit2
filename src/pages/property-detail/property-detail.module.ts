import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PropertyDetailPage } from './property-detail';
import { UnionPipe } from "ngx-pipes/src/app";

@NgModule({
  declarations: [
    PropertyDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(PropertyDetailPage)    
  ],
  exports: [
    PropertyDetailPage
  ],
  providers: [
    UnionPipe
  ]
})
export class PropertyDetailModule {}
