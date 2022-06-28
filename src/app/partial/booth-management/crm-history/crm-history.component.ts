import { Component, Inject, OnInit, ViewChild,NgZone, ElementRef} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DatePipe } from '@angular/common';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MapsAPILoader,MouseEvent } from '@agm/core';
import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';
declare var google: any;

@Component({
  selector: 'app-crm-history',
  templateUrl: './crm-history.component.html',
  styleUrls: ['./crm-history.component.css']
})
export class CrmHistoryComponent implements OnInit {

  getFeedbacksList: any;
  getFeedbacksListTotal: any;
  feedbacksPaginationNo: number = 1;
  feedBackPageSize: number = 10;

  feedbackTypeArray = [{ id: 1, name: 'Positive' }, { id: 2, name: 'Negitive' }, { id: 3, name: 'Neutral' }]
  enterNewFeedbackForm!: FormGroup;
  submitted: boolean = false;
  voterListData: any;
  voterProfileData: any;
  voterProfileFamilyData: any;
  VPCommentData: any;
  posNegativeInfData: any;
  max = new Date();

  voterProfileForm!: FormGroup | any;
  submittedVP: boolean = false;
  nameCorrectionDivHide: boolean = false;
  disableDiv: boolean = true;
  prominentleaderArray:any;  
  VoterCastListArray:any;
  religionListArray:any;
  politicalPartyArray:any;

  voterListforFamilyChildArray:any;
  searchFamilyChield = new FormControl('');
  subjectSearchFamilyC: Subject<any> = new Subject();

