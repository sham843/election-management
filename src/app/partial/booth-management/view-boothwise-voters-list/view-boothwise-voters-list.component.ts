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
  boothVoterListArray:any;
  HighlightRow:any = 0;
  globalboothVoterData:any;
  searchVoters = new FormControl();

  votersPaginationNo = 1;
  votersPageSize : number = 10;
  votersTotal : any;

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
    this.searchFilter('false');
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
        debugger;
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
    debugger;
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
      this.boothVoterList(data);
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  // ------------------------------------------ vooter list with filter start here  ------------------------------------------//

  boothVoterList(data:any) {
    this.globalboothVoterData = data;
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&BoothId=' + this.globalboothVoterData.BoothId +
    '&AssemblyId='+this.globalboothVoterData.AssemblyId+'&flag='+this.voterListFlag+'&Search=&nopage='+this.votersPaginationNo;

    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_BoothVoterList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.boothVoterListArray = res.data1;
        this.votersTotal = res.data2[0].TotalCount;
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

  onClickPagintionVoters(pageNo:any){
    this.votersPaginationNo = pageNo;
    this.boothVoterList(this.globalboothVoterData);
  }

  onKeyUpFilterVoters(){

  }

  // ------------------------------------------  vooter list with filter end here ------------------------------------------//


   // ------------------------------------------  global uses start here   ------------------------------------------//
  clearFiltersBooth(flag:any){
    if(flag == 'clearSearchVoters'){

    }
  }

  getIsSubEleAppId(eleId:any){
    debugger;
    this.electionNameArray.filter((item:any)=>{
      if(item.ElectionId == eleId){
        this.IsSubElectionApplicable = item.IsSubElectionApplicable;
      }
    })
  }

    // ------------------------------------------  global uses end here   ------------------------------------------//

  // ------------------------------------------ Booth details ------------------------------ -------------------- //
}
