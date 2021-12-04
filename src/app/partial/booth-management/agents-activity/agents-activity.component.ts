import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { debounceTime } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { DateTimeAdapter } from 'ng-pick-datetime';

@Component({
  selector: 'app-agents-activity',
  templateUrl: './agents-activity.component.html',
  styleUrls: ['./agents-activity.component.css']
})
export class AgentsActivityComponent implements OnInit, OnDestroy {
  agentProfileCardData: any;
  agentProfileData: any;
  allAgentLists: any;
  allSubAgentsByAgentId: any;
  filterForm!: FormGroup;
  voterProfilefilterForm!: FormGroup;
  piChartArray = [];
  clientBoothAgentVoterList: any;
  defaultVaoterListFlag: boolean = true;

  votersPaginationNo = 1;
  votersPageSize: number = 10;
  votersTotal: any;
  selBothIdObj: any;
  votersCardData: any;
  cardActiveClass: boolean = true;
  subject: Subject<any> = new Subject();
  agentInfo: any;

  clientBoothAgentFamiliyList: any;
  familyPaginationNo = 1;
  familyPageSize: number = 10;
  familyTotal: any;
  boothFamilyDetailsArray: any;
  getAgentByBoothsData: any;


  constructor(private spinner: NgxSpinnerService, private callAPIService: CallAPIService, private fb: FormBuilder, public dateTimeAdapter: DateTimeAdapter<any>, private datePipe: DatePipe, private commonService: CommonService, private router: Router, private route: ActivatedRoute, private toastrService: ToastrService) {
    { dateTimeAdapter.setLocale('en-IN') }
  }

  ngOnInit(): void {
    this.agentInfo = sessionStorage.getItem('agents-activity');
    this.agentInfo = JSON.parse(this.agentInfo);
    this.deafultVoterProfilefilterForm(); // voter list filter

    this.topFilterForm(this.agentInfo); // top filter method
    this.LineChartAgentPerformance();
    this.getAllAgentList();
    this.getAgentProfileData();
    this.getAgentProfileCardData();


    this.searchVoterFilter('false');
  }

  //--------------------------------------------------  top filter method's start  here e -----------------------------------------------------------//

  topFilterForm(data: any) {
    let setAgentId: any;
    data.SubUserTypeId == 3 ? setAgentId = data.BoothAgentId : setAgentId = data.Addedby
    this.filterForm = this.fb.group({
      AgentId: [setAgentId],
      ClientId: [data.ClientId],
      BoothId: [0],
      AssemblyId: [0],
      subAreaAgentId: []
    })
  }

  get filterFormControls() { return this.filterForm.controls };

