import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../../dialogs/delete/delete.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-create-regional-leader',
  templateUrl: './create-regional-leader.component.html',
  styleUrls: ['./create-regional-leader.component.css']
})
export class CreateRegionalLeaderComponent implements OnInit {

  addClientForm!: FormGroup;
  submitted = false;
  paginationNo: number = 1;
  pageSize: number = 10;
  total: any;
  btnText = 'Add Client';
  filterForm!: FormGroup;
  subject: Subject<any> = new Subject();
  searchFilter = "";
  HighlightRow: any;
  resultVillage: any;
  allDistrict: any;
  getTalkaByDistrict: any;
  villageDisabled!: boolean;
  editFlag: boolean = true;
  clientId: any;
  GenderArray = [{ id: 0, name: "Male" }, { id: 1, name: "Female" },{ id: 2, name: "Other" }];
  clientDataArray: any;
  modelObjectData: any;
  globalEditData: any;

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.defaultAddClientForm();
    this.defaultFilterForm();
    this.getDistrict();
    this.searchFilters('false');
    this.getClientData();
  }

  defaultAddClientForm() {
    this.addClientForm = this.fb.group({
      Id: [0],
      Name: [''],
      FName: ['',Validators.compose([Validators.required ,Validators.pattern(/^\S*$/),this.commonService.onlyEnglish])],
      MName: ['',Validators.compose([Validators.pattern(/^\S*$/),this.commonService.onlyEnglish])],
      LName: ['',Validators.compose([Validators.required ,Validators.pattern(/^\S*$/),this.commonService.onlyEnglish])],
      Address: ['', [Validators.required,Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]],
      Gender: ['', Validators.required],
      MobileNo: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      ContactNo2: ['', [Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      EmailId: ['', [Validators.required, Validators.email]],
      // emailID: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
      DistrictId: ['', Validators.required],
      TalukaId: ['', Validators.required],
      VillageId: ['', Validators.required],
      // clientPartyId: [''],
    })
  }

  get f() { return this.addClientForm.controls };

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      DistrictId: [0],
      Search: [''],
    })
  }

  getDistrict() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetDistrict_1_0?StateId=' + 1, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        if (this.btnText == 'Update Client') {
          this.getTaluka(this.addClientForm.value.DistrictId,false);
        }
        this.spinner.hide();
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
    if(districtId == ''){return}
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetTaluka_1_0?DistrictId=' + districtId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.getTalkaByDistrict = res.data1;
        if(flag == 'select'){
          this.addClientForm.controls['VillageId'].setValue('');
        }
        if (this.btnText == 'Update Client' && flag != 'select') {
           this.addClientForm.controls['TalukaId'].setValue(this.globalEditData.TalukaId);
          this.getVillage(this.globalEditData.TalukaId)
        }
        
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  getVillage(talukaID: any) {
    this.villageDisabled = false;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetVillage_1_0?talukaid=' + talukaID, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.resultVillage = res.data1;
        if (this.btnText == 'Update Client') {
          this.addClientForm.controls['VillageId'].setValue(this.globalEditData.VillageId);
        }
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  districtClear(text: any) {
    if (text == 'district') {
      this.addClientForm.controls['DistrictId'].setValue(''), this.addClientForm.controls['TalukaId'].setValue(''), this.addClientForm.controls['VillageId'].setValue('');
      this.villageDisabled = true;
    } else if (text == 'taluka') {
      this.addClientForm.controls['TalukaId'].setValue(''), this.addClientForm.controls['VillageId'].setValue('');

    } else if (text == 'village') {
      this.addClientForm.controls['VillageId'].setValue('');
    }
  }

  getClientData() {//get TableRecord
    this.spinner.show();
    this.clearForm();
    let formData = this.filterForm.value;
    let obj = '&DistrictId=' + formData.DistrictId + '&UserId=' + this.commonService.loggedInUserId() + '&Search=' + formData.Search +
      '&nopage=' + this.paginationNo;
    this.callAPIService.setHttp('get', 'Web_get_Client?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientDataArray = res.data1;
        this.total = res.data2[0].TotalCount;
      } else {
        this.spinner.hide();
        this.clientDataArray = [];
        // //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onSubmitAddClient() {
    this.submitted = true;
    if (this.addClientForm.invalid) {
      this.spinner.hide();
      return;
    }
    else if(this.addClientForm.value.MobileNo == this.addClientForm.value.ContactNo2){ 
      this.spinner.hide();
      this.toastrService.error("Please Enter Different Mobile No.");
    }
    else {
      this.spinner.show();
      let data = this.addClientForm.value;
      let FullName = data.FName + " " + data.MName + " " + data.LName;
      data.Name = FullName;

      let fromData: any = new FormData();
      Object.keys(data).forEach((cr: any, ind: any) => {
        let value = Object.values(data)[ind] != null ? Object.values(data)[ind] : 0;
        fromData.append(cr, value)
      })

      this.callAPIService.setHttp('Post', 'Web_Insert_Client', false, fromData, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.toastrService.success(res.data1[0].Msg);
          this.getClientData();
          this.spinner.hide();
          this.defaultAddClientForm();
          this.submitted = false;
          this.btnText = 'Add Client';
        } else {
          this.spinner.hide();
          //  //this.toastrService.error("Data is not available");
        }
      }, (error: any) => {
        if (error.status == 500) {
          this.router.navigate(['../500'], { relativeTo: this.route });
        }
      })
    }
  }

  getClientDetails(ClientId: any) {//Edit Api
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetClientDetails?Id=' + ClientId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        let ClientDetailsArray = res.data1[0];
        this.editPatchValue(ClientDetailsArray);
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  editPatchValue(objData: any) {
    this.globalEditData = objData;
    this.btnText = 'Update Client';
    this.HighlightRow = objData.Id;

    this.addClientForm.patchValue({
      Id: objData.Id,
      FName: objData.FName,
      MName: objData.MName,
      LName: objData.LName,
      Address: objData.Address,
      EmailId: objData.EmailId,
      Gender: objData.Gender,
      MobileNo: objData.MobileNo,
      ContactNo2: objData.ContactNo,
      DistrictId: objData.DistrictId,
      // TalukaId: objData.TalukaId,
      // VillageId : objData.VillageId,
    });
    this.getDistrict();
  }

  clearForm() {
    this.submitted = false;
    this.btnText = 'Add Client'
    this.defaultAddClientForm();
  }

  delConfirmAssBothEle(clientId: any) {
    this.clientId = clientId;
    this.deleteConfirmModel();
  }

  deleteConfirmModel() {
    const dialogRef = this.dialog.open(DeleteComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        this.deleteClientData();
      }
    });
  }

  deleteClientData() {
    this.callAPIService.setHttp('get', 'Web_DeleteClient?ClientId=' + this.clientId + '&CreatedBy=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.success(res.data1[0].Msg);
        this.getClientData();
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

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getClientData();
  }

  clearFilter(flag: any) {
    if (flag == 'DistrictFlag') {
      this.filterForm.controls['DistrictId'].setValue(0);
    } else if (flag == 'search') {
      this.filterForm.controls['Search'].setValue('');
    }
    this.paginationNo = 1;
    this.getClientData();
    this.clearForm();
  }

  filterData() {
    this.paginationNo = 1;
    this.getClientData();
    this.clearForm();
  }

  onKeyUpFilter() {
    this.subject.next();
    this.clearForm();
  }

  searchFilters(flag: any) {
    if (flag == 'true') {
      if (this.filterForm.value.Search == "" || this.filterForm.value.Search == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchFilter = this.filterForm.value.Search;
        this.paginationNo = 1;
        this.getClientData();
        this.clearForm();
      }
      );
  }

}
