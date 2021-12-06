import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { Gallery, GalleryItem, ImageItem, ThumbnailsPosition, ImageSize } from '@ngx-gallery/core';
import { Lightbox } from '@ngx-gallery/lightbox';

@Component({
  selector: 'app-voters-profile',
  templateUrl: './voters-profile.component.html',
  styleUrls: ['./voters-profile.component.css']
})
export class VotersProfileComponent implements OnInit {
  voterProfileData: any;
  voterListData: any;
  posNegativeInfData: any;
  VPCommentData: any;
  voterHasVisitTypesData: any;
  voterVisitDetailDataArray:any = [];
  comUserdetImg:any;
  programGalleryImg!: GalleryItem[]; 

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public gallery: Gallery,
    private _lightbox: Lightbox,
  ) { 
     let getsessionStorageData: any = sessionStorage.getItem('voter-profile');
     let getStorageData= JSON.parse(getsessionStorageData); 
     this.voterListData = {'AgentId': getStorageData.AgentId ,'ClientID': getStorageData.ClientID, 'VoterId': getStorageData.VoterId}
}

  ngOnInit(): void {
    this.getVoterProfileData();
    this.getVPPoliticalInfluenceData();
    this.getVoterHasVisitTypeData();
  }
                                // Get Voter Profile Data.....................

  getVoterProfileData() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Voter_Profile?ClientId=' + this.voterListData.ClientID + '&AgentId='+ this.voterListData.AgentId + '&VoterId='+ this.voterListData.VoterId , false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.voterProfileData = res.data1[0];
      } else {
        this.spinner.hide();
        this.voterProfileData = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

                                    // data1: Postive Negative Influence & data2: Comment Data  //

  getVPPoliticalInfluenceData() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_get_Voterprofile_Political_Influence?ClientId=' + this.voterListData.ClientID + '&AgentId='+ this.voterListData.AgentId + '&VoterId='+ this.voterListData.VoterId , false, false, false, 'electionServiceForWeb');
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
  }

                              // 

  getVoterHasVisitTypeData() {
    this.spinner.show();
    // this.callAPIService.setHttp('get', 'Web_VoterHas_VisitTypes?ClientId=' + this.voterListData.ClientID + '&AgentId='+ this.voterListData.AgentId + '&VoterId='+ this.voterListData.VoterId , false, false, false, 'electionServiceForWeb');
   this.callAPIService.setHttp('get', 'Web_VoterHas_VisitTypes?ClientId=' + 2 + '&AgentId='+ 5 + '&VoterId='+ 342671 , false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.voterHasVisitTypesData = res.data1;
        // ----------------- get voter Visit Details Bind  by  VoterId  start here -------------------------//
        if(this.voterHasVisitTypesData.lenght !=0){
          this.voterHasVisitTypesData.forEach((element:any) => {
            this.getVoterVisitDetailData(element.VistitTypeId);
          });
        }
        
      // ----------------- get voter Visit Details Bind  by  VoterId  end here -------------------------//
      } else {
        this.spinner.hide();
        this.voterHasVisitTypesData = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getVoterVisitDetailData(VisitTypeId:any) {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Voter_Visit_Details?ClientId=' + 2 + '&AgentId='+ 5 + '&VoterId='+ 342671 + '&VisitTypeId='+ VisitTypeId , false, false, false, 'electionServiceForWeb');
    // this.callAPIService.setHttp('get', 'Web_Voter_Visit_Details?ClientId=' + this.voterListData.ClientID + '&AgentId='+ this.voterListData.AgentId + '&VoterId='+ this.voterListData.VoterId + '&VisitTypeId='+ VisitTypeId , false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        let voterVisitDetailData = res.data1[0];
        this.voterVisitDetailDataArray.push(voterVisitDetailData);
        console.log( this.voterVisitDetailDataArray)
      } else {
        this.spinner.hide();
        this.voterVisitDetailDataArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  // imgData(data:any){
  //   this.comUserdetImg = data.VisitPhoto.split(',');
  //   this.comUserdetImg = this.commonService.imgesDataTransform(this.comUserdetImg,'array');
  //   this.gallery.ref().load(this.comUserdetImg);
  // }

  ngOnDestroy() {
    sessionStorage.removeItem('voter-profile');
  }

}