  ratingStarArray = [{ id: 1, name: '1.0' }, { id: 2, name: '2.0' }, { id: 3, name: '3.0' }, { id: 4, name: '4.0' }, { id: 5, name: '5.0' }];
  headCheckArray = ['yes','no'];
  leaderCheckArray = ['yes','no'];
  migratedCheckArray = ['yes','no'];
  headhideDiv:boolean = false;  
  leaderhideDiv:boolean = false;
  migratedhideDiv:boolean = false;
  postalVotingDivHide:boolean = false;
  needSupportDivHide:boolean = false;
  dairyFarmerArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];
  goatSheepFarmerArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];
  sugarCaneCutterArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];
  yuvakArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];
  farmerArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];
  businessArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];
  vehicleArray = [{ id: 1, name: 'Bike' }, { id: 2, name: 'Family Car' }, { id: 3, name: 'None' }];
  financialConditionArray = [{ id: 1, name: 'Low' }, { id: 2, name: 'Middle' }, { id: 3, name: 'High' }];
  bloodGroupArray = [{ id: 0, name: 'A+' }, { id: 1, name: 'A-' }, { id: 2, name: 'B+' },{ id: 3, name: 'B-' },
     { id: 4, name: 'O+' }, { id: 5, name: 'O-' }, { id: 6, name: 'AB+' }, { id: 7, name: 'AB-' }];
  childVoterDetailArray: any[] = [];
  checkedchildVoterflag: boolean = true;
  @ViewChild('familyMemberModel') familyMemberModel: any;
  isNameCorrectionId:any;

  latitude = 19.663280;
  longitude = 75.300293;
  cityName: any;
  addressName:any;
  geocoder: any;
  @ViewChild('search') public searchElementRef!: ElementRef;
  searchAdd = new FormControl('');

  familyHeadVoterId:any;
  familyHeadName:any;
  HighlightRow: any;
  isExpiredVoter = new FormControl('');

  padvidharArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];
  userFilter: any = { name: '' };


  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public commonService: CommonService,
    private toastrService: ToastrService,
    public dateTimeAdapter: DateTimeAdapter<any>,
    private datePipe: DatePipe,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
  ) {
    dateTimeAdapter.setLocale('en-IN');

    let getUrlData: any = this.route.snapshot.params.id;
    if (getUrlData) {
      getUrlData = getUrlData.split('.');
      this.voterListData = { 'AgentId': +getUrlData[0], 'ClientId': +getUrlData[1], 'VoterId': +getUrlData[2] 
      , 'ElectionId': +getUrlData[3], 'ConstituencyId': +getUrlData[4]}
    }
  }

  ngOnInit(): void {
    this.defaultFeedbackForm();
    this.defaultvoterProfileForm();
    this.feedbacksList();
    this.getVoterProfileData();
    this.getVPPoliticalInfluenceData();
    this.getVoterprofileFamilyData();
    this.getProminentleader();
    this.getReligionList();
    // this.getVoterCastList();
    this.getPoliticalPartyList();
    this.searchFamilyChieldFilters('false');
    this.searchAddress();
  }

  defaultFeedbackForm() {
    this.enterNewFeedbackForm = this.fb.group({
      Id: [0],
      FeedBackType: ['', Validators.required],
      Description: [''],
      FollowupDate: ['', Validators.required],
      NotToCall: [0],
    })
  }

  get f() { return this.enterNewFeedbackForm.controls };

  //............................. Get Feedbacks List................................//

  feedbacksList() {
    this.spinner.show();    
    let obj = 'ClientId=' + this.voterListData.ClientId + '&VoterId=' + this.voterListData.VoterId 
    + '&UserId=' + this.commonService.loggedInUserId() + '&pageno=' + this.feedbacksPaginationNo + '&pagesize=' + this.feedBackPageSize
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/VoterCRM/GetVoterFeedbackCRM?' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.getFeedbacksList = res.responseData.responseData1;
        this.getFeedbacksListTotal = res.responseData.responseData2.totalPages * this.feedBackPageSize;
      } else {
        this.spinner.hide();
        this.getFeedbacksList = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //............................. Insert Feedbacks Election Data................................//

  onSubmitFeedbackForm() {
    this.submitted = true;
    if (this.enterNewFeedbackForm.invalid) {
      this.spinner.hide();
      return;
    } else {
      this.spinner.show();
      let data = this.enterNewFeedbackForm.value;
      data.NotToCall == true ? data.NotToCall = 1 : data.NotToCall = 0;

    let obj = {
        "id": data.Id,
        "voterId": this.voterListData.VoterId ,
        "feedBackDate": new Date(),
        "feedBackType": data.FeedBackType,
        "description": data.Description,
        "followupDate": data.FollowupDate,
        "notToCall": data.NotToCall,
        "createdBy": this.commonService.loggedInUserId(),
        "clientId": this.voterListData.ClientId
      }

      this.callAPIService.setHttp('POST', 'ClientMasterWebApi/VoterCRM/InsertVoterFeedback', false, obj, false, 'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {
          this.spinner.hide();
          this.toastrService.success(res.statusMessage);
          this.feedbacksList();
          this.clearForm();
          this.submitted = false;
        } else {
          this.spinner.hide();
        }
      }, (error: any) => {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      })
    }
  }

  //........................ Get Voter Profile Data.....................//

  getVoterProfileData(data?:any) {
    let voterId;
    data ? voterId = data?.voterId : voterId = this.voterListData.VoterId;
    this.spinner.show();
    let obj = 'ClientId=' + this.voterListData.ClientId +
      '&AgentId=' + this.voterListData.AgentId + '&VoterId=' + voterId ;
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/VoterCRM/GetVoterProfileCRM?' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.voterProfileData = res.responseData;
        // this.voterProfileData?.head == 'yes' ? this.familyHeadName = this.voterProfileData?.marathiName : '';
        this.editVoterProfileData(this.voterProfileData);
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //............. get get Voterprofile Family Data ...............//    

  getVoterprofileFamilyData() {
    this.spinner.show();
    let obj = 'ClientId=' + this.voterListData.ClientId + 
    '&AgentId='+ this.voterListData.AgentId + '&VoterId='+ this.voterListData.VoterId 
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/VoterCRM/GetVoterFamilyMemberCRM?' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.voterProfileFamilyData = res.responseData;
        this.voterProfileFamilyData.map((ele:any)=>{ //get FamilyHead Name & VoterId 
          if(ele.familyHead == 1){
            this.familyHeadName = ele.family;   
            this.familyHeadVoterId = ele.voterId;
          }
        })
      } else {
        this.voterProfileFamilyData = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  // data1: get ostive Negative Influence & data2: get Comment Data  //

  getVPPoliticalInfluenceData() {
    this.spinner.show();
    let obj = 'ClientId=' + this.voterListData.ClientId + 
    '&AgentId='+ this.voterListData.AgentId + '&VoterId='+ this.voterListData.VoterId 
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/VoterCRM/GetVoterProfileCRMVoterComments?' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.VPCommentData = res.responseData.responseData1;
        this.posNegativeInfData = res.responseData.responseData2;
      } else {
        this.VPCommentData = [];
        this.posNegativeInfData = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  clearForm() {
    this.defaultFeedbackForm();
    this.submitted = false;
  }

  onClickPagintion(pageNo: number) {
    this.feedbacksPaginationNo = pageNo;
    this.feedbacksList();
  }

  voterDateRangeSelect(asd: any) {
  }

    //.......... get Political Party List ...............//
    getPoliticalPartyList() {
      this.callAPIService.setHttp('get', 'Filter/GetPartyDetails?ClientId=' + this.voterListData.ClientId + '&UserId='
        + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {
          this.politicalPartyArray = res.responseData;   
        } else {
          this.politicalPartyArray = [];
        }
      }, (error: any) => {
        this.router.navigate(['../500'], { relativeTo: this.route });
      })
    }

    //.......... get Religion List ...............//
  getReligionList() {
    this.callAPIService.setHttp('get', 'Filter/GetReligionDetails?ClientId=' + this.voterListData.ClientId + '&UserId='
      + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.religionListArray = res.responseData;  
      } else {
        this.religionListArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //.......... get Voter Cast List ...............//
  getVoterCastList(religionId:any) {
    this.callAPIService.setHttp('get', 'Filter/GetCastDetails?ClientId=' + this.voterListData.ClientId + '&UserId='
      + this.commonService.loggedInUserId() + '&ReligionId=' + religionId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.VoterCastListArray = res.responseData;
      } else {
        this.VoterCastListArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

   //.......... get Voter Prominentleader List ...............//
   getProminentleader() {
    this.callAPIService.setHttp('get', 'Filter/GetProminentleaderDetails?ClientId=' + this.voterListData.ClientId + '&UserId='
      + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.prominentleaderArray = res.responseData;
      } else {
        this.prominentleaderArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

     //.......... get Voter for Family Child List Code Start...............//

     getVoterListforFamilyChild() {  
      this.spinner.show();
      let obj = 'ClientId=' + this.voterListData.ClientId + '&UserId=' + this.commonService.loggedInUserId() +
      '&ElectionId=' + this.voterListData.ElectionId + '&ConstituencyId=' + this.voterListData.ConstituencyId + '&BoothId=' + this.voterProfileData.boothId  + '&Search=' +  this.searchFamilyChield.value.trim();
      this.callAPIService.setHttp('get', 'VoterCRM/GetVoterListforFamilyChild?' + obj , false, false, false, 'electionMicroServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {  
          this.spinner.hide();
          this.voterListforFamilyChildArray = res.responseData;
        } else {
          this.spinner.hide();
          this.voterListforFamilyChildArray = [];
        }
      }, (error: any) => {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      })
    }

    onKeyUpFilterFamilyChield() {
      this.subjectSearchFamilyC.next();
    }
  
    searchFamilyChieldFilters(flag: any) {
      this.subjectSearchFamilyC.pipe(debounceTime(700)).subscribe(() => {
        this.searchFamilyChield.value;
        this.getVoterListforFamilyChild();
      });
    }

    clearFilterFamilyChield(){
      this.searchFamilyChield.setValue('');
      this.getVoterListforFamilyChild();
    }

    createFamilyTree() {
      if (this.childVoterDetailArray.length == 0){
        this.toastrService.error('Please Select at Least One Record');
         return;
      }
      let obj = {
        "parentVoterId": this.familyHeadVoterId,
        "userId": this.voterListData?.AgentId > 0 ? this.voterListData?.AgentId : this.commonService.loggedInUserId(),
        "clientId": this.voterListData.ClientId,
        "childVoterDetails": this.childVoterDetailArray
      }
        this.callAPIService.setHttp('POST', 'ClientMasterWebApi/VoterCRM/CreateFamilyTree', false, obj, false, 'electionMicroSerApp');
        this.callAPIService.getHttp().subscribe((res: any) => {
          if (res.responseData != null && res.statusCode == "200") {
            this.spinner.hide();
            this.toastrService.success(res.statusMessage);
            this.familyMemberModel.nativeElement.click();
            this.getVoterprofileFamilyData();
            this.clearFamilyTree();
          } else {
            this.spinner.hide();
          }
        }, (error: any) => {
          this.spinner.hide();
          this.router.navigate(['../500'], { relativeTo: this.route });
        })
      }
      
  onCheckChangeChildVoterDetail(event: any, data: any) {
    let obj =  {
      "childVoterId": data.voterId,
      "voter_uid": data.voterId,
      "voter_no": data.voterNo
    }
    if (event.target.checked == true) {
      this.checkUniqueData(obj, data.voterId);
    } else { //delete record when event False
      this.childVoterDetailArray.splice(this.childVoterDetailArray.findIndex((ele: any) => ele.childVoterId === data.voterId), 1);
    }
  }

  checkUniqueData(obj: any, voterId: any) { //Check Unique Data then Insert or Update
    this.checkedchildVoterflag = true;
    if (this.childVoterDetailArray.length <= 0) {
      // obj['checked'] = true;
      this.childVoterDetailArray.push(obj);
      this.checkedchildVoterflag = false;
    } else {
      this.childVoterDetailArray.map((ele: any, index: any) => {
        if (ele.childVoterId == voterId) {
          this.childVoterDetailArray[index] = obj;
          this.checkedchildVoterflag = false;
        }
      })
    }
    this.checkedchildVoterflag && this.childVoterDetailArray.length >= 1 ? this.childVoterDetailArray.push(obj) : '';
  }

  clearFamilyTree(){
    this.childVoterDetailArray = [];
  }


    //.......... get Voter for Family Child List Code End...............//
    

                              //....... Voter Profile form code Start Here........//


  isExpiredCheckBox(event: any) {
    let flag = event.target.checked;
    flag == true ? this.disableDiv = true : this.disableDiv = false;
  }

  nameCorrectionCheckBox(event: any , flag:any) {
    let checkflag = (flag == 'noEdit' ? event.target.checked : event );
    checkflag == true ? this.nameCorrectionDivHide = true : this.nameCorrectionDivHide = false;
    this.isNameCorrectionId = checkflag == true ? 1 : 0 ;
  }

  familyHeadRadiobtn(){
    this.voterProfileForm.value.head == 'yes' ? this.headhideDiv = true : this.headhideDiv = false;
  }

  leaderRadiobtn(){
    this.voterProfileForm.value.leader == 'yes' ? this.leaderhideDiv = true : this.leaderhideDiv = false;
      if (this.voterProfileForm.value.leader == 'yes') {
        this.voterProfileForm.controls["leaderImportance"].setValidators([Validators.required]);
        this.voterProfileForm.controls["leaderImportance"].updateValueAndValidity();
      } else {
        this.voterProfileForm.controls['leaderImportance'].setValue('');
        this.voterProfileForm.controls['leaderImportance'].clearValidators();
        this.voterProfileForm.controls['leaderImportance'].updateValueAndValidity();
      }
  }

  migratedRadiobtn(){
    this.voterProfileForm.value.migrated == 'yes' ? this.migratedhideDiv = true : this.migratedhideDiv = false;
  }

  postalVotingCheckBox(event: any , flag:any) {
    let checkflag = (flag == 'noEdit' ? event.target.checked : event );
    checkflag == true ? this.postalVotingDivHide = true : this.postalVotingDivHide = false;
  }

  needSupportCheckBox(event: any , flag:any) {
    let checkflag = (flag == 'noEdit' ? event.target.checked : event );
    checkflag == true ? this.needSupportDivHide = true : this.needSupportDivHide = false;
  }


  get v() { return this.voterProfileForm.controls };

  defaultvoterProfileForm() {
    this.voterProfileForm = this.fb.group({

      Id: [''],
      mobileNo1: ['',[Validators.pattern('[6-9]\\d{9}')]],
      mobileNo2: ['',[Validators.pattern('[6-9]\\d{9}')]],
      email: ['',[Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      castId: [''],
      partyId: [''],
      religionId: [''],
      watsApp1: [''],
      watsApp2: [''],
      leader: [''],
      migratedArea: [''],
      head: [''],
      dateOfBirth: [''],
      comment: [''],
      voterMarking: [''],
      migratedCity: [''],
      latitude: [''],
      longitude: [''],
      nickName: [''],
      migrated: [''],
      area: [''],
      leaderImportance: [''],
      // migratedLatitude: [''],
      // migratedLongitude: [''],
      occupation: [''],
      isNameChange: [''],
      mfName: [''],
      mmName: [''],
      mlName: [''],
      efName: [''],
      emName: [''],
      elName: [''],
      qualification: [''],
      bloodgroup: [''],
      isNotCall: [''],
      isDairyFarmer: [''],
      isGoatSheepFarmer: [''],
      isSugarCaneCutter: [''],
      haveVehicle: [''],
      isFarmer: [''],
      haveBusiness: [''],
      isYuvak: [''],
      financialCondition: [''],
      isExpired: [''],
      prominentLeaderId: [''],
      needSupportFlag: [''],
      needSupportText: [''],
      postalFlag: [''],
      whyIsPostal: [''],
      isPadvidhar: [''],
    })
  }

  editFamilyMemberData(obj:any){
   this.getVoterProfileData(obj);
  }

  editVoterProfileData(data:any) {
    this.voterProfileForm.patchValue({  
      Id: this.voterProfileData.voterId,
      mobileNo1: data?.mobileNo1,
      mobileNo2: data?.mobileNo2,
      email:data.email,
      castId: data.castId,
      partyId: data.partyId,
      religionId: data.religionId,
      watsApp1: data.watsApp1 ? true : false,
      watsApp2: data.watsApp2 ? true : false,
      leader: data.leader,
      migratedArea: data.migratedArea,
      head: data.head,
      dateOfBirth: data.dateOfBirth,
      leaderImportance: data.leaderImportance,
      comment: data.comment,
      voterMarking: data.voterMarking,
      migratedCity: data.migratedCity,
      latitude: data.latitude,
      longitude: data.longitude,
      nickName: data.nickName,
      migrated: data.migrated,
      area: data.area,
      // migratedLatitude: data.migratedLatitude,
      // migratedLongitude: data.migratedLongitude,
      occupation: data.occupation,
      isNameChange: data.isNameChange,
      mfName: data?.mfName,
      mmName: data?.mmName,
      mlName: data?.mlName,
      efName: data.efName,
      emName: data.emName,
      elName: data.elName,
      qualification: data.qualification,
      bloodgroup: data.bloodgroup,
      isNotCall: data.isNotCall,
      isDairyFarmer: data.isDairyFarmer,
      isGoatSheepFarmer: data.isGoatSheepFarmer,
      isSugarCaneCutter: data.isSugarCaneCutter,
      haveVehicle: data.haveVehicle,
      isFarmer: data.isFarmer,
      haveBusiness: data.haveBusiness,
      isYuvak: data.isYuvak,
      financialCondition: data.financialCondition,
      isExpired: data.isExpired,
      prominentLeaderId: data.prominentLeaderId,
      needSupportFlag: data.needSupportFlag,
      needSupportText: data.needSupportText,
      postalFlag: data.postalFlag,
      whyIsPostal: data.whyIsPostal,
      isPadvidhar: data.isPadvidhar,
    })
    this.getVoterCastList(data.religionId);
    this.familyHeadRadiobtn();
    this.leaderRadiobtn();
    this.migratedRadiobtn();
    this.postalVotingCheckBox(data.postalFlag == 1 ? true : false , 'edit');
    this.needSupportCheckBox(data.needSupportFlag == 1 ? true : false ,'edit');
    this.nameCorrectionCheckBox(data.isNameChange == 1 ? true : false ,'edit');
    this.latitude = data.migratedLatitude;
    this.longitude = data.migratedLongitude;
  }

  onSubmitVoterProfile() {
    let formData = this.voterProfileForm.value;
    this.submittedVP = true;
    if (this.voterProfileForm.invalid) {
      this.spinner.hide();
      return;
    } else {

      let obj = {
        "serverId": this.voterProfileData.serverId,
        "voterId": this.voterProfileData.voterId,
        "mobileNo1": formData?.mobileNo1 || '',
        "mobileNo2": formData?.mobileNo2 || '',
        "landline": "string",
        "email": formData.email || '',
        "followers": "string",
        "castId": formData.castId || 0,
        "partyId": formData.partyId || 0, 
        "familysize": this.voterProfileData.familySize.toString(),
        "religionId": formData.religionId || 0,
        "partyAffection": "string",
        "leaderImportance": formData.leaderImportance || '',
        "watsApp1": formData.watsApp1 == true ? formData.mobileNo1 : (this.voterProfileData.watsApp1 && formData.watsApp1 == true ? this.voterProfileData.watsApp1 : ''),
        "watsApp2": formData.watsApp2 == true ? formData.mobileNo2 : (this.voterProfileData.watsApp2 && formData.watsApp2 == true ? this.voterProfileData.watsApp2 : ''),
        "facebookId": "string",
        "leader": formData.leader || '',
        "migratedArea": formData.migratedArea || '',
        "regionalLang1": "string",
        "regionalLang2": "string",
        "userId": this.voterListData?.AgentId > 0 ? this.voterListData?.AgentId : this.commonService.loggedInUserId(),
        "head": formData.head || '',
        "villageId": this.voterProfileData.villageId,
        "boothId": this.voterProfileData.boothId,
        "assemblyId": this.voterProfileData.assemblyId,
        "dateOfBirth": formData.dateOfBirth,
        "comment": formData.comment || "",
        "voterMarking": "string",
        "oppCandidateId": 0,
        "feedback": "string",
        "migratedCity": formData.migratedCity || '',
        "latitude": this.latitude,
        "longitude": this.longitude,
        "voterNo": this.voterProfileData.voterNo.toString(),
        "nickName":  formData.nickName || '',
        "clientId": this.voterProfileData.clientId,
        "migrated": formData.migrated || '', 
        "area": formData.area, 
        "migratedLatitude": this.latitude,
        "migratedLongitude": this.longitude,
        "surveyDate": "2022-06-23T10:32:04.461Z",
        "buildingID": 0,
        "needSupportFlag": formData.needSupportFlag == true ? 1 : 0,
        "needSupportText": formData.needSupportText || '',
        "postalFlag": formData.postalFlag == true ? 1 : 0,
        "occupation": formData.occupation || '',
        "isNameChange": this.isNameCorrectionId,
        "mfName": formData.mfName || "",
        "mmName": formData.mmName || "",
        "mlName": formData.mlName || "",
        "efName": formData.efName || "",
        "emName": formData.emName || "",
        "elName": formData.elName || "",
        "createdDate": new Date(),
        "qualification": formData.qualification || '',
        "bloodgroup": formData.bloodgroup || '',
        "isNotCall": formData.isNotCall == true ? 1 : 0,
        "isDairyFarmer": formData.isDairyFarmer,
        "isGoatSheepFarmer": formData.isGoatSheepFarmer,
        "isSugarCaneCutter": formData.isSugarCaneCutter,
        "haveVehicle": formData.haveVehicle,
        "isFarmer": formData.isFarmer,
        "haveBusiness": formData.haveBusiness,
        "isYuvak": formData.isYuvak,
        "financialCondition": formData.financialCondition,
        "businnessDetails": "string",
        "isExpired": formData.isExpired,
        "prominentLeaderId": formData.prominentLeaderId || 0,
        "whyIsPostal": formData.whyIsPostal,
        "isWrongMobileNo": 0,
        "pollingAgent": 0,
        "isPadvidhar": parseInt(formData.isPadvidhar)
      }

      this.spinner.show();
      let urlType;
      let urlName;
      formData.Id == 0 ? urlType = 'POST' : urlType = 'PUT'
      formData.Id == 0 ? urlName = 'ClientMasterWebApi/VoterCRM/InsertVoterDetails' : urlName = 'ClientMasterWebApi/VoterCRM/UpdateVoterDetails'

      this.callAPIService.setHttp(urlType, urlName, false, obj, false, 'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {
          this.spinner.hide();
          this.submittedVP = false;
          this.voterProfileForm.value.comment ? this.getVPPoliticalInfluenceData() : '';
          this.toastrService.success(res.statusMessage);
          this.getVoterProfileData();
        } else {
          this.toastrService.error(res.statusMessage);
          this.spinner.hide();
        }
      }, (error: any) => {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      });

    }
  }

 //.........................................Address to get Pincode Code Start Here ..................................................//

 searchAddress() {
  this.mapsAPILoader.load().then(() => {
    this.geocoder = new google.maps.Geocoder();
    let autocomplete = new google.maps.places.Autocomplete(
      this.searchElementRef.nativeElement
    );
    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        let place: google.maps.places.PlaceResult = autocomplete.getPlace();
        if (place.geometry === undefined || place.geometry === null) {
          return;
        }
        this.latitude = place.geometry.location.lat();
        this.longitude = place.geometry.location.lng();
        this.findAddressByCoordinates();
      });
    });
  });
}

markerDragEnd($event: MouseEvent) {
  this.latitude = $event.coords.lat;
  this.longitude = $event.coords.lng;
  this.findAddressByCoordinates();
}

findAddressByCoordinates() {
  this.geocoder.geocode({
    'location': {
      lat: this.latitude,
      lng: this.longitude
    }
  }, (results:any) => {
    this.findAddress(results[0]);
  });
}

findAddress(results:any) {
  if(results){
    this.addressName = results.formatted_address;
        results.address_components.forEach((element: any) => {
           if (element.types[0] == "locality") {
            this.cityName = element.long_name;
          }
          this.searchAdd.setValue(this.addressName);
          this.voterProfileForm.controls['migratedCity'].setValue(this.cityName);
          this.voterProfileForm.controls['migratedArea'].setValue(this.addressName);
        });
  }
}

//.........................................Address to get Pincode Code End Here ....................................//

}
