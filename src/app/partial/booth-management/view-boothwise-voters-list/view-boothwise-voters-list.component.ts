import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-view-boothwise-voters-list',
  templateUrl: './view-boothwise-voters-list.component.html',
  styleUrls: ['./view-boothwise-voters-list.component.css']
})
export class ViewBoothwiseVotersListComponent implements OnInit {

  clientNameArray: any;
  // viewBoothVotersForm!:FormGroup;
  filterForm!: FormGroup;
  electionNameArray: any;
  constituencyNameArray: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  total: any;
  subject: Subject<any> = new Subject();
  selectCloseFlag: boolean = true;
  clientWiseBoothListArray: any;
  IsSubElectionApplicable: any;
  villageDropdown: any;
  cardData: any;
  selVillage = new FormControl(0);
  clickBoothListArray: any;
  voterListFlag = 1;
  boothVoterListArray: any;
  HighlightRow: any = 0;
  globalboothVoterData: any;
  searchVoters = new FormControl('');
  searchMigrated = new FormControl('');
  searchPending = new FormControl('');
  searchAgent = new FormControl('');
  searchFamily = new FormControl('');

  votersPaginationNo = 1;
  votersPageSize: number = 10;
  votersTotal: any;

  boothMigratedListArray: any;
  migratedPaginationNo = 1;
  migratedPageSize: number = 10;
  migratedTotal: any;

  boothPendingListArray: any;
  pendingPaginationNo = 1;
  pendingPageSize: number = 10;
  pendingTotal: any;

  boothAgentListArray: any;

