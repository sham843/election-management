import { Component, Inject, OnInit } from '@angular/core';
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
  FamilyChildTotal: any;
  FamilyChildPaginationNo: number = 1;
  FamilyChildPageSize: number = 10;
  searchFamilyChield = new FormControl('');
  subjectSearchFamilyC: Subject<any> = new Subject();

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
    this.searchFamilyChieldFilters('false');
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

  getVoterProfileData() {
    this.spinner.show();
    let obj = 'ClientId=' + this.voterListData.ClientId +
      '&AgentId=' + this.voterListData.AgentId + '&VoterId=' + this.voterListData.VoterId
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/VoterCRM/GetVoterProfileCRM?' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.voterProfileData = res.responseData;
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

     //.......... get Voter for Family Child List Code Start...............//

     getVoterListforFamilyChild() {
      this.spinner.show();
      let obj = 'ClientId=' + this.voterListData.ClientId + '&UserId=' + this.commonService.loggedInUserId() +
      '&ElectionId=' + 43 + '&ConstituencyId=' + 56 + '&BoothId=' + this.voterProfileData.boothId  + '&Search=' +  this.searchFamilyChield.value.trim()
      + '&pageno=' + this.FamilyChildPaginationNo + '&pagesize=' + this.FamilyChildPageSize;
      this.callAPIService.setHttp('get', 'VoterCRM/GetVoterListforFamilyChild?' + obj , false, false, false, 'electionMicroServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {  
          this.spinner.hide();
          this.voterListforFamilyChildArray = res.responseData.responseData1;
          // this.FamilyChildTotal = res.responseData.responseData2.totalPages * this.FamilyChildPageSize;
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
  
    //.......... get Voter for Family Child List Code End...............//
    

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

  editVoterProfileData(data:any) {
    this.voterProfileForm.patchValue({
      Id: this.voterProfileData.voterId,
      mobileNo1: data?.mobileNo1,
      mobileNo2: data?.mobileNo2,
      email:data.email,
      castId: data.castId,
      partyId: data.partyId,
      religionId: data.religionId,
      watsApp1: data.watsApp1,
      watsApp2: data.watsApp2,
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
      migratedLatitude: data.migratedLatitude,
      migratedLongitude: data.migratedLongitude,
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
      familysize: data.familysize,
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
        "serverId": this.voterProfileData.serverId,
        "voterId": this.voterProfileData.voterId,
        "mobileNo1": formData.mobileNo1,
        "mobileNo2": formData.mobileNo2,
        "landline": "string",
        "email": "string",
        "followers": "string",
        "castId": formData.castId,
        "partyId": formData.partyId,
        "familysize": formData.familysize,
        "religionId": formData.religionId,
        "partyAffection": "string",
        "leaderImportance": formData.leaderImportance,
        "watsApp1": formData.watsApp1,
        "watsApp2": formData.watsApp2,
        "facebookId": "string",
        "leader": formData.leader,
        "migratedArea": formData.migratedArea,
        "regionalLang1": "string",
        "regionalLang2": "string",
        "userId": this.commonService.loggedInUserId(),
        "head": formData.head,
        "villageId": this.voterProfileData.villageId,
        "boothId": this.voterProfileData.boothId,
        "assemblyId": this.voterProfileData.assemblyId,
        "dateOfBirth": formData.dateOfBirth,
        "comment": formData.comment,
        "voterMarking": "string",
        "oppCandidateId": 0,
        "feedback": "string",
        "migratedCity": formData.migratedCity,
        "latitude": 0,
        "longitude": 0,
        "voterNo": this.voterProfileData.voterNo,
        "nickName":  formData.nickName,
        "clientId": this.voterProfileData.clientId,
        "migrated": formData.migrated,
        "area": formData.area,
        "migratedLatitude": 0,
        "migratedLongitude": 0,
        "surveyDate": "2022-06-23T10:32:04.461Z",
        "buildingID": 0,
        "needSupportFlag": formData.needSupportFlag,
        "needSupportText": formData.needSupportText,
        "postalFlag": formData.postalFlag,
        "occupation": formData.occupation,
        "isNameChange": 0,
        "mfName": formData.mfName,
        "mmName": formData.mmName,
        "mlName": formData.mlName,
        "efName": formData.efName,
        "emName": formData.emName,
        "elName": formData.elName,
        "createdDate": new Date(),
        "qualification": formData.qualification,
        "bloodgroup": formData.bloodgroup,
        "isNotCall": formData.isNotCall,
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
        "prominentLeaderId": formData.prominentLeaderId,
        "whyIsPostal": formData.whyIsPostal,
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
          this.submittedVP = false;
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