  getAllAgentList() {
    this.spinner.show();
    let formData = this.filterForm.value;
    this.callAPIService.setHttp('get', 'Web_Client_AgentList_ddl?ClientId=' + formData.ClientId + '&UserId=' + formData.AgentId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.allAgentLists = res.data1;
        this.agentInfo.SubUserTypeId == 3 ? this.getAgentByBooths() : this.areaSubAgentByAgentId();
        // this.filterForm.value.subAreaAgentId == "" ||  this.filterForm.value.subAreaAgentId ==  null ||  this.filterForm.value.subAreaAgentId == "" ? this.getAgentByBooths() : this.areaSubAgentByAgentId();
      } else {
        this.allAgentLists = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  areaSubAgentByAgentId() {
    this.spinner.show();
    let formData = this.filterForm.value;
    let obj: any = 'ClientId=' + formData.ClientId + '&UserId=' + formData.AgentId + '&BoothAgentId=' + formData.BoothId;
    this.callAPIService.setHttp('get', 'Web_Client_Area_AgentList_ddl?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.allSubAgentsByAgentId = res.data1;

        if (this.agentInfo.SubUserTypeId == 4) {
          this.allSubAgentsByAgentId.length == 1 ? this.filterForm.controls['subAreaAgentId'].setValue(this.allSubAgentsByAgentId[0].Id) : ''
        }

        this.getAgentByBooths();
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


  getAgentByBooths() {
    this.spinner.show();
    let formData = this.filterForm.value;
    let obj: any = 'ClientId=' + formData.ClientId + '&AgentId=' + formData.AgentId + '&BoothAgentId=' + formData.BoothId;
    this.callAPIService.setHttp('get', 'Web_Client_AgentWithAssignedBoothsList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.getAgentByBoothsData = res.data1;

        if (this.agentInfo.SubUserTypeId == 4){
          this.getAgentByBoothsData.length == 1 ? (this.filterForm.controls['BoothId'].setValue(this.getAgentByBoothsData[0].BoothId), this.getAgentProfileData()) : ''
        }
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

  clearFilter(flag: any) {

  }


  //--------------------------------------------------  top filter method's end  here e -----------------------------------------------------------//

  //-------------------------------------------------- agent Profile method's start here -----------------------------------------------------------//
  getAgentProfileData() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_get_Agent_Profile?UserId=' + this.filterForm.value.AgentId + '&clientid=' + this.filterForm.value.ClientId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.agentProfileData = res.data1[0];
        console.log(this.agentProfileCardData);
        this.getpiChartArray(res.data1);
      } else {
        this.agentProfileData = [];
        this.spinner.hide();
      }

    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getAgentProfileCardData() {
    this.spinner.show();
    let formData = this.filterForm.value;
    let obj = 'AgentId=' + formData.AgentId  + '&ClientId=' + formData.ClientId + '&BoothId=' + formData.BoothId + '&AssemblyId=' + formData.AssemblyId;
    this.callAPIService.setHttp('get', 'Web_Client_AgentWithAssignedBooths_Summary?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.agentProfileCardData = res.data1[0];
      } else {
        this.agentProfileCardData = [];
        this.spinner.hide();
      }
      this.getpiChartArray(res.data1);
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getpiChartArray(piChartData: any) { // data transform from orignal array 
    piChartData.filter((ele: any) => {
      let obj: any = [{ 'category': "TotalVoter", 'categoryCount': ele.TotalVoter }, { 'category': 'TotalFamily', 'categoryCount': ele.TotalFamily }, { 'category': 'Pending', 'categoryCount': ele.Pending }];
      this.piChartArray = obj;
    })
    this.piechartAgentProfile();
  }

  piechartAgentProfile() {

    am4core.useTheme(am4themes_animated);

    // Create chart instance
    let chart = am4core.create("agentProfilePiChart", am4charts.PieChart);
    // Add and configure Series
    let pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.colors.list = [
      am4core.color("#CC9999"),
      am4core.color("#4DB6AC"),
      am4core.color("#FF6F91"),
      am4core.color("#FF9671"),
      am4core.color("#FFC75F"),
      am4core.color("#9FA8DA"),
    ];

    pieSeries.dataFields.value = "categoryCount";
    pieSeries.dataFields.category = "Category";


    // Let's cut a hole in our Pie chart the size of 30% the radius
    // chart.innerRadius = am4core.percent(30);

    // Put a thick white border around each Slice
    pieSeries.slices.template.stroke = am4core.color("#fff");
    pieSeries.slices.template.strokeWidth = 2;
    pieSeries.slices.template.strokeOpacity = 1;
    pieSeries.slices.template
      .cursorOverStyle = [
        {
          "property": "cursor",
          "value": "pointer"
        }
      ];

    // Create a base filter effect (as if it's not there) for the hover to return to
    let shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter);
    shadow.opacity = 0;

    // Create hover state
    let hoverState: any = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists

    // Slightly shift the shadow and make it more prominent on hover
    let hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
    hoverShadow.opacity = 0.7;
    hoverShadow.blur = 5;
    chart.radius = am4core.percent(100);
    // Add a legend
    chart.legend = new am4charts.Legend();
    chart.legend.maxWidth = 100;
    chart.legend.fontSize = 10;
    chart.legend.scrollable = true;
    chart.legend.position = "bottom";
    chart.legend.contentAlign = "left";

    let markerTemplate = chart.legend.markers.template;
    markerTemplate.width = 15;
    markerTemplate.height = 15;
    pieSeries.labels.template.disabled = true;


    chart.data = this.piChartArray;
  }

  //-------------------------------------------------- agent Profile method's end here -----------------------------------------------------------//

  // --------------------------------------------------  voters data  method's Start here right side panel  -------------------------------------------------- //

  LineChartAgentPerformance() {
    let data1: any = [{
      "VoterCount": 30,
      "FamilyCount": 30,
      "DayName": "Saturday",
      "Date": "15/05/2021"
    },
    {
      "VoterCount": 70,
      "FamilyCount": 40,
      "DayName": "Sunday",
      "Date": "16/05/2021"
    },
    {
      "VoterCount": 50,
      "FamilyCount": 60,
      "DayName": "Monday",
      "Date": "17/05/2021"
    },
    {
      "VoterCount": 10,
      "FamilyCount": 20,
      "DayName": "Tuesday",
      "Date": "18/05/2021"
    },
    {
      "VoterCount": 30,
      "FamilyCount": 40,
      "DayName": "Wednesday",
      "Date": "19/05/2021"
    }];
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    let chart = am4core.create("agentPerformancediv", am4charts.XYChart);

    // Add data


    data1.map((ele: any) => {
      if (ele.Date) {
        let DateFormate = this.commonService.changeDateFormat(ele.Date);
        let transformDate = this.datePipe.transform(DateFormate, 'MMM d');
        ele.Date = transformDate;
      }
    })

    chart.data = data1;


    // Create category axis
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "Date";
    categoryAxis.renderer.opposite = false;

    // Create value axis
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.inversed = false;
    valueAxis.title.text = "Agent Performance Count";
    valueAxis.renderer.minLabelPosition = 0.01;

    // Create series
    let series1 = chart.series.push(new am4charts.LineSeries());
    series1.dataFields.valueY = "VoterCount";
    series1.dataFields.categoryX = "Date";
    series1.name = "VoterCount";
    series1.bullets.push(new am4charts.CircleBullet());
    series1.tooltipText = "{valueY}";
    series1.legendSettings.valueText = "{valueY}";
    series1.visible = false;

    let series2 = chart.series.push(new am4charts.LineSeries());
    series2.dataFields.valueY = "FamilyCount";
    series2.dataFields.categoryX = "Date";
    series2.name = 'FamilyCount';
    series2.bullets.push(new am4charts.CircleBullet());
    series2.tooltipText = "{valueY}";
    series2.legendSettings.valueText = "{valueY}";

    // Add chart cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = "zoomY";


    let hs1 = series1.segments.template.states.create("hover")
    hs1.properties.strokeWidth = 5;
    series1.segments.template.strokeWidth = 1;

    let hs2 = series2.segments.template.states.create("hover")
    hs2.properties.strokeWidth = 5;
    series2.segments.template.strokeWidth = 1;

    // Add legend
    chart.legend = new am4charts.Legend();
    chart.legend.itemContainers.template.events.on("over", function (event: any) {
      let segments = event.target.dataItem.dataContext.segments;
      segments.each(function (segment: any) {
        segment.isHover = true;
      })
    })

    chart.legend.itemContainers.template.events.on("out", function (event: any) {
      let segments = event.target.dataItem.dataContext.segments;
      segments.each(function (segment: any) {
        segment.isHover = false;
      })
    })
  }

  // --------------------------------------------------   voter filter method's  start here   -------------------------------------------------- //

  deafultVoterProfilefilterForm() {
    let toDate: any = new Date();         //selected Date
    let fromDate = new Date((toDate) - 6 * 24 * 60 * 60 * 1000);

    this.voterProfilefilterForm = this.fb.group({
      weekRangePicker: [[fromDate, toDate]],
      ToDate: [],
      FromTo: [],
      Search: [''],
    })

    setTimeout(() => {
      this.voterDateRangeSelect(this.voterProfilefilterForm.value.weekRangePicker);
    }, 1000);
  }

  onKeyUpSearchFilter() {
    this.subject.next();
  }

  searchVoterFilter(flag: any) {
    this.subject.next();
    if (flag == 'true') {
      if (this.voterProfilefilterForm.value.Search == "" || this.voterProfilefilterForm.value.Search == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.votersPaginationNo = 1;
        this.getClientBoothAgentVoterList();
      }
      );
  }

  voterDateRangeSelect(dateRange: any) {
    this.voterProfilefilterForm.value.ToDate = this.datePipe.transform(dateRange[1], 'dd/MM/yyyy');
    this.voterProfilefilterForm.value.fromDate = this.datePipe.transform(dateRange[0], 'dd/MM/yyyy');
  }

  clearFilterVoter(flag: any) {

  }

  onClickPagintionVoters(pageNo: any) {
    this.votersPaginationNo = pageNo;
    this.getClientBoothAgentVoterList();
  }

  // --------------------------------------------------   voter filter method's  end here   -------------------------------------------------- //

  selBothId(data: any) {
    this.allSubAgentsByAgentId.filter((ele: any) => {
      if (data == ele.BoothId) {
        this.selBothIdObj = ele;
        this.getVotersCardData();
      }
    })
  }

  getVotersCardData() {
    this.spinner.show();
    let formData = this.filterForm.value;
    let obj: any = 'AgentId=' + formData.AgentId  + '&ClientId=' + formData.ClientId + '&BoothId=' + formData.BoothId + '&AssemblyId=' + this.selBothIdObj.AssemblyId
      + '&Search=&nopage=' + this.votersPaginationNo + '&FromDate=' + this.voterProfilefilterForm.value.fromDate + '&ToDate=' + this.voterProfilefilterForm.value.ToDate;
    this.callAPIService.setHttp('get', 'Web_Get_Client_Booth_Agent_DailyWork?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.votersCardData = res.data1[0];
        this.getClientBoothAgentVoterList();
      } else {
        this.votersCardData = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      // if (error.status == 500) {
      //   this.router.navigate(['../500'], { relativeTo: this.route });
      // }
    })
  }

  getClientBoothAgentVoterList() {
    this.spinner.show();
    let formData = this.filterForm.value;
    let obj: any = 'AgentId=' + formData.AgentId  + '&ClientId=' + formData.ClientId + '&BoothId=' + formData.BoothId + '&AssemblyId=' + this.selBothIdObj.AssemblyId
      + '&Search=' + this.voterProfilefilterForm.value.Search + '&nopage=' + this.votersPaginationNo + '&FromDate=' + this.voterProfilefilterForm.value.fromDate + '&ToDate=' + this.voterProfilefilterForm.value.ToDate;
    this.callAPIService.setHttp('get', 'Web_Get_Client_Booth_Agent_VoterList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientBoothAgentVoterList = res.data1;
        this.votersTotal = res.data2[0].TotalCount;
        this.defaultVaoterListFlag = true;
      } else {
        this.defaultVaoterListFlag = false;
        this.clientBoothAgentVoterList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      // if (error.status == 500) {
      //   this.router.navigate(['../500'], { relativeTo: this.route });
      // }
    })
  }


  //--------------------------------------------------------- FamiliyCard method's start here -------------------------------------------//

  clickOnFamiliyCard() {
    this.spinner.show();
    let formData = this.filterForm.value;
    let obj: any = 'AgentId=' + formData.AgentId  + '&ClientId=' + formData.ClientId + '&BoothId=' + formData.BoothId + '&AssemblyId=' + this.selBothIdObj.AssemblyId
      + '&Search=' + this.voterProfilefilterForm.value.Search + '&nopage=' + this.familyPaginationNo + '&FromDate=' + this.voterProfilefilterForm.value.fromDate + '&ToDate=' + this.voterProfilefilterForm.value.ToDate;
    this.callAPIService.setHttp('get', 'Web_Get_Client_Agentwise_Booth_Familly_VoterList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientBoothAgentFamiliyList = res.data1;
        this.familyTotal = res.data2[0].TotalCount;
        this.defaultVaoterListFlag = true;
      } else {
        this.defaultVaoterListFlag = false;
        this.clientBoothAgentFamiliyList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      // if (error.status == 500) {
      //   this.router.navigate(['../500'], { relativeTo: this.route });
      // }
    })
  }

  onClickPagintionFamily(pageNo: any) {
    this.familyPaginationNo = pageNo;
    this.clickOnFamiliyCard();
  }

  familyDetails(ParentVoterId: any) {
    let formData = this.filterForm.value;
    let obj = 'ParentVoterId=' + ParentVoterId + '&ClientId=' + formData.ClientId + '&Search=' + this.voterProfilefilterForm.value.Search + '&AgentId=' + formData.AgentId;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_get_Agentwise_FamilyMember?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();;
        this.boothFamilyDetailsArray = res.data1;
      } else {
        this.boothFamilyDetailsArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  //--------------------------------------------------------- FamiliyCard method's start here -------------------------------------------//

  clickOnNewVotersCard() {
    this.spinner.show();
    let formData = this.filterForm.value;
    let obj: any = 'AgentId=' + formData.AgentId + '&ClientId=' + formData.ClientId + '&BoothId=' + formData.BoothId + '&AssemblyId=' + this.selBothIdObj.AssemblyId
      + '&Search=' + this.voterProfilefilterForm.value.Search + '&nopage=' + this.votersPaginationNo + '&FromDate=' + this.voterProfilefilterForm.value.fromDate + '&ToDate=' + this.voterProfilefilterForm.value.ToDate;
    this.callAPIService.setHttp('get', 'Web_Get_Client_Booth_Agent_NewVoterList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientBoothAgentVoterList = res.data1;
        this.votersTotal = res.data2[0].TotalCount;
        this.defaultVaoterListFlag = true;
      } else {
        this.defaultVaoterListFlag = false;
        this.clientBoothAgentVoterList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      // if (error.status == 500) {
      //   this.router.navigate(['../500'], { relativeTo: this.route });
      // }
    })
  }
  // --------------------------------------------------  voters data  method's End  here right side panel -------------------------------------------------- //

  ngOnDestroy() {
    // sessionStorage.removeItem('agents-activity');
  }






}
