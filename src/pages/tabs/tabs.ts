import { Component, OnInit, ViewChild } from "@angular/core";
import { Tabs } from "ionic-angular";
import { IProperty } from "../../models/property";
import { PropertyListPage } from "../property-list/property-list";
import { ShortlistPage } from "../shortlist/shortlist";
import { MyAccountPage } from "../my-account/my-account";
import { AlertsPage } from "../alerts/alerts";
import { Subscription } from "rxjs/Rx";
import { ShortlistService } from "../../services/shortlist.service";
import { ShortlistMergeService } from "../../services/shortlistmerge.service";
import { TranslateService } from "@ngx-translate/core";
import { GlobalSettings, Authentication } from "../../shared/shared";
import { User } from "../../shared/user";
import { SplitPage } from "../split/split";
import { ShortlistSplitPage } from "../split/shortlist.split";

@Component({
  templateUrl: 'tabs.html'
})

export class TabsPage implements OnInit {

  @ViewChild('propertyTabs') tabs: Tabs

  shortlistProperties: Array<IProperty>;
  isTablet: boolean;
  tab1Root: any = PropertyListPage;
  tab2Root: any = ShortlistPage;
  tab3Root = AlertsPage;
  tab4Root: any = MyAccountPage;
  currShortlistSub: Subscription;

  constructor(private shortlistService: ShortlistService,
    private shortlistMergeService: ShortlistMergeService,
    private auth: Authentication,
    private user: User,
    private globalSettings: GlobalSettings,
    private translate: TranslateService) {
      this.isTablet = globalSettings.isDeviceTablet();

    this.shortlistProperties = new Array<IProperty>();
    if (this.globalSettings.getSettings().language !== "") {
      this.translate.use(this.globalSettings.getSettings().language);
    }
    if (this.auth.isUserLoggedIn()) {
      this.user.initUser();
    }

  }

  ngOnInit(): void {

    if (this.isTablet) {
      this.tab1Root = SplitPage;
      this.tab2Root = ShortlistSplitPage;
    }
   this.shortlistMergeService.readMergeShorlistedProperties();

  }

  ionViewWillEnter() {
  this.shortlistMergeService.currentShortlistedProperties.subscribe(properties => {
      this.shortlistProperties = properties;
    }); 
  }

}
