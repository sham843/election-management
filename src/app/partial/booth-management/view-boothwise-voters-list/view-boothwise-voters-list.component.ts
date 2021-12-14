import { cos } from '@amcharts/amcharts4/.internal/core/utils/Math';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { NameCorrectionDialogComponent } from '../../dialogs/name-correction-dialog/name-correction-dialog.component';
import { VoterCallEntriesComponent } from '../../dialogs/voter-call-entries/voter-call-entries.component';

@Component({
  selector: 'app-view-boothwise-voters-list',
  templateUrl: './view-boothwise-voters-list.component.html',
  styleUrls: ['./view-boothwise-voters-list.component.css']
})
export class ViewBoothwiseVotersListComponent implements OnInit {

  clientNameArray: any;
  filterForm!: FormGroup;
  electionNameArray: any;
  constituencyNameArray: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  total: any;
  subject: Subject<any> = new Subject();
  clientWiseBoothListArray: any;
  IsSubElectionApplicable: any;
  villageDropdown: any;
  cardData: any;
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
  boothFamilyDetailsArray: any;
  dataNotFound: boolean = false;
  boothDataHide: boolean = false;

  clientIdFlag: boolean = true;
  electionFlag: boolean = true;
  constituencyFlag: boolean = true;

  assignAgentForm!: FormGroup;
  submitted = false;
  btnText = 'Add Agent';
  fillDataId = 0;
  isChecked = new FormControl(false);
  encryptData: any;

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.defaultFilterForm();
    this.getClientName();
    this.searchVotersFilters('false');
    this.searchMigratedFilters('false');
    this.searchPendingFilters('false');
    this.searchAgentFilters('false');
    this.searchFamilyFilters('false');
    this.agentForm();
  }

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      ClientId: [0],
      ElectionId: [0],
      ConstituencyId: [0],
      village: [0],
      getBoothId: [0],
      Search: ['']
    })
  }

  getClientName() {
    this.nullishFilterForm(); //Check all value null || undefind || empty
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_ddl?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientNameArray = res.data1;
        this.clientNameArray.length == 1 ? (this.filterForm.patchValue({ ClientId: this.clientNameArray[0].id }), this.getElectionName(), this.clientIdFlag = false) : '';
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
  this.nullishFilterForm(); //Check all value null || undefind || empty
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Election_byClientId_ddl?ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.electionNameArray = res.data1;
        this.electionNameArray.length == 1 ? (this.filterForm.patchValue({ ElectionId: this.electionNameArray[0].ElectionId }), this.IsSubElectionApplicable = this.electionNameArray[0].IsSubElectionApplicable, this.getConstituencyName(), this.electionFlag = false) : '';
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
    this.nullishFilterForm(); //Check all value null || undefind || empty
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Constituency_byClientId_ddl?ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.constituencyNameArray = res.data1;
        this.getIsSubEleAppId(this.filterForm.value.ElectionId);
        this.constituencyNameArray.length == 1 ? ((this.filterForm.patchValue({ ConstituencyId: this.constituencyNameArray[0].ConstituencyId }), this.constituencyFlag = false), this.boothSummary()) : '';
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
    debugger;
    this.nullishFilterForm(); //Check all value null || undefind || empty
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&AssemblyId=' + 0 + '&IsSubElectionApplicable=' + this.IsSubElectionApplicable
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Clientwise_BoothSummary?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.cardData = res.data1[0];
        this.villageDropdown = res.data2;
        this.dataNotFound = true;
        this.ClientWiseBoothList();
      } else {
        this.dataNotFound = false;
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
    this.HighlightRow = 0;
    this.nullishFilterForm(); //Check all value null || undefind || empty
    debugger;
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&AssemblyId=' + 0 + '&IsSubElectionApplicable=' + this.IsSubElectionApplicable + '&VillageId=' + this.filterForm.value.village
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Clientwise_BoothList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        debugger;
        this.spinner.hide();
        this.clientWiseBoothListArray = res.data1;
        this.dataNotFound = true;
      } else {
        this.clientWiseBoothListArray = [];
        this.spinner.hide();
        this.dataNotFound = false;
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }



  // ------------------------------------------filter data all methodes start here ------------------------------ //

  clearTopFilter(flag: any) {
    if (flag == 'clientId') {
      this.filterForm.reset()
    } else if (flag == 'electionId') {
      this.filterForm.reset({ ClientId: this.filterForm.value.ClientId })
    } else if (flag == 'constituencyId') {
      this.filterForm.reset({
        ClientId: this.filterForm.value.ClientId,
        ElectionId: this.filterForm.value.ElectionId,
      })
    } else if (flag == 'village') {
      this.filterForm.reset({
        ClientId: this.filterForm.value.ClientId,
        ElectionId: this.filterForm.value.ElectionId,
        ConstituencyId: this.filterForm.value.ConstituencyId,
      });
      this.ClientWiseBoothList();
    } else if (flag == 'BoothId') {
      this.filterForm.reset({
        ClientId: this.filterForm.value.ClientId,
        ElectionId: this.filterForm.value.ElectionId,
        ConstituencyId: this.filterForm.value.ConstituencyId,
      })
    }
    this.dataNotFound = false;

    // this.paginationNo = 1;
    // this.getClientAgentWithBooths();
  }

  nullishFilterForm() {
    let fromData = this.filterForm.value;
    fromData.ClientId ?? this.filterForm.controls['ClientId'].setValue(0); 
    fromData.ElectionId ?? this.filterForm.controls['ElectionId'].setValue(0); 
    fromData.ConstituencyId ?? this.filterForm.controls['ConstituencyId'].setValue(0); 
    fromData.village ?? this.filterForm.controls['village'].setValue(0); 
    fromData.Search ?? this.filterForm.controls['Search'].setValue(''); 
    fromData.getBoothId ?? this.filterForm.controls['getBoothId'].setValue(0); 
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

  selBoothList(BoothId: any) {
    debugger
    let boothDetailsById = this.clientWiseBoothListArray.filter((ele:any) => { if(ele.BoothId == BoothId) return ele})
    // Start Data Filled Filed Checkbox code
    this.isChecked.setValue(false);
    this.fillDataId = 0;
    this.votersPaginationNo = 1;
    //End Data Filled Filed Checkbox code

    this.globalboothVoterData = boothDetailsById[0];
    this.HighlightRow = boothDetailsById[0]?.BoothId;
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&BoothId=' +  this.filterForm.value?.getBoothId;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_BoothDetails?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.boothDataHide = true;
        this.spinner.hide();
        this.clickBoothListArray = res.data1[0];
        // setTimeout(() => { this.defaultShowVoterList(); }, 100);
      } else {
        this.boothDataHide = false;
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
    debugger
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&BoothId=' + this.globalboothVoterData.BoothId +
      '&AssemblyId=' + this.globalboothVoterData.AssemblyId + '&flag=' + this.voterListFlag + '&Search=' + this.searchVoters.value + '&nopage=' + this.votersPaginationNo + '&IsFilled=' + this.fillDataId;

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

  onCheckFillData(event: any) {
    event.target.checked == true ? this.fillDataId = 1 : this.fillDataId = 0; this.votersPaginationNo = 1;
    this.boothVoterList();
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
        this.familyTotal = res.data2[0].TotalCount;
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

  familyDetails(ParentVoterId: any) {
    let obj = 'ParentVoterId=' + ParentVoterId + '&ClientId=' + this.filterForm.value.ClientId + '&Search=';
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_FamilyMember?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.boothFamilyDetailsArray = res.data1;
      } else {
        this.boothFamilyDetailsArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
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
      if (this.searchAgent.value == "" || this.searchAgent.value == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject.pipe(debounceTime(700)).subscribe(() => {
      this.searchAgent.value;
      this.boothAgentList();
    });
  }
  // ------------------------------------------  Agent  list with filter start here  ------------------------------------------//

  // ------------------------------------------  global uses start here   ------------------------------------------//
  clearFiltersBooth(flag: any) {
    if (flag == 'clearSearchVoters') {
      this.searchVoters.setValue('');
      this.boothVoterList();
    } else if (flag == 'clearFamilyVoters') {
      this.searchFamily.setValue('');
      this.boothFamilyList();
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
    //  else if (flag == 'village') {
    //   this.selVillage.setValue(0);
    //   this.ClientWiseBoothList();
    //   this.boothDataHide =false;
    // }

  }

  getIsSubEleAppId(eleId: any) {
    this.electionNameArray.filter((item: any) => {
      if (item.ElectionId == eleId) {
        this.IsSubElectionApplicable = item.IsSubElectionApplicable;
      }
    })
  }

  defaultShowVoterList() {
    // let defualt click voters tab 
    let clickOnVoterTab: any = document.getElementById('pills-voters-tab');
    clickOnVoterTab.click();
  }
  // ------------------------------------------  global uses end here   ------------------------------------------//

  //  ------------------------------------------   Add Agent modal function's start here  ------------------------------------------ //
  agentForm() {
    this.assignAgentForm = this.fb.group({
      Id: [0],
      ClientId: [''],
      FullName: [''],
      FName: ['', [Validators.required, Validators.pattern(/^\S*$/)]],
      MName: ['', [Validators.required, Validators.pattern(/^\S*$/)]],
      LName: ['', [Validators.required, Validators.pattern(/^\S*$/)]],
      Address: [''],
      MobileNo: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      IsMemberAddAllow: [''],
      CreatedBy: ['']
    })
  }

  get f() { return this.assignAgentForm.controls };

  addAgent() {
    this.submitted = true;
    if (this.assignAgentForm.invalid) {
      this.spinner.hide();
      return;
    }
    else {
      this.spinner.show();
      let data = this.assignAgentForm.value;
      data.IsMemberAddAllow == true ? data.IsMemberAddAllow = 1 : data.IsMemberAddAllow = 0 //only assign true = 1 & false = 0
      let FullName = data.FName + " " + data.MName + " " + data.LName;
      data.FullName = FullName;

      let obj = data.Id + '&FullName=' + data.FullName + '&MobileNo=' + data.MobileNo
        + '&FName=' + data.FName + '&MName=' + data.MName + '&LName=' + data.LName + '&Address=' + data.Address
        + '&IsMemberAddAllow=' + data.IsMemberAddAllow + '&ClientId=' + this.filterForm.value.ClientId + '&CreatedBy=' + this.commonService.loggedInUserId()

      this.callAPIService.setHttp('get', 'Web_Client_InsertBoothAgent?Id=' + obj, false, false, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.spinner.hide();
          this.toastrService.success(res.data1[0].Msg);
          this.boothAgentList();
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
  }

  redirectToAgentDetails(obj: any) {
    this.encryptData = this.commonService.encrypt(obj);
    const url = this.router.createUrlTree(['agents-activity', { Data: this.encryptData }])
    window.open(url.toString(), '_blank');
    // sessionStorage.setItem('agents-activity', JSON.stringify(obj))
    // this.router.navigate(['../agents-activity']);
  }
  //  ------------------------------------------   Add Agent modal function's end here  ------------------------------------------- //

  redirectToVoterPrfile(obj: any) {
    this.encryptData = this.commonService.encrypt(obj);
    const url = this.router.createUrlTree(['voters-profile', { Data: this.encryptData }])
    window.open(url.toString(), '_blank');
  }



  // ------------------------------------------ Booth details ------------------------------ -------------------- //

  openDialogVoterCallEntries() {
    const dialogRef = this.dialog.open(VoterCallEntriesComponent, {
      panelClass: 'fullscreen-dialog',
      height: '98vh',
      width: '99%'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  openDialogNameCorrection() {
    const dialogRef = this.dialog.open(NameCorrectionDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
