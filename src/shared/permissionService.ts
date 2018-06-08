import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Diagnostic } from '@ionic-native/diagnostic';

//based off http://www.codingandclimbing.co.uk/blog/ionic-2-camera-permissions-example-for-ios-and-android

@Injectable()
export class permissionService {
    constructor(
        public _platform: Platform,
        public _Diagnostic: Diagnostic,
        private locationAccuracy: LocationAccuracy
    ) {
    }

    isAndroid() {
        return this._platform.is('android')
    }

    isiOS() {
        return this._platform.is('ios');
    }

    isUndefined(type) {
        return typeof type === "undefined";
    }

    pluginsAreAvailable() {
        return !this.isUndefined(window['plugins']);
    }

    public checkLocationPermissions(): Promise<boolean> {
        return new Promise(resolve => {
            if (!this.pluginsAreAvailable()) {
                console.log('Dev: Location plugin unavailable.');
                resolve(true);
            }
            else if (this.isiOS()) {
                this._Diagnostic.getLocationAuthorizationStatus().then(status => {
                    if (status == this._Diagnostic.permissionStatus.GRANTED || status == this._Diagnostic.permissionStatus.GRANTED_WHEN_IN_USE) {
                        resolve(true);
                    }
                    else {
                        if (status == this._Diagnostic.permissionStatus.DENIED) {
                            resolve(false);
                        } else {
                            this._Diagnostic.requestLocationAuthorization().then(authorisation => {
                                resolve(authorisation == this._Diagnostic.permissionStatus.GRANTED_WHEN_IN_USE || authorisation == this._Diagnostic.permissionStatus.GRANTED);
                            }).catch(error => {
                                resolve(false);
                            });
                        }
                    }
                });
            }
            else if (this.isAndroid()) {

                this._Diagnostic.isLocationAuthorized().then(authorised => {
                    if (authorised) {
                        resolve(true);
                    }
                    else {
                        this._Diagnostic.requestRuntimePermissions([this._Diagnostic.permission.ACCESS_FINE_LOCATION, this._Diagnostic.permission.ACCESS_COARSE_LOCATION]).then((auth) => {
                            resolve(auth);
                        });
                    }
                });
            }
        });
    }

    public checkLocationEnabled() {
        return new Promise(resolve => {
            if (!this.pluginsAreAvailable()) {
                console.log('Dev: Location plugin unavailable.');
                resolve(true);
            }
            else { //same for ios + android
                this._Diagnostic.isLocationEnabled().then(enabled => {
                    resolve(enabled);
                });
            }
        });
    }

    public checkCalendarPermissions(): Promise<boolean> {
        return new Promise(resolve => {
            if (!this.pluginsAreAvailable()) {
                console.log('Dev: Calendar plugin unavailable.');
                resolve(true);
            } else {
                this._Diagnostic.isCalendarAuthorized().then(authorized => {
                    if (authorized) {
                        return resolve(true);
                    } else {
                        this._Diagnostic.requestCalendarAuthorization().then(authorized => {
                            resolve(authorized == this._Diagnostic.permissionStatus.GRANTED);
                        });
                    }
                });
            }
        });
    }

    public switchToLocationSettings() {
        if (this.isiOS()) {
            this._Diagnostic.switchToSettings();
        } else {
            this._Diagnostic.switchToLocationSettings();
        }
    }
}