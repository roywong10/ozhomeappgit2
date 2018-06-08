import { ShortlistService } from './../../services/shortlist.service';
import { ShortlistMergeService } from './../../services/shortlistmerge.service';
import { IPropertySummary } from './../../models/propertySummary';
import * as moment from 'moment';
import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';


import * as _ from 'lodash';
import { Slides } from "ionic-angular";

@Component({
  selector: 'property-list-component',
  templateUrl: 'property-list-component.html'
})
export class PropertyListComponent implements OnInit, OnDestroy {
  
  @ViewChild('slider') slides: Slides; 
  @Input() property: IPropertySummary;
  @Input() showInspectionLabel: boolean;

  nextInspectionLabel: string;
  landTypeText: string;
  subscription:Subscription  = null;
  currSlide: number = 0;

  constructor(private shortListSvc: ShortlistService, private ShortlistMergeService: ShortlistMergeService) {

  }

  ngOnDestroy(): void {
    if(this.subscription != null){
      this.subscription.unsubscribe();
    }
  }

  ngOnInit(): void {
  // See : https://github.com/ionic-team/ionic/issues/11729
    setTimeout(() => {
        this.slides.loop = this.property.Images.length > 1;
    }, 500);

    this.subscription = this.ShortlistMergeService.currentShortlistedProperties.subscribe( p =>{
        
        let index = _.findIndex(p, p => p.PropertyID == this.property.PropertyID);
        if(index > -1){
          this.property.IsShortlisted = true;
        }else{
          this.property.IsShortlisted = false;
        }

    });

    if (this.property.NextInspectionTime) {
      this.nextInspectionLabel = moment(this.property.NextInspectionTime).format('ddd D MMM, h:mma');
    }else{
      this.showInspectionLabel = false;
    }

    if (this.property.LandType == 'Hectares') {
      this.property.LandType = 'HA';
    }
  }
  
  // slideChanged() {
  //     var index = this.slides.getActiveIndex();
  //     this.currSlide = index-1;
  // }

  // showSlide(i){
  //   return this.currSlide == 0 || this.currSlide == i || this.currSlide == i-1 || this.currSlide == i+1;
  // }



}
