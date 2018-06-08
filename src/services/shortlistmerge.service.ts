import { IProperty } from './../models/property';
import { Injectable } from '@angular/core';
import { PropertyService } from './property.service';
import { ShortlistService } from './shortlist.service';
import { StorageService } from "./storage.service";
import { Subject, BehaviorSubject } from 'rxjs';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { ShortlistedProperty } from './../models/shortlistedProperty';

import { Authentication } from './../shared/authentication.service';

import * as _ from 'lodash';


@Injectable()
export class ShortlistMergeService {

    private shortlistedProperties: Array<IProperty> = new Array<IProperty>();

    constructor(private shortlistService: ShortlistService, 
                private storageService: StorageService,
                private propertyService: PropertyService,
                private authentication: Authentication){
    }


    currentShortlistedProperties: Subject<Array<IProperty>>  = new BehaviorSubject<Array<IProperty>>([]);
   
    getMergeShorlistedProperties(): Promise<Array<IProperty>> {

        return new Promise<Array<IProperty>>((resolve, reject)=>{
        
                let serverShortlistedProperties: Array<IProperty> = []; 
                let localShortlistedProperties: Array<IProperty> = [];
                

                this.shortlistService.getServerShortlistedProperty().subscribe( value =>{
                        if(value.IsValid == true){
                            serverShortlistedProperties = value.ReturnValue;
                        }

                        this.getLocalShortlistProperties().then((local)=>{
                            localShortlistedProperties = local;
                            this.mergeProperties(localShortlistedProperties, serverShortlistedProperties).then(mergedProperties =>{
                                 this.shortlistedProperties = mergedProperties;
                                this.currentShortlistedProperties.next(this.shortlistedProperties);
                                resolve(mergedProperties);
                            });
                            
                        })
                },()=> resolve([]));
        })
    }
    

    toggleProperty( property: IProperty){
        
        this.shortlistService.toggleProperty(property).then( prop => {
            if(prop.IsShortlisted){
                this.shortlistedProperties.push(prop);
                this.propertyService.addPropertiesToShortlist([{PropertyID: property.PropertyID, PropertyType: property.PropertyType}]).subscribe();
            }else{
                let index = _.findIndex(this.shortlistedProperties, i => i.PropertyID == prop.PropertyID);
                if(index > -1){
                    this.shortlistedProperties.splice(index, 1);
                    this.propertyService.removePropertyFromShortlist({PropertyID: property.PropertyID, PropertyType: property.PropertyType}).subscribe();
                }
            }
            
            this.currentShortlistedProperties.next(this.shortlistedProperties);

        });
    }

    readMergeShorlistedProperties(): Promise<void> {
    
        let serverShortlistedProperties: Array<IProperty> = []; 
        let localShortlistedProperties: Array<IProperty> = [];
        
        return new Promise<void>((resolve, reject)=>{
                
                this.shortlistService.getServerShortlistedProperty().subscribe( value =>{
                        if(value.IsValid == true){
                            serverShortlistedProperties = value.ReturnValue;
                        }
                        serverShortlistedProperties.forEach(p => p.IsShortlisted = true);

                        this.getLocalShortlistProperties().then((local)=>{
                            localShortlistedProperties = local;
                            this.mergeProperties(localShortlistedProperties, serverShortlistedProperties).then(mergedProperties =>{
                                this.shortlistedProperties = mergedProperties;
                                this.currentShortlistedProperties.next(this.shortlistedProperties);
                                resolve();
                            });
                        });
                });
        });
    }

    clearShortlist() {
        this.shortlistedProperties = new Array<IProperty>();
        this.currentShortlistedProperties.next(this.shortlistedProperties);
    }

    private getLocalShortlistProperties(): Promise<Array<IProperty>>{

        let localShortlistedProperties: Array<IProperty> = [];

        return new Promise<Array<IProperty>>((resolve, reject) => {

            this.storageService.getShortList().then(list =>{
                                        if (list && list.length) {
                                                let propertyIds:Array<number> = list.map( i => i.PropertyID);
                                                this.propertyService.getPropertiesByIdNoCheck(propertyIds).subscribe(searchResult => {
                                                    localShortlistedProperties = searchResult.ReturnValue ? searchResult.ReturnValue : new Array<IProperty>();
                                                    localShortlistedProperties.forEach(p => p.IsShortlisted = true);
                                                    resolve(localShortlistedProperties);
                                                });
                                        }else{
                                            resolve(localShortlistedProperties);
                                        }
                        }).catch(ex => resolve(localShortlistedProperties));
        });

    }


    private mergeProperties(localStorageProperties: Array<IProperty>, serverProperties: Array<IProperty>): Promise<Array<IProperty>>{
        
        return new Promise<Array<IProperty>>( (resolve, reject) =>{
            let onlyOnServer = _.differenceWith(serverProperties, localStorageProperties, (x,y) => x.PropertyID == y.PropertyID );

            // add to local storage
            this.storageService.addPropertiesToShortlist(onlyOnServer).then(()=>{

            let onlyOnLocal = _.differenceWith(localStorageProperties, serverProperties, (x,y) => x.PropertyID == y.PropertyID );

            if(onlyOnLocal.length > 0 && this.authentication.isUserLoggedIn()){
            // update the server with new items that are only in local
            let list = onlyOnLocal.map(p =>  { return new ShortlistedProperty(p.PropertyID, p.PropertyType)});
            this.propertyService.addPropertiesToShortlist(list).subscribe();
            }

            let combined = localStorageProperties.concat(onlyOnServer);
            resolve(combined);
            });
        
        });


    }

}


