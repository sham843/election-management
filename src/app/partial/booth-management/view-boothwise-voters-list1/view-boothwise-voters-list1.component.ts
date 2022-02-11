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
import { DatePipe } from '@angular/common';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { ExcelService } from '../../../services/excel.service'

@Component({
  selector: 'app-view-boothwise-voters-list1',
  templateUrl: './view-boothwise-voters-list1.component.html',
  styleUrls: ['./view-boothwise-voters-list1.component.css']
})
export class ViewBoothwiseVotersList1Component implements OnInit {

  clientNameArray: any;
  filterForm!: FormGroup;
  electionNameArray: any;
  constituencyNameArray: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  total: any;
  subjectVoters: Subject<any> = new Subject();
  subjectFamily: Subject<any> = new Subject();
  subjectMigrated: Subject<any> = new Subject();
  subjectPending: Subject<any> = new Subject();
  subjectAgent: Subject<any> = new Subject();
  subjectCrm: Subject<any> = new Subject();
  subjectCrmHistory: Subject<any> = new Subject();
  subjectExpired: Subject<any> = new Subject();
  subjectLeaders: Subject<any> = new Subject();
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

  // crm tab var start 
  followupStatusDropDownData = [{ id: 1, name: 'Todays Followups', class: 'text-main' }, { id: 2, name: 'Upcoming Followups', class: 'text-success' }, { id: 3, name: 'Missed Followups', class: 'text-dark' }, { id: 4, name: 'Not To Call', class: 'text-danger' }, { id: 5, name: 'New', class: 'text-info' }]

  crmFilterForm!: FormGroup;
  getCrmTableListrTotal: any;
  getCrmTableList: any;
  crmPaginationNo: number = 1;
  crmPageSize: number = 10;

  crmHistoryFilterForm!: FormGroup;
  getCrmHistoryTableListrTotal: any;
  getCrmHistoryTableList: any;
  crmHistoryPaginationNo: number = 1;
  crmHistoryPageSize: number = 10;
  feedbackTypeArray = [{ id: 1, name: 'Positive' }, { id: 2, name: 'Negitive' }, { id: 3, name: 'Neutral' }];
  defaultCloseBtn: boolean = false;

  getFeedbacksList: any
  getFeedbacksListTotal: any;
  feedbacksPaginationNo: any = 1;
  feedbacksPageSize: number = 10;
  showBoothName: any;
  // Main Global Filter Variable Declreation

  fillDataId1 = 0;

  BoothAnalyticsObj = {ClientId: 0, ElectionId: 0, ConstituencyId: 0,VillageId: 0, BoothId: 0, flag: 0}

  searchExpired = new FormControl('');
  ExpiredListArray: any;
  ExpiredPaginationNo = 1;
  ExpiredPageSize: number = 10;
  ExpiredTotal: any;

  searchLeaders = new FormControl('');
  LeadersListArray: any;
  LeadersPaginationNo = 1;
  LeadersPageSize: number = 10;
  LeadersTotal: any;
  VoterListDownloadExcel: any;
  topClientName: any;
  topElectionName: any;
  topConstituencyName: any;


      // Voters Variable Declreation

