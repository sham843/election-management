import { Component, OnInit} from '@angular/core';
import { FormBuilder,FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-add-supervisor',
  templateUrl: './add-supervisor.component.html',
  styleUrls: ['./add-supervisor.component.css']
})
export class AddSupervisorComponent implements OnInit {

  callCenterUserForm!: FormGroup | any;
  submitted: boolean = false;
  callCenterUserArray:any;
  clientNameArray:any;
  electionNameArray:any;
  GenderArray = [{ id: 1, name: "Male" }, { id: 2, name: "Female" }];
  checkedBoothFlag: boolean = true;
  boothSelectedArray:any[] = [];
  submitedBoothSelectedArray:any[] = [];
  constituencyNameArray: any;
  clientWiseBoothListArray: any;
  IsSubElectionApplicable: any; 
  getTotal: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  HighlightRow:any;

  searchBoothListData = '';
  clientName: any;
  electionName: any;
  constituencyName: any;
  btnText = 'Submit';

  filterForm!: FormGroup | any;
  modalTextChange :any;
  callCenterUserObj:any;

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private toastrService: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.defaultForm();
    this.defaultFilterForm();
    this.getClientName();
    this.getCallCenterUser();
  }

  //............................................ Filter Code Start Here...................................//

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      ClientId: [0],
      ElectionId: [0],
      ConstituencyId: [0],
      BoothId: [0],
    })
  }

  clearFilter(flag:any){
    if(flag == 'client'){
      this.callCenterUserForm.controls['ElectionId'].setValue(0);
      this.callCenterUserForm.controls['ConstituencyId'].setValue(0);
      this.callCenterUserForm.controls['BoothId'].setValue(0);
    } else if(flag == 'election'){
      this.callCenterUserForm.controls['ConstituencyId'].setValue(0);
      this.callCenterUserForm.controls['BoothId'].setValue(0);
    } else if(flag == 'constituency'){
      this.callCenterUserForm.controls['BoothId'].setValue(0);
    }
  }

  // get filter() { return this.filterForm?.controls };

  //............................................ Filter Code End Here...................................//


  defaultForm() {
    this.callCenterUserForm = this.fb.group({
      id: [0],
      mobileNo: ['', [Validators.required,Validators.pattern('[6-9]\\d{9}')]],
      fName: ['', [Validators.required,Validators.pattern(/^\S*$/)]],
      mName: ['',Validators.pattern(/^\S*$/)],
      lName: ['', [Validators.required,Validators.pattern(/^\S*$/)]],
      gender: ['', Validators.required],
      clientId: ['', Validators.required],
      electionId: [''],
      constituencyId: [''],
      boothId: ['']
    })
  }

  getClientName() {
    this.callAPIService.setHttp('get', 'Filter/GetClientMaster?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.clientNameArray = res.responseData;
        this.clientNameArray.length == 1 ? (this.callCenterUserForm.patchValue({ clientId: this.clientNameArray[0].clientId }), this.getElectionName()) : '';
     } else {
        this.clientNameArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getElectionName() {  
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.callCenterUserForm.value.clientId;
    this.callAPIService.setHttp('get', 'Filter/GetElectionMaster?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.electionNameArray = res.responseData;
        this.electionNameArray.length == 1 ? (this.callCenterUserForm.patchValue({ electionId: this.electionNameArray[0].electionId }), (this.IsSubElectionApplicable = this.electionNameArray[0].isSubElectionApplicable), this.getConstituencyName()) : '';
      } else {
        this.electionNameArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getConstituencyName() {     
    this.callAPIService.setHttp('get', 'Filter/GetConstituencyMaster?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.callCenterUserForm.value.clientId +
     '&ElectionId=' + this.callCenterUserForm.value.electionId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.constituencyNameArray = res.responseData;
        this.constituencyNameArray.length == 1 ? ((this.callCenterUserForm.patchValue({ constituencyId: this.constituencyNameArray[0].constituencyId })),this.ClientWiseBoothList()) : '';
      } else {
        this.constituencyNameArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  ClientWiseBoothList() {
    let formData = this.callCenterUserForm.value;
    let obj = 'ClientId=' + formData.clientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' 
    + formData.electionId + '&ConstituencyId=' + formData.constituencyId + '&VillageId=' + 0
    this.callAPIService.setHttp('get', 'Filter/GetBoothDetailsMater?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.clientWiseBoothListArray = res.responseData;
      } else {
        this.clientWiseBoothListArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getCallCenterUser() {
    this.spinner.show();
    let obj = 'ClientId=' + this.commonService.getlocalStorageData().ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + 0
    + '&ConstituencyId=' + 0 + '&BoothId=' + 0 + '&Search=' + '' + '&pageno=' + this.paginationNo + '&pagesize=' + this.pageSize
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/VoterCRM/GetCallCenterUser?' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.callCenterUserArray = res.responseData.responseData1;
        this.getTotal = res.responseData.responseData2.totalPages * this.pageSize;
      } else {
        this.callCenterUserArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  get f() { return this.callCenterUserForm.controls };

  onSubmitForm() { 
    this.submitted = true;
   if (this.callCenterUserForm.invalid) {
     this.spinner.hide();
     return;
   }else{
     this.spinner.show();
     let formData = this.callCenterUserForm.value;
     let fullName = formData.fName +' '+ formData.mName +' '+ formData.lName;
     this.submitedBoothSelectedArray.forEach((ele:any) => { delete ele.myObject; });
     let obj = {
      "id": 0,
      "fullName": fullName,
      "mobileNo": formData.mobileNo,
      "fName": formData.fName,
      "mName": formData.mName,
      "lName": formData.lName,
      "gender": formData.gender,
      "clientId": parseInt(formData.clientId),
      "createdBy": this.commonService.loggedInUserId(),
      "subUserTypeId": 6,
      "assignedBoothlist": this.submitedBoothSelectedArray
    }

     this.callAPIService.setHttp('POST', 'ClientMasterWebApi/VoterCRM/CreateCallCenterUser', false, obj, false, 'electionMicroSerApp');
     this.callAPIService.getHttp().subscribe((res: any) => {
       if (res.responseData != null && res.statusCode == "200") {
         this.spinner.hide();
         this.toastrService.success(res.responseData.msg);
         this.getCallCenterUser();
         this.clearForm();
         this.submitted = false;
       } else {
         this.spinner.hide();
         this.toastrService.error(res.statusMessage);
       }
     }, (error: any) => {
       this.spinner.hide();
       this.router.navigate(['../500'], { relativeTo: this.route });
     })
   }
 }

 editCallCenterUserData(obj:any){
  this.btnText = "Update";
  this.submitedBoothSelectedArray = [];
  this.callCenterUserForm.patchValue({
    id: obj?.userId,
    mobileNo: obj?.mobileNo,
    fName: obj?.fName,
    mName: obj?.mName,
    lName: obj?.lName,
    gender: obj?.gender,
    clientId: obj?.clientId.toString(),
  })
  obj?.clientId ? this.getElectionName() : '';
  obj?.assignedBoothlist.map((ele:any)=>{
    let bindobj = {
      "assemblyId": ele.assemblyId,
      "boothId": ele.boothId,
      "constituencyId": ele.constituencyId,
      "electionId": ele.electionId,
      "myObject" : {
        "clientName": obj?.clientName,
        "electionName": ele.electionName,
        "constituencyName": ele.constituencyName,
        "boothsName": ele.boothName,
      }
    }
    this.submitedBoothSelectedArray.push(bindobj);
  })
  this.boothSelectedArray = JSON.parse(JSON.stringify(this.submitedBoothSelectedArray));

 }

 clearForm() {
  this.defaultForm();
  this.btnText = "submit";
  this.submitted = false;
  this.submitedBoothSelectedArray = [];
  this.boothSelectedArray = [];
  this.clientWiseBoothListArray = [];
}

onClickPagintion(pageNo: number) {
  this.paginationNo = pageNo;
  this.getCallCenterUser();
  this.clearForm();
}

clearDropdownData(flag: any) {
  if(flag == 'clientId'){
    this.callCenterUserForm.controls['electionId'].setValue('');
    this.callCenterUserForm.controls['constituencyId'].setValue('');
    this.clientWiseBoothListArray = [];
    this.submitedBoothSelectedArray = [];
    this.boothSelectedArray = [];
  } else if(flag == 'electionId'){
    this.callCenterUserForm.controls['constituencyId'].setValue('');
    this.clientWiseBoothListArray = [];
  } else if(flag == 'constituencyId'){
    this.clientWiseBoothListArray = [];
  }
}

addBoothsData(){
  let formData = this.callCenterUserForm.value;
  if(formData.electionId != '' && formData.constituencyId != '' && this.boothSelectedArray.length != 0){
    this.submitedBoothSelectedArray = JSON.parse(JSON.stringify(this.boothSelectedArray));
    this.callCenterUserForm.controls['electionId'].setValue('');
    this.callCenterUserForm.controls['constituencyId'].setValue('');
    this.clientWiseBoothListArray = [];
  }else{
    this.toastrService.error('please select Booths');
  }
}

deleteBooth(index:any){
  this.submitedBoothSelectedArray.splice(index, 1);
  this.boothSelectedArray = JSON.parse(JSON.stringify(this.submitedBoothSelectedArray));
}

//.......................................  Booth CheckBox Code Start Here .................................//

getNameByObj(event: any, flag: any) { // dropdown selection Value Name Get
  if (flag == 'client') {
    this.clientName = event[0]?.data.clientName;
  } else if (flag == 'election') {
    this.electionName = event[0]?.data.electionName;
  } else if (flag == 'constituency') {
    this.constituencyName = event[0]?.data.constituencyName;
  }
}

onCheckedBoothChanges(event: any, eleObj: any) {
  let obj = {
    "assemblyId": eleObj?.assemblyId,
    "boothId": eleObj?.boothId,
    "constituencyId": this.callCenterUserForm.value.constituencyId,
    "electionId": this.callCenterUserForm.value.electionId,
    "myObject" : {
      "clientName": this.clientName,
      "electionName": this.electionName,
      "constituencyName": this.constituencyName,
      "boothsName": eleObj?.boothNickName,
    }
  }
  if (event.target.checked == true) {
    this.checkUniqueData(obj, eleObj?.boothId);
  } else { //delete record when event False
    this.boothSelectedArray.splice(this.boothSelectedArray.findIndex((ele: any) => ele.boothId === eleObj?.boothId), 1);
  }
}

checkUniqueData(obj: any, BoothId: any) { //Check Unique Data then Insert or Update
  this.checkedBoothFlag = true;
  if (this.boothSelectedArray.length <= 0) {
    // obj['checked'] = true;
    this.boothSelectedArray.push(obj);
    this.checkedBoothFlag = false;
  } else {
    this.boothSelectedArray.map((ele: any, index: any) => {
      if (ele.boothId == BoothId) {
        this.boothSelectedArray[index] = obj;
        this.checkedBoothFlag = false;
      }
    })
  }
  this.checkedBoothFlag && this.boothSelectedArray.length >= 1 ? this.boothSelectedArray.push(obj) : '';
}

//.......................................  Booth CheckBox Code End Here .................................//

//.......................................  Block User Code Start Here .................................//

blockUser(obj:any){
  let checkBlogStatus :any;
  obj?.IsUserblock == 0  ? checkBlogStatus = 1 : checkBlogStatus = 0;
  this.callAPIService.setHttp('get', 'Web_Insert_Election_BlockBoothAgent?UserId='+ obj?.UserId +'&ClientId='+ obj?.ClientId 
  + '&CreatedBy=' + this.commonService.loggedInUserId()+'&IsBlock='+checkBlogStatus, false, false, false, 'electionServiceForWeb');
  this.callAPIService.getHttp().subscribe((res: any) => {
    if (res.data == 0) {
      this.toastrService.success(res.data1[0].Msg);
      this.getCallCenterUser();
    } else {
    }
  }, (error: any) => {
    if (error.status == 500) {
      this.router.navigate(['../500'], { relativeTo: this.route });
    }
  })
}

//.......................................  Block User Code End Here .................................//


}