  boothFamilyListArray: any;
  familyPaginationNo = 1;
  familyPageSize: number = 10;
  familyTotal: any;


  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.defaultFilterForm();
    this.getClientName();
    this.searchVotersFilters('false');
    this.searchMigratedFilters('false');
    this.searchPendingFilters('false');
    this.searchAgentFilters('false');
    this.searchFamilyFilters('false');
  }

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      ClientId: [0],
      ElectionId: [0],
      ConstituencyId: [0],
      Search: ['']
    })
  }

  getClientName() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_ddl?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientNameArray = res.data1;
        this.clientNameArray.length == 1 ? (this.filterForm.patchValue({ ClientId: this.clientNameArray[0].id }), this.getElectionName(), this.selectCloseFlag = false) : '';
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getElectionName() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Election_byClientId_ddl?ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.electionNameArray = res.data1;
        this.electionNameArray.length == 1 ? (this.filterForm.patchValue({ ElectionId: this.electionNameArray[0].ElectionId }), this.IsSubElectionApplicable = this.electionNameArray[0].IsSubElectionApplicable, this.getConstituencyName(), this.selectCloseFlag = false) : '';
      } else {
        this.spinner.hide();
        this.electionNameArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getConstituencyName() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Constituency_byClientId_ddl?ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.constituencyNameArray = res.data1;
        this.IsSubElectionApplicable == undefined || this.IsSubElectionApplicable == null ? this.getIsSubEleAppId(this.filterForm.value.ElectionId) : '';
        this.constituencyNameArray.length == 1 ? (this.filterForm.patchValue({ ConstituencyId: this.constituencyNameArray[0].ConstituencyId }), this.selectCloseFlag = false) : '';
        this.boothSummary();
      } else {
        this.constituencyNameArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }


  boothSummary() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&AssemblyId=' + 0 + '&IsSubElectionApplicable=' + this.IsSubElectionApplicable
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Clientwise_BoothSummary?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.cardData = res.data1[0];
        this.villageDropdown = res.data2;
        this.ClientWiseBoothList();
      } else {
        this.villageDropdown = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  ClientWiseBoothList() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&AssemblyId=' + 0 + '&IsSubElectionApplicable=' + this.IsSubElectionApplicable + '&VillageId=' + this.selVillage.value
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Clientwise_BoothList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientWiseBoothListArray = res.data1;
      } else {
        this.clientWiseBoothListArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }



  // ------------------------------------------filter data all methodes start here ------------------------------ //

  clearFilter(flag: any) {
    if (flag == 'clientId') {
      this.filterForm.controls['ClientId'].setValue(0);
    } else if (flag == 'electionId') {
      this.filterForm.controls['ElectionId'].setValue('');
    } else if (flag == 'constituencyId') {
      this.filterForm.controls['ConstituencyId'].setValue('');
    } else if (flag == 'search') {
      this.filterForm.controls['Search'].setValue('');
    }
    this.paginationNo = 1;
    // this.getClientAgentWithBooths();
  }

  filterData() {
    this.paginationNo = 1;
    // this.getClientAgentWithBooths();
  }

  onKeyUpFilter() {
    this.subject.next();
  }

  searchFilter(flag: any) {
    if (flag == 'true') {
      if (this.filterForm.value.Search == "" || this.filterForm.value.Search == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.filterForm.value.Search = this.filterForm.value.Search;
        //this.getClientAgentWithBooths();
      }
      );
  }

  // ------------------------------------------filter data all methodes start here ------------------------------ //

  // ------------------------------------------ Booth details ------------------------------ -------------------- //

  clickBoothList(data: any) {
    this.globalboothVoterData = data;
    this.HighlightRow = data?.BoothId;
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&BoothId=' + data?.BoothId;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_BoothDetails?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clickBoothListArray = res.data1[0];
      } else {
        this.spinner.hide();
      }
      this.boothVoterList();
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  // ------------------------------------------ vooter list with filter start here  ------------------------------------------//
  boothVoterList() {
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&BoothId=' + this.globalboothVoterData.BoothId +
      '&AssemblyId=' + this.globalboothVoterData.AssemblyId + '&flag=' + this.voterListFlag + '&Search=' + this.searchVoters.value + '&nopage=' + this.votersPaginationNo;

    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_BoothVoterList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.boothVoterListArray = res.data1;
        this.votersTotal = res.data2[0].TotalCount;
      } else {
        this.boothVoterListArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintionVoters(pageNo: any) {
    this.votersPaginationNo = pageNo;
    this.boothVoterList();
  }

  onKeyUpFilterVoters() {
    this.subject.next();
  }

  searchVotersFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchVoters.value == "" || this.searchVoters == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchVoters.value;
        this.votersPaginationNo = 1;
        this.boothVoterList();
      }
      );
  }
  // ------------------------------------------  vooter list with filter end here ------------------------------------------//

  // ------------------------------------------  Family list with filter end here ------------------------------------------//
  boothFamilyList() {
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&BoothId=' + this.globalboothVoterData.BoothId +
      '&AssemblyId=' + this.globalboothVoterData.AssemblyId + '&Search=' + this.searchFamily.value + '&nopage=' + this.familyPaginationNo;

    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_Booth_Familly_VoterList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.boothFamilyListArray = res.data1;
        this.votersTotal = res.data2[0].TotalCount;
      } else {
        this.boothFamilyListArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  
  onClickPagintionFamily(pageNo: any) {
    this.familyPaginationNo = pageNo;
    this.boothFamilyList();
  }

  onKeyUpFilterFamily() {
    this.subject.next();
  }

  searchFamilyFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchFamily.value == "" || this.searchFamily == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchFamily.value;
        this.familyPaginationNo = 1;
        this.boothFamilyList();
      }
      );
  }
  // ------------------------------------------  Family list with filter end here ------------------------------------------//

  // ------------------------------------------  Migrated  list with filter start here  ------------------------------------------//

  boothMigratedList() {
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&BoothId=' + this.globalboothVoterData.BoothId +
      '&AssemblyId=' + this.globalboothVoterData.AssemblyId + '&Search=' + this.searchMigrated.value + '&nopage=' + this.migratedPaginationNo;

    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_Booth_Migrated_VoterList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.boothMigratedListArray = res.data1;
        this.migratedTotal = res.data2[0].TotalCount;
      } else {
        this.boothMigratedListArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintionMigrated(pageNo: any) {
    this.migratedPaginationNo = pageNo;
    this.boothMigratedList();
  }

  onKeyUpFilterMigrated() {
    this.subject.next();
  }

  searchMigratedFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchMigrated.value == "" || this.searchMigrated == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchMigrated.value;
        this.migratedPaginationNo = 1;
        this.boothMigratedList();
      }
      );
  }
  // ------------------------------------------  Migrated  list with filter end here  ------------------------------------------//

  // ------------------------------------------  Pending  list with filter start here  ------------------------------------------//
  boothPendingList() {
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&BoothId=' + this.globalboothVoterData.BoothId +
      '&AssemblyId=' + this.globalboothVoterData.AssemblyId + '&Search=' + this.searchPending.value + '&nopage=' + this.pendingPaginationNo;

    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_Booth_Pending_VoterList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.boothPendingListArray = res.data1;
        this.pendingTotal = res.data2[0].TotalCount;
      } else {
        this.boothPendingListArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintionPending(pageNo: any) {
    this.pendingPaginationNo = pageNo;
    this.boothPendingList();
  }

  onKeyUpFilterPending() {
    this.subject.next();
  }

  searchPendingFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchPending.value == "" || this.searchPending == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchPending.value;
        this.pendingPaginationNo = 1;
        this.boothPendingList();
      }
      );
  }

  // ------------------------------------------  Pending  list with filter start here  ------------------------------------------//

  // ------------------------------------------  Agent  list with filter start here  ------------------------------------------//
  boothAgentList() {
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&BoothId=' + this.globalboothVoterData.BoothId +
      '&AssemblyId=' + this.globalboothVoterData.AssemblyId + '&Search=' + this.searchAgent.value;

    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_Booth_AgentList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.boothAgentListArray = res.data1;
        //this.pendingTotal  = res.data2[0].TotalCount;
      } else {
        this.boothAgentListArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onKeyUpFilterAgent() {
    this.subject.next();
  }

  searchAgentFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchAgent.value == "" || this.searchAgent == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchAgent.value;
        this.boothAgentList();
      }
      );
  }
  // ------------------------------------------  Agent  list with filter start here  ------------------------------------------//

  // ------------------------------------------  global uses start here   ------------------------------------------//
  clearFiltersBooth(flag: any) {
    if (flag == 'clearSearchVoters') {
      this.searchVoters.setValue('');
      this.boothVoterList();
    } else if (flag == 'clearFiltersMigrated') {
      this.searchMigrated.setValue('');
      this.boothMigratedList();
    } else if (flag == 'clearFiltersPending') {
      this.searchPending.setValue('');
      this.boothPendingList();
    } else if (flag == 'clearFiltersAgent') {
      this.searchAgent.setValue('');
      this.boothAgentList();

    }
  }

  getIsSubEleAppId(eleId: any) {
    this.electionNameArray.filter((item: any) => {
      if (item.ElectionId == eleId) {
        this.IsSubElectionApplicable = item.IsSubElectionApplicable;
      }
    })
  }

  // ------------------------------------------  global uses end here   ------------------------------------------//

  // ------------------------------------------ Booth details ------------------------------ -------------------- //
}
