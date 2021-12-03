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
// import { cos } from '@amcharts/amcharts4/.internal/core/utils/Math';
// import { time } from 'console';
// import { $ } from 'protractor';

@Component({
  selector: 'app-assign-booth-to-constituency',
  templateUrl: './assign-booth-to-constituency.component.html',
  styleUrls: ['./assign-booth-to-constituency.component.css']
})
export class AssignBoothToConstituencyComponent implements OnInit {

  assignBoothForm!: FormGroup;
  submitted = false;
  paginationNo: number = 1;
  pageSize: number = 10;
  total: any;
  btnText = 'Assign Booths';
  filterForm!: FormGroup;
  subject: Subject<any> = new Subject();
  searchFilter = "";
  HighlightRow: any;
  assemblyArray: any;
  boothListArray: any;
  electionNameArray: any;
  constituencyNameArray: any;
  assignedBoothToElectionArray: any;
  ElectionId: any;
  AssemblyBoothArray: any = [];
  AssemblyId: any;
  assemblyBoothJSON: any;
  boothDivHide: boolean = false;
  ConstiId: any;
  ConstituencyId: any;
  ConstituencyIdArray: any = [];
  boothListMergeArray: any = [];
  assemblyIdArray: any = [];
  AssBoothListDetailArray: any;
  searchAssembly = '';
  searchboothList = '';
  assemblyCheckBoxCheck!: boolean;
  selBoothId: any;
  BoothListDetailData:any;


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
    this.defaultAssignBoothForm();
    this.getAssembly();
    this.getElection();
    this.defaultFilterForm();
    this.getAssignedBoothToElection();
    this.searchFilters('false');
  }

  defaultAssignBoothForm() {
    this.assignBoothForm = this.fb.group({
      Id: [0],
      ElectionId: ['', Validators.required],
      ConstituencyId: ['', Validators.required],
      assembly: [''],
      boothList: [''],
      // Assembly: [false,  Validators.requiredTrue],
      // Booths: [false, Validators.requiredTrue],
    })
  }

  get f() { return this.assignBoothForm.controls };

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      ElectionNameId: [0],
      Search: [''],
    })
  }

  onCheckChangeAssembly(event: any, assemblyId:any) {
    this.assemblyCheckBoxCheck = event.target.checked;
    this.AssemblyId = assemblyId;
    if (event.target.checked == false) {
      let index = this.assemblyIdArray.indexOf(this.AssemblyId);
      this.assemblyIdArray.splice(index, 1);
  
      let indexBoothArray = this.AssemblyBoothArray.findIndex((x:any)=> x.AssemblyId == this.AssemblyId);
      this.AssemblyBoothArray.splice(indexBoothArray, 1);
      // this.onCheckChangeBooths(event, assemblyId);
      this.boothListMergeArray = this.boothListMergeArray.filter((ele: any) => {
        if (ele.AssemblyId !== Number(this.AssemblyId)) {
          return ele;
        }
      });
      this.boothListMergeArray.length == 0 ?   this.boothDivHide = false : this.boothDivHide = true;
    }
    else {
      this.assemblyIdArray.push(this.AssemblyId);
      this.GetBoothList(this.AssemblyId);
    };
    // this.GetBoothList(this.AssemblyId);
  }

  onCheckChangeBooths(event: any, assemblyId: any, boothId: any) {
    if (event.target.checked == false) {
      let index = this.AssemblyBoothArray.map((x: any) => { return x.BoothId; }).indexOf(boothId);
      this.AssemblyBoothArray.splice(index, 1);
    }
    else {
      this.AssemblyBoothArray.push({ 'AssemblyId': assemblyId, 'BoothId': boothId });
    }
  }

  onSubmitElection() {
    this.submitted = true;
    let formData = this.assignBoothForm.value;
    debugger;
    if (this.assignBoothForm.invalid) {
      this.spinner.hide();
    }else if (this.AssemblyBoothArray.length == 0  ||  this.AssemblyBoothArray.length == 0){
      this.toastrService.error("Assembly Or Booth is required");
      return;
    }
    else {
    
      this.spinner.show();
      this.assemblyBoothJSON = JSON.stringify(this.AssemblyBoothArray);
      let id;
      formData.Id == "" || formData.Id == null ? id = 0 : id = formData.Id;

      let obj = id + '&ElectionId=' + formData.ElectionId + '&ConstituencyId=' + formData.ConstituencyId
        + '&strAssmblyBoothId=' + this.assemblyBoothJSON + '&CreatedBy=' + this.commonService.loggedInUserId();
      this.callAPIService.setHttp('get', 'Web_Insert_Election_AssignBoothToElection?Id=' + obj, false, false, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.toastrService.success(res.data1[0].Msg);
          this.AssemblyBoothArray = [];
          this.getAssignedBoothToElection();
          this.spinner.hide();
          this.clearForm();
          this.submitted = false;
          this.btnText = 'Assign Booths';
          this.getAssembly();
          this.boothListMergeArray = [];
        } else {
          this.spinner.hide();
          //this.toastrService.error("Data is not available");
        }
      }, (error: any) => {
        if (error.status == 500) {
          this.router.navigate(['../500'], { relativeTo: this.route });
        }
      })
    }
  }

  getElection() {
    this.spinner.show();
    // this.callAPIService.setHttp('get', 'Web_GetElection?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'ncpServiceForWeb');
    this.callAPIService.setHttp('get', 'Web_Election_Get_ElectionNameHaveConstituency?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
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

  GetConstituencyName(ElectionId: any) {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Election_Get_ConstituencyName?UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + ElectionId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.assignBoothForm.controls['ConstituencyId'].setValue(this.ConstituencyId);
        this.spinner.hide();
        this.constituencyNameArray = res.data1;

      } else {
        this.spinner.hide();
        this.constituencyNameArray = [];
        this.toastrService.error("Constituency Name is not available");
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
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
      } else {
        this.spinner.hide();
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  GetBoothList(AssemblyId: any) {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Election_GetBoothList?ConstituencyId=' + AssemblyId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.boothDivHide = true;
        this.boothListArray = res.data1;
        this.boothListArray.map((ele: any) => {
          if (this.assemblyCheckBoxCheck) {
            this.boothListMergeArray.push(ele);
          }
        });
        if (this.btnText == 'Update Booths') {
          let BoothIdArray = this.selBoothId.split(',');
          this.checkBoxCehckBoothArray(BoothIdArray);
        }

      } else {
        this.boothListMergeArray.length == 0 ?  this.boothListMergeArray = [] : '';
        this.spinner.hide();
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getAssignedBoothToElection() {//get TableRecord
    this.spinner.show();
    let formData = this.filterForm.value;
    let obj = '&ElectionId=' + formData.ElectionNameId + '&UserId=' + this.commonService.loggedInUserId() + '&Search=' + formData.Search +
      '&nopage=' + this.paginationNo;
    this.callAPIService.setHttp('get', 'Web_Election_GetAssignedBoothToElection?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.assignedBoothToElectionArray = res.data1;
        this.total = res.data2[0].TotalCount;
      } else {
        this.spinner.hide();
        this.assignedBoothToElectionArray = [];
        // //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getAssignedBoothListDetail(HeaderId: any,obj:any) {//modelRecord
    this.spinner.show();
    this.BoothListDetailData = obj;
    this.callAPIService.setHttp('get', 'Web_Election_GetAssignedBoothListDetail?HeaderId=' + HeaderId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.AssBoothListDetailArray = res.data1;
      } else {
        this.spinner.hide();
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }
  patchAssBoothElection(HeaderId: any) {
    this.btnText = 'Update Booths';
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Election_GetAssignedBoothListbyHeaderId?HeaderId=' + HeaderId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.editAssignBoothsPatchValue(res.data1[0]);

      } else {
        this.spinner.hide();
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  editAssignBoothsPatchValue(objData: any) {
    this.boothListMergeArray = [];
    this.ConstituencyId = objData.ConstituencyId;
    this.HighlightRow = objData.Id;
    this.boothDivHide = true;
    this.selBoothId = objData.BoothId;
    this.ConstituencyIdArray = objData.Assembly.split('');
    this.assemblyCheckBoxCheck = true;
    let assemblyArray = objData.Assembly.split(',');
    this.checkBoxCehckAssemblyArray(assemblyArray);

    assemblyArray.forEach((ele: any) => {
      this.GetBoothList(ele)
    });
    
    this.assignBoothForm.patchValue({
      Id: objData.Id,
      ElectionId: objData.ElectionId,
      // Id: objData.Id,
      // ElectionId: objData.ElectionId,
    });
    this.GetConstituencyName(objData.ElectionId);
    setTimeout(() => { this.editAssemblyBoothArray()}, 1000);
  }

  editAssemblyBoothArray() {
    let boothArray = this.selBoothId.split(',');
   this.boothListMergeArray.find((ele: any) => { 
        boothArray.find((el: any) => {
          if (ele.Id == Number(el)) {
            this.AssemblyBoothArray.push({ 'AssemblyId': ele.AssemblyId, 'BoothId': ele.Id });
          }
        })
      });
  }

  checkBoxCehckAssemblyArray(ConstituencyId: any) {
    for (let i = 0; i < ConstituencyId.length; i++) {
      for (let j = 0; j < this.assemblyArray.length; j++) {
        if (this.assemblyArray[j].ConstituencyNo === ConstituencyId[i]) {
          this.assemblyArray[j].checked = true;
        }
      }
    }
  }

  checkBoxCehckBoothArray(ConstituencyId: any) {
    for (let i = 0; i < ConstituencyId.length; i++) {
      for (let j = 0; j < this.boothListArray.length; j++) {
        if (this.boothListArray[j].Id == Number(ConstituencyId[i])) {
          this.boothListArray[j].checked = true;
        }
      }
    }
  }

  clearForm() {
    this.submitted = false;
    this.btnText = 'Assign Booths'
    this.defaultAssignBoothForm();
    this.boothListArray = [];
    this.boothDivHide = false;
    this.searchAssembly = '';
    this.searchboothList = '';
    this.getAssembly();
  }

  delConfirmAssBothEle(ElectionId: any) {
    this.ElectionId = ElectionId;
    this.deleteConfirmModel();
  }

  deleteConfirmModel() {
    const dialogRef = this.dialog.open(DeleteComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        this.deleteElectionMasterData();
      }
    });
  }

  deleteElectionMasterData() {
    this.callAPIService.setHttp('get', 'Web_Insert_Election_DeleteBoothToElection?HeaderId=' + this.ElectionId + '&CreatedBy=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.success(res.data1[0].Msg);
        this.getAssignedBoothToElection();
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
    this.getAssignedBoothToElection();
  }

  clearFilter(flag: any) {
    if (flag == 'electionType') {
      this.filterForm.controls['ElectionNameId'].setValue(0);
    } else if (flag == 'search') {
      this.filterForm.controls['Search'].setValue('');
    }
    this.paginationNo = 1;
    this.getAssignedBoothToElection();
    this.clearForm();
  }

  filterData() {
    this.paginationNo = 1;
    this.getAssignedBoothToElection();
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
        this.getAssignedBoothToElection();
      }
      );
  }

}
