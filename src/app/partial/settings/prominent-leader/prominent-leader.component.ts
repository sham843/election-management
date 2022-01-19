import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DeleteComponent } from '../../dialogs/delete/delete.component';

@Component({
  selector: 'app-prominent-leader',
  templateUrl: './prominent-leader.component.html',
  styleUrls: ['./prominent-leader.component.css']
})
export class ProminentLeaderComponent implements OnInit {

  prominentLeaderForm!: FormGroup;
  constituencyNameArray: any;
  electionNameArray: any;
  selectPartyArray = [{ id: 1, PartyName: "Nationalist Congress Party" }, { id: 2, PartyName: "Shivsena" },
  { id: 3, PartyName: "Bharatiya Janata Party" }, { id: 4, PartyName: "Indian National Congress" },{ id: 5, PartyName: "Other" }];
  submitted: boolean = false;
  btnText = 'Submit';
  prominentLeaderArray: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  total: any;
  HighlightRow: any;
  // ProminentLeaderObj: any;

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
    this.defaultProminentLeaderForm();
    this.getElection();
    this.getProminentLeader();
  }

  defaultProminentLeaderForm() {
    this.prominentLeaderForm = this.fb.group({
      Id: [0],
      LeaderName: ['',Validators.required],
      MobileNo: ['', [Validators.required, Validators.pattern('[6-9]\\d{9}')]],
      PartyId: ['',Validators.required],
      ElectionId: ['', Validators.required],
      ConstituencyId: ['', [Validators.required]],
    })
  }

  get f() { return this.prominentLeaderForm.controls };

  clearForm() {
    this.submitted = false;
    this.btnText = 'Submit'
    this.defaultProminentLeaderForm();
  }

  getElection() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetElection?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.electionNameArray = res.data1;
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

  getConstituency() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Election_Get_ConstituencyName?UserId=' + this.commonService.loggedInUserId() 
    + '&ElectionId=' + this.prominentLeaderForm.value.ElectionId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.constituencyNameArray = res.data1;
        // if (this.btnText == 'Update') {
        //   this.prominentLeaderForm.patchValue({ ConstituencyId: this.ProminentLeaderObj.ConstituencyId });
        // }
      } else {
        this.spinner.hide();
        this.constituencyNameArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  acceptedOnlyNumbers(event: any) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  // .............. Get prominent Leader Api.....................//

  getProminentLeader() {
    this.spinner.show();
    let obj = '&ClientId=' + 0 + '&nopage=' + this.paginationNo + '&Search=' + '';
    this.callAPIService.setHttp('get', 'Web_Get_tblprominentleader?UserId=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.prominentLeaderArray = res.data1;
        this.total = res.data2[0].TotalCount;
      } else {
        this.spinner.hide();
        this.prominentLeaderArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }


  onSubmit() {
    this.spinner.show();
    this.submitted = true;
    if (this.prominentLeaderForm.invalid) {
      this.spinner.hide();
      return;
    }
    else {
      let formData = this.prominentLeaderForm.value;
      let id;
      formData.Id == "" || formData.Id == null ? id = 0 : id = formData.Id;
      let obj = id + '&LeaderName=' + formData.LeaderName + '&MobileNo=' + formData.MobileNo + '&PartyId=' + formData.PartyId +
        '&ElectionId=' + formData.ElectionId + '&ConstituencyId=' + formData.ConstituencyId
        + '&ClientId='+ 0 + '&CreatedBy=' + this.commonService.loggedInUserId();
      this.callAPIService.setHttp('get', 'Web_Insert_tblprominentleader?Id=' + obj, false, false, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.toastrService.success(res.data1[0].Msg);
          this.spinner.hide();
          this.submitted = false;
          this.btnText = 'Submit';
          this.getProminentLeader();
          this.clearForm(); 
        } else {
        }
      }, (error: any) => {
        if (error.status == 500) {
          this.router.navigate(['../500'], { relativeTo: this.route });
        }
      })
    }
  }

  patchProminentLeaderData(obj:any) {
    this.HighlightRow = obj.SrNo;
    this.btnText = 'Update';
    // this.ProminentLeaderObj = obj;
    this.prominentLeaderForm.patchValue({
      Id: obj.ProminentleaderId,
      LeaderName: obj.LeaderName,
      MobileNo: obj.MobileNo,
      PartyId: obj.PartyId,
      ElectionId: obj.ElectionId,
      ConstituencyId:obj.ConstituencyId,
      ClientId: obj.ClientId,
      CreatedBy: obj.CreatedBy
    })
    this.getConstituency();
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getProminentLeader();
  }
  
  clearFilterData(){
    this.prominentLeaderForm.controls['ConstituencyId'].setValue('');
  }

}
