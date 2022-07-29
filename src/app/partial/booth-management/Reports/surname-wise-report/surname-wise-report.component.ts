import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DateTimeAdapter } from 'ng-pick-datetime';

@Component({
  selector: 'app-surname-wise-report',
  templateUrl: './surname-wise-report.component.html',
  styleUrls: ['./surname-wise-report.component.css']
})
export class SurnameWiseReportComponent implements OnInit {

  clientNameArray: any;
  filterForm!: FormGroup;
  electionNameArray: any;
  constituencyNameArray: any;
  clientWiseBoothListArray: any;
  villageDropdown: any;
  BoothAnalyticsObj = {
    ClientId: 0, ElectionId: 0, ConstituencyId: 0,
    VillageId: 0, BoothId: 0, flag: 0
  }
  dataNotFound: boolean = false;
  surNamewiseCountArray: any;

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
  ) { 
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
    this.defaultMainFilterForm();
    this.getClientName();
  }

  defaultMainFilterForm() {
    this.filterForm = this.fb.group({
      ClientId: [this.BoothAnalyticsObj.ClientId || 0],
      ElectionId: [this.BoothAnalyticsObj.ElectionId || 0],
      ConstituencyId: [this.BoothAnalyticsObj.ConstituencyId || 0],
      village: [this.BoothAnalyticsObj.VillageId || 0],
      getBoothId: [this.BoothAnalyticsObj.BoothId || 0],
    })
  }

  getClientName() {
    this.nullishFilterForm(); 
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetClientMaster?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.clientNameArray = res.responseData;
        this.clientNameArray.length == 1 ? (this.filterForm.patchValue({ ClientId: this.clientNameArray[0].clientId }), this.getElectionName()) : '';
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getElectionName() {
    this.nullishFilterForm();     
    this.spinner.show();
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId;
    this.callAPIService.setHttp('get', 'Filter/GetElectionMaster?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.electionNameArray = res.responseData;
        this.electionNameArray.length == 1 ? (this.filterForm.patchValue({ ElectionId: this.electionNameArray[0].electionId }), this.getConstituencyName()) : '';

        if (this.electionNameArray.length > 1 && this.BoothAnalyticsObj.flag == 1) {
          this.getConstituencyName();
        }
      } else {
        this.spinner.hide();
        this.electionNameArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getConstituencyName() {
    this.nullishFilterForm();      
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetConstituencyMaster?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.constituencyNameArray = res.responseData;
        this.constituencyNameArray.length == 1 ? ((this.filterForm.patchValue({ ConstituencyId: this.constituencyNameArray[0].constituencyId })), this.dataNotFound = true, this.getVillageData()) : '';
      } else {
        this.constituencyNameArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getVillageData() {
    this.getSurNamewiseCounts(); // when Select ConstituencyName then Call 
    // this.boothWiseSummaryCount(); // when Select ConstituencyName then Call 
    this.nullishFilterForm();
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetVillageMasters?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.villageDropdown = res.responseData;
      } else {
        this.villageDropdown = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  ClientWiseBoothList() {
    this.nullishFilterForm();
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&VillageId=' + this.filterForm.value.village
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetBoothDetailsMater?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.clientWiseBoothListArray = res.responseData;
      } else {
        this.clientWiseBoothListArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  clearTopFilter(flag: any) {
    if (flag == 'clientId') {
      this.filterForm.patchValue({
        ClientId: this.filterForm.value.ClientId,
        ElectionId: 0,
        ConstituencyId: 0,
        village: 0,
        getBoothId: 0
      });
      this.dataNotFound = false;
    } else if (flag == 'electionId') {
      this.filterForm.patchValue({
        ClientId: this.filterForm.value.ClientId,
        ElectionId: 0,
        ConstituencyId: 0,
        village: 0,
        getBoothId: 0
      });
      this.dataNotFound = false;
    } else if (flag == 'constituencyId') {
      this.filterForm.patchValue({
        ClientId: this.filterForm.value.ClientId,
        ElectionId: this.filterForm.value.ElectionId,
        ConstituencyId: 0,
        village: 0,
        getBoothId: 0
      });
      this.dataNotFound = false;
    } else if (flag == 'village') {
      this.filterForm.patchValue({
        ClientId: this.filterForm.value.ClientId,
        ElectionId: this.filterForm.value.ElectionId,
        ConstituencyId: this.filterForm.value.ConstituencyId,
        village: 0,
        getBoothId: 0
      });
      this.ClientWiseBoothList();
    } else if (flag == 'boothId') {
      this.filterForm.patchValue({
        ClientId: this.filterForm.value.ClientId,
        ElectionId: this.filterForm.value.ElectionId,
        ConstituencyId: this.filterForm.value.ConstituencyId,
        // village: 0,
      });
    }
  }


  nullishFilterForm() { //Check all value null || undefind || empty 
    let fromData = this.filterForm.value;
    fromData.ClientId ?? this.filterForm.controls['ClientId'].setValue(0);
    fromData.ElectionId ?? this.filterForm.controls['ElectionId'].setValue(0);
    fromData.ConstituencyId ?? this.filterForm.controls['ConstituencyId'].setValue(0);
    fromData.village ?? this.filterForm.controls['village'].setValue(0);
    fromData.getBoothId ?? this.filterForm.controls['getBoothId'].setValue(0);
  }

  getSurNamewiseCounts() {
    this.nullishFilterForm(); 
    this.spinner.show(); 
    let obj = this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&VillageId=' + this.filterForm.value.village + '&BoothId=' + this.filterForm.value.getBoothId
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetDashbord-GetSurNamewiseCounts?UserId=' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.surNamewiseCountArray = res.responseData;
       } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

}
