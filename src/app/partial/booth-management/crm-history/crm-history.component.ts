import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DatePipe } from '@angular/common';
import { DateTimeAdapter } from 'ng-pick-datetime';

@Component({
  selector: 'app-crm-history',
  templateUrl: './crm-history.component.html',
  styleUrls: ['./crm-history.component.css']
})
export class CrmHistoryComponent implements OnInit {

  getFeedbacksList: any;
  getFeedbacksListTotal: any;
  feedbacksPaginationNo: number = 1;
  feedbacksPageSize: number = 10;

  feedbackTypeArray = [{ id: 1, name: 'Positive' }, { id: 2, name: 'Negitive' }, { id: 3, name: 'Neutral' }]
  enterNewFeedbackForm!: FormGroup;
  submitted: boolean = false;
  voterListData: any;
  voterProfileData: any;
  voterProfileFamilyData: any;
  VPCommentData: any;
  posNegativeInfData: any;
  Date: any = new Date();
  max = new Date();

  voterProfileForm!: FormGroup | any;
  submittedVP: boolean = false;
  nameCorrectionDivHide: boolean = false;
  disableDiv: boolean = true;
  prominentleaderArray:any;  
  VoterCastListArray:any;
  religionListArray:any;
  politicalPartyArray:any;
  ratingStarArray = [{ id: 1, name: '1 Star' }, { id: 2, name: '2 Star' }, { id: 3, name: '3 Star' }, { id: 4, name: '4 Star' }, { id: 5, name: '5 Star' }];
  headCheckArray = ['Yes','No'];
  leaderCheckArray = ['Yes','No'];
  migratedCheckArray = ['Yes','No'];
  headhideDiv:boolean = false;  
  leaderhideDiv:boolean = false;
  migratedhideDiv:boolean = false;
  postalVotingDivHide:boolean = false;
  needSupportDivHide:boolean = false;
  dairyFarmerArray = [{ id: 0, name: 'Yes' }, { id: 1, name: 'No' }];
  goatSheepFarmerArray = [{ id: 0, name: 'Yes' }, { id: 1, name: 'No' }];
  sugarCaneCutterArray = [{ id: 0, name: 'Yes' }, { id: 1, name: 'No' }];
  yuvakArray = [{ id: 0, name: 'Yes' }, { id: 1, name: 'No' }];
  farmerArray = [{ id: 0, name: 'Yes' }, { id: 1, name: 'No' }];
  businessArray = [{ id: 0, name: 'Yes' }, { id: 1, name: 'No' }];
  vehicleArray = [{ id: 0, name: 'Bike' }, { id: 1, name: 'Family Car' }, { id: 2, name: 'None' }];
  financialConditionArray = [{ id: 0, name: 'Low' }, { id: 1, name: 'Middle' }, { id: 2, name: 'High' }];
  bloodGroupArray = [{ id: 0, name: 'A+' }, { id: 1, name: 'A-' }, { id: 2, name: 'B+' },{ id: 3, name: 'B-' },
     { id: 4, name: 'O+' }, { id: 5, name: 'O-' }, { id: 6, name: 'AB+' }, { id: 7, name: 'AB-' }];


  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private commonService: CommonService,
    private toastrService: ToastrService,
    public dateTimeAdapter: DateTimeAdapter<any>,
    private datePipe: DatePipe,
  ) {
    dateTimeAdapter.setLocale('en-IN');

    let getUrlData: any = this.route.snapshot.params.id;
    if (getUrlData) {
      getUrlData = getUrlData.split('.');
      this.voterListData = { 'AgentId': +getUrlData[0], 'ClientId': +getUrlData[1], 'VoterId': +getUrlData[2] }
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
    let obj: any = 'VoterId=' + this.voterListData.VoterId + '&nopage=' + this.feedbacksPaginationNo + '&ClientId=' + this.voterListData.ClientId;
    this.callAPIService.setHttp('get', 'Get_Electioncrm_1_0?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.getFeedbacksList = res.data1;
        this.getFeedbacksListTotal = res.data2[0].TotalCount;
      } else {
        this.getFeedbacksList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
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
      data.FollowupDate = this.datePipe.transform(data.FollowupDate, 'yyyy/MM/dd HH:mm:ss');
      this.Date = this.datePipe.transform(this.Date, 'yyyy/MM/dd HH:mm:ss');

      let obj = 'Id=' + data.Id + '&VoterId=' + this.voterListData.VoterId + '&FeedBackDate=' + this.Date + '&FeedBackType=' + data.FeedBackType
        + '&Description=' + data.Description + '&FollowupDate=' + data.FollowupDate + '&CreatedBy=' + this.commonService.loggedInUserId() + '&NotToCall=' + data.NotToCall + '&ClientId=' + this.voterListData.ClientId;

      this.callAPIService.setHttp('get', 'Insert_Electioncrm_1_0?' + obj, false, false, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.toastrService.success(res.data1[0].Msg);
          this.spinner.hide();
          this.feedbacksList();
          this.clearForm();
          this.submitted = false;
        } else {
          this.spinner.hide();
        }
      }, (error: any) => {
        if (error.status == 500) {
          this.router.navigate(['../500'], { relativeTo: this.route });
        }
      })
    }
  }

  //........................ Get Voter Profile Data.....................//

  getVoterProfileData() {
    this.spinner.show();
    let obj = 'ClientId=' + this.voterListData.ClientId +
      '&AgentId=' + this.voterListData.AgentId + '&VoterId=' + this.voterListData.VoterId
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/VoterCRM/GetVoterProfileCRM?' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.voterProfileData = res.responseData;
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
    this.callAPIService.setHttp('get', 'ClientMasterApp/VoterList/GetVoterFamilyMember?' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.voterProfileFamilyData = res.responseData;
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
    this.callAPIService.setHttp('get', 'Web_get_Voterprofile_Political_Influence?ClientId=' + this.voterListData.ClientId + '&AgentId=' + this.voterListData.AgentId + '&VoterId=' + this.voterListData.VoterId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.VPCommentData = res.data1;
        this.posNegativeInfData = res.data2;
      } else {
        this.VPCommentData = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })

    // this.spinner.show();
    // let obj = 'ClientId=' + this.voterListData.ClientId + 
    // '&AgentId='+ this.voterListData.AgentId + '&VoterId='+ this.voterListData.VoterId 
    // this.callAPIService.setHttp('get', 'ClientMasterWebApi/VoterCRM/GetVoterProfileCRMVoterComments?' + obj, false, false, false, 'electionMicroSerApp');
    // this.callAPIService.getHttp().subscribe((res: any) => {
    //   if (res.responseData != null && res.statusCode == "200") {
    //     this.spinner.hide();
    //     this.VPCommentData = res.responseData.responseData1;
    //     this.posNegativeInfData = res.responseData.responseData2;
    //   } else {
    //     this.VPCommentData = [];
    //     this.posNegativeInfData = [];
    //     this.spinner.hide();
    //   }
    // }, (error: any) => {
    //   this.spinner.hide();
    //   this.router.navigate(['../500'], { relativeTo: this.route });
    // })

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
  getVoterCastList() {
    this.callAPIService.setHttp('get', 'Filter/GetCastDetails?ClientId=' + this.voterListData.ClientId + '&UserId='
      + this.commonService.loggedInUserId() + '&ReligionId=' + this.voterProfileForm.value.religionId, false, false, false, 'electionMicroServiceForWeb');
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
  

                              //....... Voter Profile form code Start Here........//


  isExpiredCheckBox(event: any) {
    let flag = event.target.checked;
    flag == true ? this.disableDiv = true : this.disableDiv = false;
  }

  nameCorrectionCheckBox(event: any) {
    let flag = event.target.checked;
    flag == true ? this.nameCorrectionDivHide = true : this.nameCorrectionDivHide = false;
  }

  familyHeadRadiobtn(){
    this.voterProfileForm.value.head == 'Yes' ? this.headhideDiv = true : this.headhideDiv = false;
  }

  leaderRadiobtn(){
    this.voterProfileForm.value.leader == 'Yes' ? this.leaderhideDiv = true : this.leaderhideDiv = false;
  }

  migratedRadiobtn(){
    this.voterProfileForm.value.migrated == 'Yes' ? this.migratedhideDiv = true : this.migratedhideDiv = false;
  }

  postalVotingCheckBox(event: any) {
    let flag = event.target.checked;
    flag == true ? this.postalVotingDivHide = true : this.postalVotingDivHide = false;
  }

  needSupportCheckBox(event: any) {
    let flag = event.target.checked;
    flag == true ? this.needSupportDivHide = true : this.needSupportDivHide = false;
  }


  get v() { return this.voterProfileForm.controls };

  defaultvoterProfileForm() {
    this.voterProfileForm = this.fb.group({

      Id: [''],
      mobileNo1: [''],
      mobileNo2: [''],
      email: [''],
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
      migratedLatitude: [''],
      migratedLongitude: [''],
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
      familysize: [''],
    })
  }

  editVoterProfileData() {
    this.voterProfileForm.patchValue({
      mobileNo1: [''],
      mobileNo2: [''],
      email: [''],
      castId: [''],
      partyId: [''],
      religionId: [''],
      watsApp1: [''],
      watsApp2: [''],
      leader: [''],
      migratedArea: [''],
      head: [''],
      dateOfBirth: [''],
      leaderImportance: [''],
      comment: [''],
      voterMarking: [''],
      migratedCity: [''],
      latitude: [''],
      longitude: [''],
      nickName: [''],
      migrated: [''],
      area: [''],
      migratedLatitude: [''],
      migratedLongitude: [''],
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
      familysize: [''],
    })
  }



  onSubmitVoterProfile() {
    let formData = this.voterProfileForm.value;
    this.submittedVP = true;
    if (this.voterProfileForm.invalid) {
      this.spinner.hide();
      return;
    } else {

      let obj = {
        "serverId": 0,
        "voterId": 0,
        "mobileNo1": "string",
        "mobileNo2": "string",
        "landline": "string",
        "email": "string",
        "followers": "string",
        "castId": 0,
        "partyId": 0,
        "familysize": "string",
        "religionId": 0,
        "partyAffection": "string",
        "leaderImportance": "string",
        "watsApp1": "string",
        "watsApp2": "string",
        "facebookId": "string",
        "leader": "string",
        "migratedArea": "string",
        "regionalLang1": "string",
        "regionalLang2": "string",
        "userId": 0,
        "head": "string",
        "villageId": 0,
        "boothId": 0,
        "assemblyId": 0,
        "dateOfBirth": "2022-06-23T10:32:04.461Z",
        "comment": "string",
        "voterMarking": "string",
        "oppCandidateId": 0,
        "feedback": "string",
        "migratedCity": "string",
        "latitude": 0,
        "longitude": 0,
        "voterNo": "string",
        "nickName": "string",
        "clientId": 0,
        "migrated": "string",
        "area": "string",
        "migratedLatitude": 0,
        "migratedLongitude": 0,
        "surveyDate": "2022-06-23T10:32:04.461Z",
        "buildingID": 0,
        "needSupportFlag": 0,
        "needSupportText": "string",
        "postalFlag": 0,
        "occupation": "string",
        "isNameChange": 0,
        "mfName": "string",
        "mmName": "string",
        "mlName": "string",
        "efName": "string",
        "emName": "string",
        "elName": "string",
        "createdDate": "2022-06-23T10:32:04.461Z",
        "qualification": "string",
        "bloodgroup": "string",
        "isNotCall": 0,
        "isDairyFarmer": 0,
        "isGoatSheepFarmer": 0,
        "isSugarCaneCutter": 0,
        "haveVehicle": 0,
        "isFarmer": 0,
        "haveBusiness": 0,
        "isYuvak": 0,
        "financialCondition": 0,
        "businnessDetails": "string",
        "isExpired": 0,
        "prominentLeaderId": 0,
        "whyIsPostal": "string",
        "isWrongMobileNo": 0,
        "pollingAgent": 0
      }

      this.spinner.show();
      let urlType;
      let urlName;
      formData.Id == 0 ? urlType = 'POST' : urlType = 'PUT'
      formData.Id == 0 ? urlName = 'ClientMasterWebApi/VoterCRM/InsertVoterDetails' : urlName = 'ClientMasterWebApi/VoterCRM/UpdateVoterDetails'

      this.callAPIService.setHttp(urlType, urlName, false, JSON.stringify(obj), false, 'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {
          this.spinner.hide();
          this.toastrService.success(res.statusMessage);
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

}