      globalFilterForm!: FormGroup;
      voterListArray: any;
      politicalPartyArray: any;
      religionListArray: any;
      VoterCastListArray: any;
      favourofListArray: any;
      opposeOfListArray: any;
      professionArray = [{id:1,name:'Dairy Farm'},{id:2,name:'Goat/Sheep Herd	'},{id:3,name:'Sugar Cane Cutter	'},{id:4,name:'Farmer'},{id:5,name:'Business'},]
      genderArray = [{ id: 1, name: 'Male' }, { id: 2, name: 'Female' }, { id: 3, name: 'Other' }];
      mobileNoAvailableArray = [{ id: 1, name: 'Yes' }, { id: 2, name: 'No' }];
      bussinessArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];
      ratingStarArray = [{ id: 1, name: '1 Star' }, { id: 2, name: '1.5 Star' }, { id: 3, name: '2 Star' }, { id: 4, name: '2.5 Star' }, { id: 5, name: '3 Star' },
      { id: 6, name: '3.5 Star' }, { id: 7, name: '4 Star' }, { id: 8, name: '4.5 Star' }, { id: 9, name: '5 Star' }];
      yuvakArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];
      ageArray = [{ id: 1, name: '18-40' }, { id: 2, name: '40-60' }, { id: 3, name: '60 and Above' }];
      familySizeArray = [{ id: 1, name: '1-5' }, { id: 2, name: '5-10' }, { id: 3, name: '10 and Above' }];
      filteredValueNameArray:any = [];
      checkedDataflag: boolean = true;
      indexNo: any;
      globalAssemblyId: any;
      filterSidebarFlag = 'VotersFlag';



  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private datePipe: DatePipe,
    public dateTimeAdapter: DateTimeAdapter<any>,
    public excelService: ExcelService,
  ) {
    dateTimeAdapter.setLocale('en-IN');
    let getUrlData: any = this.route.snapshot.params.id;
    if (getUrlData) {
      getUrlData = getUrlData.split('.');
      this.BoothAnalyticsObj = {
        'ClientId': +getUrlData[0], 'ElectionId': +getUrlData[1], 'ConstituencyId': +getUrlData[2]
        , 'VillageId': +getUrlData[3], 'BoothId': +getUrlData[4], 'flag': +getUrlData[5]
      }
    }
  }

  ngOnInit(): void {
    this.defaultFilterForm();
    this.deafultCrmFilterForm();
    this.deafultCrmHistoryFilterForm();
    this.getClientName();
    this.searchVotersFilters('false');
    this.searchMigratedFilters('false');
    this.searchPendingFilters('false');
    this.searchAgentFilters('false');
    this.searchFamilyFilters('false');
    this.searchCrmFilter('false');
    this.searchCrmHistoryFilter('false');
    this.searchExpiredFilters('false');
    this.searchLeadersFilters('false');
    this.agentForm();
    this.boothAnalyticsRedData();

    
    this.globalFilterDataForm();
  }

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      ClientId: [this.BoothAnalyticsObj.ClientId || 0],
      ElectionId: [this.BoothAnalyticsObj.ElectionId || 0],
      ConstituencyId: [this.BoothAnalyticsObj.ConstituencyId || 0],
      village: [this.BoothAnalyticsObj.VillageId || 0],
      getBoothId: [this.BoothAnalyticsObj.BoothId || 0],
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
        if (this.electionNameArray.length > 1 && this.BoothAnalyticsObj.flag == 1) {
          this.getConstituencyName();
        }
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
    this.nullishFilterForm(); //Check all value null || undefind || empty
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&AssemblyId=' + 0 + '&IsSubElectionApplicable=' + this.IsSubElectionApplicable;
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
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&AssemblyId=' + 0 + '&IsSubElectionApplicable=' + this.IsSubElectionApplicable + '&VillageId=' + this.filterForm.value.village
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Clientwise_BoothList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientWiseBoothListArray = res.data1;
        if (this.BoothAnalyticsObj.flag == 1) {
          this.selBoothList(this.BoothAnalyticsObj.BoothId);
        }
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
      // this.defaultFilterForm();
      this.filterForm.patchValue({
        ClientId: this.filterForm.value.ClientId,
        ElectionId: 0,
        ConstituencyId: 0,
        village: 0,
        getBoothId: 0
      })
    } else if (flag == 'electionId') {
      this.filterForm.patchValue({
        ClientId: this.filterForm.value.ClientId,
        ElectionId: 0,
        ConstituencyId: 0,
        village: 0,
        getBoothId: 0
      })
    } else if (flag == 'constituencyId') {
      this.filterForm.patchValue({
        ClientId: this.filterForm.value.ClientId,
        ElectionId: this.filterForm.value.ElectionId,
        ConstituencyId: 0,
        village: 0,
        getBoothId: 0
      })
    } else if (flag == 'village') {
      this.filterForm.patchValue({
        ClientId: this.filterForm.value.ClientId,
        ElectionId: this.filterForm.value.ElectionId,
        ConstituencyId: this.filterForm.value.ConstituencyId,
        village: 0,
        getBoothId: 0
      });
      this.ClientWiseBoothList();
    } else if (flag == 'BoothId') {
      this.filterForm.patchValue({
        ClientId: this.filterForm.value.ClientId,
        ElectionId: this.filterForm.value.ElectionId,
        ConstituencyId: this.filterForm.value.ConstituencyId,
        village: 0,
      })
    }
    this.dataNotFound = false;
    this.showBoothName = '';

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


  // ------------------------------------------filter data all methodes start here ------------------------------ //

  // ------------------------------------------ Booth details ------------------------------ -------------------- //

  selBoothList(BoothId: any) {
    this.clientWiseBoothListArray.map((ele: any) => { // Show Booth Name When Select Booth
      if (ele.BoothId == this.filterForm.value.getBoothId) {
        this.showBoothName = ele.BoothNickName;
      }
    })

    let boothDetailsById = this.clientWiseBoothListArray.filter((ele: any) => { if (ele.BoothId == BoothId) return ele })
    // Start Data Filled Filed Checkbox code
    this.isChecked.setValue(false);
    this.fillDataId = 0;
    this.votersPaginationNo = 1;
    //End Data Filled Filed Checkbox code

    this.globalboothVoterData = boothDetailsById[0];
    this.HighlightRow = boothDetailsById[0]?.BoothId;
    let formDataTopFilter = this.filterForm.value;
    let villageId: any;
    formDataTopFilter.village == null || formDataTopFilter.village == undefined || formDataTopFilter.village == '' ? villageId = 0 : villageId = formDataTopFilter.village;
    let obj: any = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + formDataTopFilter.ClientId + '&ElectionId=' + formDataTopFilter.ElectionId +
      '&ConstituencyId=' + formDataTopFilter.ConstituencyId + '&AssemblyId=' + 0 + '+&IsSubElectionApplicable=' +
      this.IsSubElectionApplicable + '&BoothId=' + formDataTopFilter.getBoothId + '&VillageId=' + villageId;

    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_BoothDetails_1_0?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.boothDataHide = true;
        this.spinner.hide();
        this.defaultShowVoterList();
        this.clickBoothListArray = res.data1[0];
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

// get Assembly Id
  globalAssemblyFilter(event:any){
    let AssemblyId = event[0]?.data.AssemblyId;
    AssemblyId ? this.globalAssemblyId = AssemblyId : '';
  }

   // ------------------------------------------ Global Main filter start here  ------------------------------------------//

  
   globalFilterDataForm() {
    this.globalFilterForm = this.fb.group({
      ClientId: [0],
      ElectionId: [0],
      ConstituencyId: [0],
      VillageId: [0],
      AssemblyId: [0],
      BoothId: [0],
      Search: [0],
      AreaId: [0],
      Gender: [''],
      HaveMobileNo: [0],
      HaveBussiness: [2],
      PartyId: [0],
      LeadeImp: [0],
      IsYuvak: [2],
      InFavourofId: [0],
      InOpposeOfId: [0],
      AgegroupId: [0],
      FamilySize: [0],
      ReligionId: [0],
      CastId: [0],
      ProfessionId: [0],
    })
  }

  globalFilterOnInitData() {
    this.getVoterAreaList();
    this.getPoliticalPartyList();
    this.getReligionList();
    this.getVoterCastList();
    this.getInFavourofList();
    this.getInOpposeOfList();
  }

clearBoothVotersFilterForm(){
  this.globalFilterDataForm();
  this.nullishGlobalFilterForm();
  this.filteredValueNameArray = [];
  this.boothVoterList();
}

nullishDefaultFilterForm() {
  let fromData = this.filterForm.value;
  fromData.getBoothId ?? this.filterForm.controls['getBoothId'].setValue(0);
}

  //.......... get Voter Area List ...............//
  getVoterAreaList() {
    this.spinner.show();
     this.nullishDefaultFilterForm();
    let formData = this.globalFilterForm.value;
    let globalAssemblyId1 ; 
    (this.globalAssemblyId == undefined || this.globalAssemblyId == '' || this.globalAssemblyId == null) ? globalAssemblyId1 = 0 : globalAssemblyId1 = this.globalAssemblyId;
    formData.AssemblyId = 0 || globalAssemblyId1 ;
    this.callAPIService.setHttp('get', 'Web_Get_VoterList_Filter_Area_ddl?ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId()
      + '&AssemblyId=' + formData.AssemblyId + '&BoothId=' + this.filterForm.value.getBoothId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.voterListArray = res.data1;
      } else {
        this.spinner.hide();
        this.voterListArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  //.......... get Political Party List ...............//
  getPoliticalPartyList() {
    this.spinner.show();
    let formData = this.globalFilterForm.value;
    this.callAPIService.setHttp('get', 'Web_Get_VoterList_Filter_PoliticalParty_ddl?ClientId=' + this.filterForm.value.ClientId + '&UserId=' 
    + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.politicalPartyArray = res.data1;
      } else {
        this.spinner.hide();
        this.politicalPartyArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

   //.......... get Religion List ...............//
   getReligionList() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_VoterList_Filter_Religion_ddl?ClientId=' + this.filterForm.value.ClientId + '&UserId=' 
    + this.commonService.loggedInUserId() + '&BoothId=' + this.filterForm.value.getBoothId + '&VillageId=' +  this.filterForm.value.village , false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.religionListArray = res.data1;
      } else {
        this.spinner.hide();
        this.religionListArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

   //.......... get Voter Cast List ...............//
   getVoterCastList() {
    this.spinner.show();
    let formData = this.globalFilterForm.value;
    this.callAPIService.setHttp('get', 'Web_Get_VoterList_Filter_Cast_ddl?ClientId=' + this.filterForm.value.ClientId + '&UserId=' 
    + this.commonService.loggedInUserId() + '&BoothId=' + this.filterForm.value.getBoothId + '&VillageId=' +  this.filterForm.value.village
    + '&ReligionId=' +  formData.ReligionId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.VoterCastListArray = res.data1;
      } else {
        this.spinner.hide();
        this.VoterCastListArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

    //.......... get InFavourof Supporter List ...............// 
      
    getInFavourofList() {
      this.spinner.show();
      let formData = this.globalFilterForm.value;
      this.callAPIService.setHttp('get', 'Web_Get_VoterList_Filter_Supporter_ddl?ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId()
      + '&InfavourOfFlag=' + 1 + '&BoothId=' + this.filterForm.value.getBoothId + '&VillageId=' +  this.filterForm.value.village , false, false, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.spinner.hide();
          this.favourofListArray = res.data1;
        } else {
          this.spinner.hide();
          this.favourofListArray = [];
        }
      }, (error: any) => {
        this.spinner.hide();
        if (error.status == 500) {
          this.router.navigate(['../500'], { relativeTo: this.route });
        }
      })
    }

      //.......... get InOpposeOf List ...............// 
      
      getInOpposeOfList() {
        this.spinner.show();
        let formData = this.globalFilterForm.value;
        this.callAPIService.setHttp('get', 'Web_Get_VoterList_Filter_Supporter_ddl?ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId()
        + '&InfavourOfFlag=' + 4 + '&BoothId=' + this.filterForm.value.getBoothId + '&VillageId=' +  this.filterForm.value.village, false, false, false, 'electionServiceForWeb');
        this.callAPIService.getHttp().subscribe((res: any) => {
          if (res.data == 0) {
            this.spinner.hide();
            this.opposeOfListArray = res.data1;
          } else {
            this.spinner.hide();
            this.opposeOfListArray = [];
          }
        }, (error: any) => {
          this.spinner.hide();
          if (error.status == 500) {
            this.router.navigate(['../500'], { relativeTo: this.route });
          }
        })
      }

      insertUpdateFilterData(obj:any,flagName:any){
        this.checkedDataflag = true;
        if(this.filteredValueNameArray.length == 0){
         this.filteredValueNameArray.push(obj);
         this.checkedDataflag = false;
        } else{
         this.filteredValueNameArray.map((ele:any,index:any)=>{
           if(ele.flag == flagName){
             this.filteredValueNameArray[index] = obj;
             this.checkedDataflag = false;
           } 
         })
       }
       if(this.checkedDataflag && this.filteredValueNameArray.length >= 1){
         this.filteredValueNameArray.push(obj);
       }
      }

      changedFilterData(event:any,flagName:any){
        if(event.length != 0){
          let  obj:any = event[0].data;
          if(flagName == 'AreaId'){
            let obj1 = {id:obj.AreaId,name:obj.AreaNameEnglish,flag:flagName}
            this.insertUpdateFilterData(obj1,flagName);
          } else if(flagName == 'ReligionId'){
            let obj1 = {id:obj.ReligionId,name:obj.ReligionName,flag:flagName}
            this.insertUpdateFilterData(obj1,flagName);
          } else if(flagName == 'CastId'){
            let obj1 = {id:obj.CastId,name:obj.CastName,flag:flagName}
            this.insertUpdateFilterData(obj1,flagName);
          } else if(flagName == 'PartyId'){
            let obj1 = {id:obj.PartyId,name:obj.PartyName,flag:flagName}
            this.insertUpdateFilterData(obj1,flagName);
          } else if(flagName == 'InFavourofId'){
            let obj1 = {id:obj.SupporterOfId,name:obj.SupporterName,flag:flagName}
            this.insertUpdateFilterData(obj1,flagName);
          }else if(flagName == 'InOpposeOfId'){
            let obj1 = {id:obj.SupporterOfId,name:obj.SupporterName,flag:flagName}
            this.insertUpdateFilterData(obj1,flagName);
          }
          else{
            let obj1 = {id:obj.id,name:obj.name,flag:flagName}
            this.insertUpdateFilterData(obj1,flagName);
            // this.votersPaginationNo = 1
          }
        }
      }

      clearGlobalFilterForm(index:any,obj:any,checkFlag:any){
        if(obj.flag == 'AreaId'){
          this.globalFilterForm.controls['AreaId'].setValue(0);
        } else if(obj.flag == 'Gender'){
          this.globalFilterForm.controls['Gender'].setValue('');
        } else if( obj.flag == 'HaveMobileNo'){
          this.globalFilterForm.controls['HaveMobileNo'].setValue(0);
        } else if( obj.flag == 'HaveBussiness'){
          this.globalFilterForm.controls['HaveBussiness'].setValue(2);
        } else if( obj.flag == 'ProfessionId'){
          this.globalFilterForm.controls['ProfessionId'].setValue(0);
        } else if( obj.flag == 'PartyId'){
          this.globalFilterForm.controls['PartyId'].setValue(0);
        } else if( obj.flag == 'LeadeImp'){
          this.globalFilterForm.controls['LeadeImp'].setValue(0);
        } else if( obj.flag == 'IsYuvak'){
          this.globalFilterForm.controls['IsYuvak'].setValue(2);
        } else if( obj.flag == 'AgegroupId'){
          this.globalFilterForm.controls['AgegroupId'].setValue(0);
        }  else if( obj.flag == 'FamilySize'){
          this.globalFilterForm.controls['FamilySize'].setValue(0);
        } else if( obj.flag == 'ReligionId'){
          this.globalFilterForm.controls['ReligionId'].setValue(0);
        } else if( obj.flag == 'CastId'){
          this.globalFilterForm.controls['CastId'].setValue(0);
        } else if( obj.flag == 'InFavourofId'){
          this.globalFilterForm.controls['InFavourofId'].setValue(0);
        } else if( obj.flag == 'InOpposeOfId'){
          this.globalFilterForm.controls['InOpposeOfId'].setValue(0);
        }
        this.filteredValueNameArray.splice(index,1);
        
        if(checkFlag == 'chipFlag'){ // when Chip is Remove then Call 
          if(this.filterSidebarFlag =='VotersFlag'){
            this.votersPaginationNo = 1
            this.boothVoterList();
          } else if(this.filterSidebarFlag =='FamiliesFlag'){
            this.familyPaginationNo = 1;
            this.boothFamilyList();
          } else if(this.filterSidebarFlag =='MigratedFlag'){
            this.migratedPaginationNo = 1;
            this.boothMigratedList();
          } else if(this.filterSidebarFlag =='PendingFlag'){
            this.pendingPaginationNo = 1;
            this.boothPendingList();
          } else if(this.filterSidebarFlag =='CRMFlag'){
            this.crmPaginationNo = 1;
            this.getCrmTableData();
          } else if(this.filterSidebarFlag =='CRMHistoryFlag'){
            this.crmHistoryPaginationNo = 1;
            this.getCrmHistoryTableData();
          }
        }
      }

      FiltereDataRemove(flagName:any){ //Form Remove  formFlag Using
         this.filteredValueNameArray.map((ele:any,index:any)=>{
          if(ele.flag == flagName){
            this.indexNo = index;
          } 
        })
        let obj = {flag:flagName}
        this.clearGlobalFilterForm(this.indexNo,obj,'formFlag');
      }

      globalFilterShowData(){
        if(this.filterSidebarFlag =='VotersFlag'){
          this.boothVoterList();
        } else if(this.filterSidebarFlag =='FamiliesFlag'){
          this.boothFamilyList();
        } else if(this.filterSidebarFlag =='MigratedFlag'){
          this.boothMigratedList();
        } else if(this.filterSidebarFlag =='PendingFlag'){
          this.boothPendingList();
        } else if(this.filterSidebarFlag =='CRMFlag'){
          this.getCrmTableData();
        } else if(this.filterSidebarFlag =='CRMHistoryFlag'){
          this.getCrmHistoryTableData();
        }
      }

      nullishGlobalFilterForm() {
        let fromData = this.globalFilterForm.value;

        fromData.ClientId ?? this.globalFilterForm.controls['ClientId'].setValue(0);
        fromData.ElectionId ?? this.globalFilterForm.controls['ElectionId'].setValue(0);
        fromData.ConstituencyId ?? this.globalFilterForm.controls['ConstituencyId'].setValue(0);
        fromData.VillageId ?? this.globalFilterForm.controls['VillageId'].setValue(0);
        fromData.AssemblyId ?? this.globalFilterForm.controls['AssemblyId'].setValue(0);
        fromData.BoothId ?? this.globalFilterForm.controls['BoothId'].setValue(0);

        fromData.Search ?? this.globalFilterForm.controls['Search'].setValue('');
        fromData.AreaId ?? this.globalFilterForm.controls['AreaId'].setValue(0);
        fromData.Gender ?? this.globalFilterForm.controls['Gender'].setValue('');
        fromData.HaveMobileNo ?? this.globalFilterForm.controls['HaveMobileNo'].setValue(0);
        fromData.HaveBussiness ?? this.globalFilterForm.controls['HaveBussiness'].setValue(2);
        fromData.PartyId ?? this.globalFilterForm.controls['PartyId'].setValue(0);

        fromData.LeadeImp ?? this.globalFilterForm.controls['LeadeImp'].setValue(0);
        fromData.IsYuvak ?? this.globalFilterForm.controls['IsYuvak'].setValue(2);
        fromData.InFavourofId ?? this.globalFilterForm.controls['InFavourofId'].setValue(0);
        fromData.InOpposeOfId ?? this.globalFilterForm.controls['InOpposeOfId'].setValue(0);
        fromData.AgegroupId ?? this.globalFilterForm.controls['AgegroupId'].setValue(0);

        fromData.FamilySize ?? this.globalFilterForm.controls['FamilySize'].setValue(0);
        fromData.ReligionId ?? this.globalFilterForm.controls['ReligionId'].setValue(0);
        fromData.CastId ?? this.globalFilterForm.controls['CastId'].setValue(0);
        fromData.ProfessionId ?? this.globalFilterForm.controls['ProfessionId'].setValue(0);
      }


    // ------------------------------------------ Global Main filter End here  ------------------------------------------//










  // ------------------------------------------ vooter list with filter start here  ------------------------------------------//

  boothVoterList() {
    this.spinner.show();
    this.nullishGlobalFilterForm();
    let votersData = this.globalFilterForm.value;
    let topFilterFormData = this.filterForm.value;
    let AssemblyId = this.globalAssemblyId || 0;
    let genderData = votersData.Gender == 1 ?'M' : votersData.Gender == 2 ?'F' : votersData.Gender == 3 ?'T' : '' ;
   
    // '&IsFilled=' + this.fillDataId1;

     let obj = '&ClientId=' + topFilterFormData.ClientId + '&UserId=' + this.commonService.loggedInUserId() +
      '&ElectionId=' + topFilterFormData.ElectionId + '&ConstituencyId=' + topFilterFormData.ConstituencyId + '&AssemblyId=' +
      AssemblyId  + '&BoothId=' + topFilterFormData.getBoothId + '&VillageId=' +
      topFilterFormData.village + '&Search=' + this.searchVoters.value + '&AreaId=' + votersData.AreaId +
      '&Gender=' + genderData + '&HaveMobileNo=' + votersData.HaveMobileNo + '&HaveBussiness=' +
      votersData.HaveBussiness + '&PartyId=' + votersData.PartyId + '&LeadeImp=' + votersData.LeadeImp + '&IsYuvak=' +
      votersData.IsYuvak + '&InFavourofId=' + votersData.InFavourofId + '&InOpposeOfId=' + votersData.InOpposeOfId +
      '&AgegroupId=' + votersData.AgegroupId + '&FamilySize=' + votersData.FamilySize + '&ReligionId=' + votersData.ReligionId
      + '&CastId=' + votersData.CastId + '&nopage=' + this.votersPaginationNo + '&ProfessionId=' + votersData.ProfessionId;

    let url = '';
   
    this.IsSubElectionApplicable == 0 ? url = 'Web_Get_VoterList_Filter_Voters_NoSubEle?' + obj : url = 'Web_Get_VoterList_Filter_Voters?' + obj
    this.callAPIService.setHttp('get', url, false, false, false, 'electionServiceForWeb');
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
    this.subjectVoters.next();
  }

  searchVotersFilters(flag: any) {
    this.subjectVoters
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
    this.nullishGlobalFilterForm();
    let votersData = this.globalFilterForm.value;
    let topFilterFormData = this.filterForm.value;
    let AssemblyId = this.globalAssemblyId || 0;
    let genderData = votersData.Gender == 1 ?'M' : votersData.Gender == 2 ?'F' : votersData.Gender == 3 ?'T' : '' ;

     let obj = '&ClientId=' + topFilterFormData.ClientId + '&UserId=' + this.commonService.loggedInUserId() +
      '&ElectionId=' + topFilterFormData.ElectionId + '&ConstituencyId=' + topFilterFormData.ConstituencyId + '&AssemblyId=' +
      AssemblyId  + '&BoothId=' + topFilterFormData.getBoothId + '&VillageId=' +
      topFilterFormData.village + '&Search=' + this.searchFamily.value + '&AreaId=' + votersData.AreaId +
      '&Gender=' + genderData + '&HaveMobileNo=' + votersData.HaveMobileNo + '&HaveBussiness=' +
      votersData.HaveBussiness + '&PartyId=' + votersData.PartyId + '&LeadeImp=' + votersData.LeadeImp + '&InFavourofId='
       + votersData.InFavourofId + '&InOpposeOfId=' + votersData.InOpposeOfId +
       '&FamilySize=' + votersData.FamilySize + '&ReligionId=' + votersData.ReligionId
      + '&CastId=' + votersData.CastId + '&nopage=' + this.familyPaginationNo + '&ProfessionId=' + votersData.ProfessionId;

    let url = '';
    this.IsSubElectionApplicable == 0 ? url = 'Web_Get_VoterList_Filter_FamilyHead_No_Ele?' + obj : url = 'Web_Get_VoterList_Filter_FamilyHead?' + obj
   
    this.spinner.show();
    this.callAPIService.setHttp('get', url, false, false, false, 'electionServiceForWeb');
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
    this.subjectFamily.next();
  }

  searchFamilyFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchFamily.value == "" || this.searchFamily == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subjectFamily
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
    this.spinner.show();
    this.nullishGlobalFilterForm();
    let votersData = this.globalFilterForm.value;
    let topFilterFormData = this.filterForm.value;
    let AssemblyId = this.globalAssemblyId || 0;
    let genderData = votersData.Gender == 1 ?'M' : votersData.Gender == 2 ?'F' : votersData.Gender == 3 ?'T' : '' ;
    
     let obj = '&ClientId=' + topFilterFormData.ClientId + '&UserId=' + this.commonService.loggedInUserId() +
      '&ElectionId=' + topFilterFormData.ElectionId + '&ConstituencyId=' + topFilterFormData.ConstituencyId + '&AssemblyId=' +
      AssemblyId  + '&BoothId=' + topFilterFormData.getBoothId + '&VillageId=' +
      topFilterFormData.village + '&Search=' + this.searchMigrated.value + '&AreaId=' + votersData.AreaId +
      '&Gender=' + genderData + '&HaveMobileNo=' + votersData.HaveMobileNo + '&HaveBussiness=' +
      votersData.HaveBussiness + '&PartyId=' + votersData.PartyId + '&LeadeImp=' + votersData.LeadeImp + '&IsYuvak=' +
      votersData.IsYuvak + '&InFavourofId=' + votersData.InFavourofId + '&InOpposeOfId=' + votersData.InOpposeOfId +
      '&AgegroupId=' + votersData.AgegroupId + '&FamilySize=' + votersData.FamilySize + '&ReligionId=' + votersData.ReligionId
      + '&CastId=' + votersData.CastId + '&nopage=' + this.migratedPaginationNo + '&ProfessionId=' + votersData.ProfessionId;

    let url = '';
    this.IsSubElectionApplicable == 0 ? url = 'Web_Get_VoterList_Filter_Migration_NoSubEle?' + obj : url = 'Web_Get_VoterList_Filter_Migration?' + obj
    this.callAPIService.setHttp('get', url, false, false, false, 'electionServiceForWeb');
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
    this.subjectMigrated.next();
  }

  searchMigratedFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchMigrated.value == "" || this.searchMigrated == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subjectMigrated
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
    this.spinner.show();
    this.nullishGlobalFilterForm();
    let votersData = this.globalFilterForm.value;
    let topFilterFormData = this.filterForm.value;
    let AssemblyId = this.globalAssemblyId || 0;
    let genderData = votersData.Gender == 1 ?'M' : votersData.Gender == 2 ?'F' : votersData.Gender == 3 ?'T' : '' ;
    
     let obj = '&ClientId=' + topFilterFormData.ClientId + '&UserId=' + this.commonService.loggedInUserId() +
      '&ElectionId=' + topFilterFormData.ElectionId + '&ConstituencyId=' + topFilterFormData.ConstituencyId + '&AssemblyId=' +
      AssemblyId  + '&BoothId=' + topFilterFormData.getBoothId + '&VillageId=' +
      topFilterFormData.village + '&Search=' + this.searchPending.value + '&AreaId=' + votersData.AreaId +
      '&Gender=' + genderData + '&HaveMobileNo=' + votersData.HaveMobileNo + '&HaveBussiness=' +
      votersData.HaveBussiness + '&PartyId=' + votersData.PartyId + '&LeadeImp=' + votersData.LeadeImp + '&IsYuvak=' +
      votersData.IsYuvak + '&InFavourofId=' + votersData.InFavourofId + '&InOpposeOfId=' + votersData.InOpposeOfId +
      '&AgegroupId=' + votersData.AgegroupId + '&FamilySize=' + votersData.FamilySize + '&ReligionId=' + votersData.ReligionId
      + '&CastId=' + votersData.CastId + '&nopage=' + this.pendingPaginationNo + '&ProfessionId=' + votersData.ProfessionId;

    let url = '';
    this.IsSubElectionApplicable == 0 ? url = 'Web_Get_VoterList_Filter_PendingVoters_NoSubEle?' + obj : url = 'Web_Get_VoterList_Filter_PendingVoters?' + obj
    this.callAPIService.setHttp('get', url, false, false, false, 'electionServiceForWeb');
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
    this.subjectPending.next();
  }

  searchPendingFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchPending.value == "" || this.searchPending == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subjectPending
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
    let topFilterFormData = this.filterForm.value;
    let AssemblyId = this.globalAssemblyId || 0;
      let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId 
       + '&ElectionId=' + topFilterFormData.ElectionId + '&ConstituencyId=' 
       + topFilterFormData.ConstituencyId + '&AssemblyId=' + AssemblyId  + '&BoothId=' + topFilterFormData.getBoothId + 
       '&VillageId=' + topFilterFormData.village + '&IsSubElectionApplicable=' + this.IsSubElectionApplicable + '&Search=' + this.searchAgent.value 
 
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_VoterList_Filter_Agent_List?' + obj, false, false, false, 'electionServiceForWeb');
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
    this.subjectAgent.next();
  }

  searchAgentFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchAgent.value == "" || this.searchAgent.value == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subjectAgent.pipe(debounceTime(700)).subscribe(() => {
      this.searchAgent.value;
      this.boothAgentList();
    });
  }
  // ------------------------------------------  Agent  list with filter End here  ------------------------------------------//

  // ------------------------------------------  CRM with filter start here  ------------------------------------------//

  deafultCrmFilterForm() {
    this.crmFilterForm = this.fb.group({
      Followupstatusid: [0],
      SearchText: [''],
    })
  }

  onKeyUpFilterCrmSearch() {
    this.subjectCrm.next();
  }

  searchCrmFilter(flag: any) {
    this.subjectCrm
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.crmFilterForm.value.SearchText
        this.crmPaginationNo = 1;
        this.getCrmTableData();
      }
      );
  }

  clearCrmFilter(flag: any) {
    if (flag == 'Followupstatus') {
      this.crmFilterForm.controls["Followupstatusid"].setValue(0);
    }
    this.crmPaginationNo = 1;
    this.getCrmTableData();
  }

  onClickPagintionCrm(pageNo: any) {
    this.crmPaginationNo = pageNo;
    this.getCrmTableData();
  }

  getCrmTableData() {
    this.spinner.show();
    this.nullishGlobalFilterForm();
    let crmFilterData = this.crmFilterForm.value;
    let votersData = this.globalFilterForm.value;
    let topFilterFormData = this.filterForm.value;
    let AssemblyId = this.globalAssemblyId || 0;
    let genderData = votersData.Gender == 1 ?'M' : votersData.Gender == 2 ?'F' : votersData.Gender == 3 ?'T' : '' ;
    
     let obj = '&ClientId=' + topFilterFormData.ClientId + '&UserId=' + this.commonService.loggedInUserId() +
      '&ElectionId=' + topFilterFormData.ElectionId + '&ConstituencyId=' + topFilterFormData.ConstituencyId + '&AssemblyId=' +
      AssemblyId  + '&BoothId=' + topFilterFormData.getBoothId + '&VillageId=' +
      topFilterFormData.village + '&Search=' + crmFilterData.SearchText + '&AreaId=' + votersData.AreaId +
      '&Gender=' + genderData + '&HaveMobileNo=' + votersData.HaveMobileNo + '&HaveBussiness=' +
      votersData.HaveBussiness + '&PartyId=' + votersData.PartyId + '&LeadeImp=' + votersData.LeadeImp + '&IsYuvak=' +
      votersData.IsYuvak + '&InFavourofId=' + votersData.InFavourofId + '&InOpposeOfId=' + votersData.InOpposeOfId +
      '&AgegroupId=' + votersData.AgegroupId + '&FamilySize=' + votersData.FamilySize + '&ReligionId=' + votersData.ReligionId
      + '&CastId=' + votersData.CastId + '&nopage=' + this.crmPaginationNo + '&ProfessionId=' + votersData.ProfessionId + '&Followupstatusid=' + crmFilterData.Followupstatusid;

    let url = '';
    this.IsSubElectionApplicable == 0 ? url = 'Web_Get_VoterList_Filter_CRM_NoSubEle?' + obj : url = 'Web_Get_VoterList_Filter_CRM?' + obj
      this.callAPIService.setHttp('get', url, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.getCrmTableList = res.data1;
        this.getCrmTableListrTotal = res.data2[0].TotalCount;
      } else {
        this.getCrmTableList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  crmAndCrmHistorySearchClear(flag: any) {
    if (flag == 'crm') {
      this.crmFilterForm.controls["SearchText"].setValue('');
    } else if (flag == 'crmHistory') {
      this.crmHistoryFilterForm.controls["SearchText"].setValue('');
    } else if (flag == 'crm1') {
      this.crmHistoryFilterForm.controls["SearchText"].setValue('');
      this.getCrmTableData();
    } else if (flag == 'crmHistory1') {
      this.crmHistoryFilterForm.controls["SearchText"].setValue('');
      this.getCrmHistoryTableData();
    }
  }

  // ------------------------------------------  CRM with filter End here  ------------------------------------------//

  // ------------------------------------------  CRM History with filter start here  ------------------------------------------//

  deafultCrmHistoryFilterForm() {
    this.crmHistoryFilterForm = this.fb.group({
      Followupstatusid: [0],
      SearchText: [''],
      feedbackstatus: [0],
      date: ['']
    })
  }

  onKeyUpFilterCrmHistorySearch() {
    this.subjectCrmHistory.next();
  }

  searchCrmHistoryFilter(flag: any) {
    this.subjectCrmHistory
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.crmHistoryFilterForm.value.SearchText
        this.crmHistoryPaginationNo = 1;
        this.getCrmHistoryTableData();
      }
      );
  }

  filterDateData(flag: any) {
    flag == 'range' ? this.defaultCloseBtn = true : this.defaultCloseBtn = false;
    this.crmHistoryPaginationNo = 1;
    this.getCrmHistoryTableData();
  }

  clearCrmHistoryFilter(flag: any) {
    if (flag == 'Followupstatus') {
      this.crmHistoryFilterForm.controls["Followupstatusid"].setValue(0);
    } else if (flag == 'feedbackstatus') {
      this.crmHistoryFilterForm.controls["feedbackstatus"].setValue(0);
    } else if (flag == 'dateRangePIcker') {
      this.crmHistoryFilterForm.controls["date"].setValue('');
    }
    this.crmHistoryPaginationNo = 1;
    this.getCrmHistoryTableData();
  }

  onClickPagintionCrmHistory(pageNo: any) {
    this.crmHistoryPaginationNo = pageNo;
    this.getCrmHistoryTableData();
  }

  getCrmHistoryTableData() {
    this.spinner.show();
    this.nullishGlobalFilterForm();
    let crmHistoryFilterData = this.crmHistoryFilterForm.value;
    crmHistoryFilterData.date = crmHistoryFilterData.date ? this.datePipe.transform(crmHistoryFilterData.date, 'yyyy/MM/dd') : '';
    let votersData = this.globalFilterForm.value;
    let topFilterFormData = this.filterForm.value;
    let AssemblyId = this.globalAssemblyId || 0;
    let genderData = votersData.Gender == 1 ?'M' : votersData.Gender == 2 ?'F' : votersData.Gender == 3 ?'T' : '' ;
    
     let obj = '&ClientId=' + topFilterFormData.ClientId + '&UserId=' + this.commonService.loggedInUserId() +
      '&ElectionId=' + topFilterFormData.ElectionId + '&ConstituencyId=' + topFilterFormData.ConstituencyId + '&AssemblyId=' +
      AssemblyId  + '&BoothId=' + topFilterFormData.getBoothId + '&VillageId=' +
      topFilterFormData.village + '&Search=' + crmHistoryFilterData.SearchText + '&AreaId=' + votersData.AreaId +
      '&Gender=' + genderData + '&HaveMobileNo=' + votersData.HaveMobileNo + '&HaveBussiness=' +
      votersData.HaveBussiness + '&PartyId=' + votersData.PartyId + '&LeadeImp=' + votersData.LeadeImp + '&IsYuvak=' +
      votersData.IsYuvak + '&InFavourofId=' + votersData.InFavourofId + '&InOpposeOfId=' + votersData.InOpposeOfId +
      '&AgegroupId=' + votersData.AgegroupId + '&FamilySize=' + votersData.FamilySize + '&ReligionId=' + votersData.ReligionId
      + '&CastId=' + votersData.CastId + '&nopage=' + this.crmHistoryPaginationNo + '&ProfessionId=' + votersData.ProfessionId + '&Followupstatusid=' + crmHistoryFilterData.Followupstatusid +
      '&SearchText=' + crmHistoryFilterData.SearchText + '&feedbackstatus=' + crmHistoryFilterData.feedbackstatus + '&date=' + crmHistoryFilterData.date;;

    let url = '';
    this.IsSubElectionApplicable == 0 ? url = 'Web_Get_VoterList_Filter_CRM_History_NoSubEle?' + obj : url = 'Sp_Web_Get_VoterList_Filter_CRM_History?' + obj
    this.callAPIService.setHttp('get', url, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.getCrmHistoryTableList = res.data1;
        this.getCrmHistoryTableListrTotal = res.data2[0].TotalCount;
      } else {
        this.getCrmHistoryTableList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }


  // ------------------------------------------  CRM History with filter End here  ------------------------------------------//


  // ------------------------------------------  Expired filter start here  ------------------------------------------//

  getExpiredList() {
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&BoothId=' + this.globalboothVoterData.BoothId +
      '&AssemblyId=' + this.globalboothVoterData.AssemblyId + '&Search=' + this.searchExpired.value + '&nopage=' + this.ExpiredPaginationNo;

    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_Booth_Expired_VoterList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.ExpiredListArray = res.data1;
        this.ExpiredTotal = res.data2[0].TotalCount;
      } else {
        this.ExpiredListArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintionExpired(pageNo: any) {
    this.ExpiredPaginationNo = pageNo;
    this.getExpiredList();
  }

  onKeyUpFilterExpired() {
    this.subjectExpired.next();
  }

  searchExpiredFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchExpired.value == "" || this.searchExpired == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subjectExpired
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchExpired.value;
        this.ExpiredPaginationNo = 1;
        this.getExpiredList();
      }
      );
  }

  // ------------------------------------------  Expired filter End here  ------------------------------------------//


  // ------------------------------------------  Leaders filter start here  ------------------------------------------//

  getLeadersList() {
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&BoothId=' + this.globalboothVoterData.BoothId +
      '&AssemblyId=' + this.globalboothVoterData.AssemblyId + '&Search=' + this.searchLeaders.value + '&nopage=' + this.LeadersPaginationNo;

    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_Booth_ImpLeaders_VoterList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.LeadersListArray = res.data1;
        this.LeadersTotal = res.data2[0].TotalCount;
      } else {
        this.LeadersListArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintionLeaders(pageNo: any) {
    this.LeadersPaginationNo = pageNo;
    this.getLeadersList();
  }

  onKeyUpFilterLeaders() {
    this.subjectLeaders.next();
  }

  searchLeadersFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchLeaders.value == "" || this.searchLeaders == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subjectLeaders
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchLeaders.value;
        this.LeadersPaginationNo = 1;
        this.getLeadersList();
      }
      );
  }

  // ------------------------------------------  Leaders filter End here  ------------------------------------------//


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
    } else if (flag == 'clearFiltersExpired') {
      this.searchExpired.setValue('');
      this.getExpiredList();
    } else if (flag == 'clearFiltersLeaders') {
      this.searchLeaders.setValue('');
      this.getLeadersList();
    }

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
      MobileNo: ['', [Validators.required, Validators.pattern('[6-9]\\d{9}')]],
      IsMemberAddAllow: [''],
      CreatedBy: ['']
    })
  }

  get f() { return this.assignAgentForm.controls };

  // Accept Only Integer Value Not Charector Accept

  Vali_AcceptOnlyNumber(event: any) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

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


  //  ------------------------------------------   Add Agent modal function's end here  ------------------------------------------- //



  redirectToAgentDetails(agentList: any) {
    window.open('../agents-activity/' + agentList.ClientId + '.' + agentList.BoothAgentId + '.' + agentList.Addedby + '.' + agentList.SubUserTypeId);
  }
  //  ------------------------------------------   Add Agent modal function's end here  ------------------------------------------- //

  redirectToVoterPrfile(obj: any) {
    window.open('../voters-profile/' + obj.AgentId + '.' + obj.ClientID + '.' + obj.VoterId);
  }
  // ------------------------------------------ Booth details ------------------------------ -------------------- //

  openDialogVoterCallEntries(obj: any) {
    const dialogRef = this.dialog.open(VoterCallEntriesComponent, {
      data: obj,
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

  // ..................................   redirected Booth Analytics Code Start Here  ...........................//

  boothAnalyticsRedData() {
    if (this.BoothAnalyticsObj.flag == 1) {
      this.getElectionName();
    }
  }

  // ..................................   redirected Booth Analytics Code End Here  ...........................//

  // ..................................   Download Excel VoterList Code Start Here  ...........................//

  getVoterListDownloadExcel() {

    let formDataTopFilter = this.filterForm.value;
    let villageId: any;
    formDataTopFilter.village == null || formDataTopFilter.village == undefined || formDataTopFilter.village == '' ? villageId = 0 : villageId = formDataTopFilter.village;
    let obj: any = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + formDataTopFilter.ClientId + '&ElectionId=' + formDataTopFilter.ElectionId +
      '&ConstituencyId=' + formDataTopFilter.ConstituencyId + '&AssemblyId=' + 0 + '+&IsSubElectionApplicable=' +
      this.IsSubElectionApplicable + '&BoothId=' + formDataTopFilter.getBoothId + '&VillageId=' + villageId;

    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Client_VoterDetails_Download_1_0?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.VoterListDownloadExcel = res.data1;
        this.downloadExcel();
      } else {
        this.toastrService.error("No Data Found");
        this.VoterListDownloadExcel = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  
  onSelectionObj(event:any,flag:any){ // Top Filter selection Value Name Get
    if(flag == 'client'){
      this.topClientName = event[0]?.data.Fullname;
    } else if(flag == 'election'){
      this.topElectionName = event[0]?.data.ElectionName;
    } else if(flag == 'constituency'){
      this.topConstituencyName = event[0]?.data.ConstituencyName;
    }
  }

  downloadExcel() {
    let keyValue = this.VoterListDownloadExcel.map((value: any) => Object.keys(value));
    let keyData = keyValue[0]; // key Name

    let ValueData = this.VoterListDownloadExcel.reduce(
      (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)],
      []
    );// Value Name

    let TopHeadingData = { ClientName:this.topClientName, ElectionName:this.topElectionName,
      ConstituencyName:this.topConstituencyName, BoothName:this.showBoothName,
      PageName:'VoterList',headingName:'VoterList Data'}

    this.excelService.generateExcel(keyData, ValueData, TopHeadingData);
  }



  // ..................................  Download Excel VoterList Code End Here  ...........................//

}