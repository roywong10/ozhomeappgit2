import { TranslateService } from '@ngx-translate/core';
import { IPropertyMapFilter } from './../models/propertyMapFilter';
import { Observable, Subject } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { GlobalSettings } from './../shared/globalSettings';
import * as _ from "lodash";

@Injectable()

//http://jasonwatmore.com/post/2016/12/01/angular-2-communicating-between-components-with-observable-subject
export class PropertyMapFilterService {
    
    maxPrice: number = 5000000;
    
    private defaultMapFilter =  <IPropertyMapFilter>{
                pricefrom: 0,
                priceto: 0,
                pageNum: 1,
                itemsPerPage:
                this.globalSettings.getSettings().itemsPerPage,
                //propertyType: new Array<string>(this.translate.instant('All')),
                propertyTypeArray : new Array<string>(this.translate.instant('All')),
                propertyType: "",
                orderby: 'Latest',
                beds: 0,
                cars: 0,
                baths: 0,
                isSold: false,
                language: this.globalSettings.getSettings().language,
                north: 0,
                south: 0,
                east: 0,
                west: 0,
            };
    private mapFilter: IPropertyMapFilter;
    private mapFilterSubject = new Subject<IPropertyMapFilter>();    

    constructor(private globalSettings: GlobalSettings,
    private translate: TranslateService) {
        if (!this.mapFilter) {
            this.mapFilter = _.cloneDeep(this.defaultMapFilter);
        }
    }

    getFilters() {
        return this.mapFilter;
    }
    
    hasFilters() {
        return this.mapFilter && this.mapFilter.north != 0;
    }

    updatedFilters(): Observable<IPropertyMapFilter> {
        return this.mapFilterSubject.asObservable();
    }

    setFilter(filter: IPropertyMapFilter) {
        this.mapFilter = filter;
        this.mapFilterSubject.next(filter);
    }

    clearFilter(){
        this.mapFilter = _.cloneDeep(this.defaultMapFilter);
    }

    getFilterSummary(): string {
        let filter = this.mapFilter;
        let filterSummary = [];
        let propertyTypeStr = this.translate.instant('All');
        let priceStr = this.translate.instant('Any') + " $";
        let bedStr = "1+ " + this.translate.instant(' Beds');
        let bathStr = "1+ " + this.translate.instant(' Baths');
        let carStr = "1+ " + this.translate.instant(' Cars');

        if (filter.propertyTypeArray.length > 0 && filter.propertyTypeArray[0] != "All") {
            if (filter.propertyTypeArray.length == 1) {
                propertyTypeStr = filter.propertyTypeArray[0];
            } else {
                propertyTypeStr = filter.propertyTypeArray.length + "+ types";
            }
        }

        filterSummary.push(propertyTypeStr);

        if (filter.pricefrom != 0 && filter.priceto != 0) {
            priceStr = this.getDisplayPrice(filter.pricefrom) + "-" + this.getDisplayPrice(filter.priceto);
        } else if (filter.priceto != 0) {
            priceStr = '<' + this.getDisplayPrice(filter.priceto)
        } else if (filter.pricefrom != 0) {
            priceStr = '$' + this.getDisplayPrice(filter.pricefrom);
        }


        filterSummary.push(priceStr);

        if (filter.beds > 1) {
            bedStr = filter.beds + '+ ' + this.translate.instant(' Beds');
        }

        filterSummary.push(bedStr);

        if (filter.baths > 1) {
            bathStr = filter.baths + '+ ' + this.translate.instant('Baths');
        }

        filterSummary.push(bathStr);

        if (filter.cars > 1) {
            carStr = filter.cars + '+ ' + this.translate.instant('Cars');
        }

        filterSummary.push(carStr);

        return filterSummary.join(" • ")
    }

    private getDisplayPrice(price: number): string {
        if (price < 1000000) {
            return (price / 1000) + "K";
        } else {
            return (price / 1000000) + "M" + (price >= this.maxPrice ? "+" : "") ;
        }
    }
}