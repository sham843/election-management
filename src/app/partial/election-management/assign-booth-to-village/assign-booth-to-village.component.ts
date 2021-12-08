import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-assign-booth-to-village',
  templateUrl: './assign-booth-to-village.component.html',
  styleUrls: ['./assign-booth-to-village.component.css']
})
export class AssignBoothToVillageComponent implements OnInit {

  assemblyArray: any;
  boothListArray: any;
  assignBoothsToVillageForm!: FormGroup;
  submitted:boolean= false;
  allDistrict: any;
  getTalkaByDistrict: any;
  resultVillage: any;
  btnText = 'Assign Village';
  boothListwithVilgArray: any;
  filterForm!: FormGroup;
  paginationNo: number = 1;
  pageSize: number = 10;
  total: any;
  HighlightRow: any;
  globalEditData: any;
  // disableFlagTal: boolean = true;
  // disableFlagVill: boolean = true;

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
    this.getDistrict();
    this.getAssembly();
    this.defaultAssigBoothsToVillageForm();
    this.defaultFilterForm();
    this.getBoothListwithVillage();
  }

  defaultAssigBoothsToVillageForm() {
    this.assignBoothsToVillageForm = this.fb.group({
      Id: [0],
      districtId: ['',Validators.required],
      TalukaId: ['',Validators.required],
      VillageId: ['',Validators.required],
      assembly: ['',Validators.required],
      BoothId: ['',Validators.required],
    })
  }

  get f() { return this.assignBoothsToVillageForm.controls };

  clearForm() {
    this.submitted = false;
    this.btnText = 'Assign Village'
    this.defaultAssigBoothsToVillageForm();
  }

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      AssemblyId: [0],
      UserId: [this.commonService.loggedInUserId()],
      Assigned: [1],
    })
  }

  getDistrict() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetDistrict_1_0?StateId=' + 1, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        if (this.btnText == 'Update Village') {
          this.getTaluka(this.assignBoothsToVillageForm.value.districtId,false);
        }
        this.allDistrict = res.data1;
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  getTaluka(districtId: any,flag:any) {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetTaluka_1_0?DistrictId=' + districtId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.getTalkaByDistrict = res.data1;

        if (this.btnText == 'Update Village' && flag != 'select') {
           this.assignBoothsToVillageForm.controls['TalukaId'].setValue(this.globalEditData.TalukaId);
         this.getVillage(this.globalEditData.TalukaId);
       }
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.spinner.hide();
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  getVillage(talukaId: any) {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetVillage_1_0?talukaid=' + talukaId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.resultVillage = res.data1;
        if (this.btnText == 'Update Village') {
          this.assignBoothsToVillageForm.controls['VillageId'].setValue(this.globalEditData.VillageId);
        }
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.spinner.hide();
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  getAssembly() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Election_GetAssembly?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.assemblyArray = res.data1;
        if (this.btnText == 'Update Village') {
          this.getBoothList(this.assignBoothsToVillageForm.value.assembly);
        }
      } else {
        this.spinner.hide();
        this.assemblyArray = [];
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getBoothList(assembly:any) {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Election_GetBoothList?ConstituencyId=' + assembly + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {

      if (res.data == 0) {
        this.spinner.hide();
        this.boothListArray = res.data1;
        if (this.btnText == 'Update Village') {
          this.assignBoothsToVillageForm.controls['BoothId'].setValue(this.globalEditData.boothid);
        }
      } else {
        this.spinner.hide();
        this.boothListArray = [];
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getBoothListwithVillage() {
    this.spinner.show();
    let formData = this.filterForm.value;
    let obj = + formData.AssemblyId + '&UserId=' + formData.UserId + '&Assigned=' + formData.Assigned + '&nopage=' + this.paginationNo ;
    this.callAPIService.setHttp('get', 'Web_Election_GetBoothListWithVillage?AssemblyId=' + obj , false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {

      if (res.data == 0) {
        this.spinner.hide();
        this.boothListwithVilgArray = res.data1;
        this.total = res.data2[0].TotalCount;
      } else {
        this.spinner.hide();
        this.boothListwithVilgArray = [];
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }
  
  onSubmitData(){
      this.submitted = true;
      let formData = this.assignBoothsToVillageForm.value;
      if (this.assignBoothsToVillageForm.invalid) {
        this.spinner.hide();
        return;
      }
      else {
        this.spinner.show(); 
        this.callAPIService.setHttp('get', 'Web_Election_Assign_Village_To_Booths?BoothId=' + formData.BoothId + '&VillageId=' + formData.VillageId, false, false, false, 'electionServiceForWeb');
        this.callAPIService.getHttp().subscribe((res: any) => {
          if (res.data == 0) {
            this.toastrService.success(res.data1[0].msg);
            this.getBoothListwithVillage();
            this.spinner.hide();
            this.submitted = false;
            this.btnText = 'Assign Village';
            if(formData.Id == 0){
              this.assignBoothsToVillageForm.controls["BoothId"].setValue("");
              this.assignBoothsToVillageForm.controls["VillageId"].setValue("");
            }else{
              this.clearForm();
            }
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

  patchFormRecord(obj:any) {
    this.btnText = 'Update Village';
    this.globalEditData = obj;
    this.HighlightRow = obj.SrNo;

    this.assignBoothsToVillageForm.patchValue({
      Id: obj.AssemblyId,
      districtId: obj.DistrictId,
      // TalukaId: obj.TalukaId,
      // VillageId: obj.VillageId,
      assembly: obj.AssemblyId,
      //BoothId: obj.boothid,
    })
    this.getAssembly();
    this.getDistrict();
  }


  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getBoothListwithVillage();
  }

  clearOption(flag: any) { // on click select option close icon
   if (flag == 'District') {
      // this.disableFlagTal = true;
      // this.disableFlagVill = true;
      this.assignBoothsToVillageForm.controls["districtId"].setValue("");
      this.assignBoothsToVillageForm.controls["TalukaId"].setValue("");
      this.assignBoothsToVillageForm.controls["VillageId"].setValue("");
    } else if (flag == 'Taluka') {
      // this.disableFlagTal = true;
      // this.disableFlagVill = false;
      this.assignBoothsToVillageForm.controls["TalukaId"].setValue("");
      this.assignBoothsToVillageForm.controls["VillageId"].setValue("");
    } else if (flag == 'Village') {
      this.assignBoothsToVillageForm.controls["VillageId"].setValidators(Validators.required);
      this.assignBoothsToVillageForm.controls["VillageId"].setValue("");
    } else if('Assembly'){
      this.assignBoothsToVillageForm.controls["assembly"].setValue("");
      this.assignBoothsToVillageForm.controls["BoothId"].setValue("");
    }
  }



}

