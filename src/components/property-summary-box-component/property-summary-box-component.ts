import { IPropertySummary } from './../../models/propertySummary';
import { ShortlistService } from './../../services/shortlist.service';
import { ShortlistMergeService } from './../../services/shortlistmerge.service';
import { NavController, NavParams } from 'ionic-angular';
import { Subscription } from 'rxjs';

import { Component, Input, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';


@Component({
  selector: 'property-summary-box',
  templateUrl: 'property-summary-box-component.html'
})
export class PropertySummaryBoxComponent implements OnChanges, OnInit, OnDestroy {
  
  private subscription : Subscription = null;

  ngOnChanges(changes: SimpleChanges): void {
    
  }

  @Input() property: IPropertySummary;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private ShortlistMergeService: ShortlistMergeService) {
  }

  ngOnInit(): void {
    this.subscription = this.ShortlistMergeService.currentShortlistedProperties.subscribe( p =>{
        let index = _.findIndex(p, p => p.PropertyID == this.property.PropertyID);
        if(index > -1){
          this.property.IsShortlisted = true;
        }else{
          this.property.IsShortlisted = false;
        }
    }); 

  }

    ngOnDestroy(): void{
      if(this.subscription != null){
        this.subscription.unsubscribe();
      }
    }

}
