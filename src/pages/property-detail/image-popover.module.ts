import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImagePopoverComponent } from './image-popover';

@NgModule({
  declarations: [
    ImagePopoverComponent,
  ],
  imports: [
    IonicPageModule.forChild(ImagePopoverComponent),
  ],
  exports: [
    ImagePopoverComponent
  ]
})
export class ImagePopoverComponentModule {}
