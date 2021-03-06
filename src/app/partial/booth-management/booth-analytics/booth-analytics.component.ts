import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounce, debounceTime } from 'rxjs/operators';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

@Component({
  selector: 'app-booth-analytics',
  templateUrl: './booth-analytics.component.html',
  styleUrls: ['./booth-analytics.component.css']
})

export class BoothAnalyticsComponent implements OnInit {
  subject: Subject<any> = new Subject();
  subjectForFamily: Subject<any> = new Subject();
  subjectForVoters: Subject<any> = new Subject();
  searchVoters = new FormControl('');
  clientNameArray: any;
  electionNameArray: any;
  constituencyNameArray: any;
  IsSubElectionApplicable: any;
  villageNameArray: any;
  clientWiseBoothListArray: any;
  cardData: any;
  boothGraphsData: any;

  HighlightRow: any = 0;
  paginationNo: number = 1;
  filterForm!: FormGroup;

  clientIdFlag: boolean = true;
  electionFlag: boolean = true;
  constituencyFlag: boolean = true;
  villageFlag: boolean = true;
  boothFlag: boolean = true;
  dataNotFound: boolean = false;
  boothDataHide: boolean = false;
  clientIdDisabled: boolean = false;
  isAgewiseChart: boolean = false;
  isReligionwiseChart: boolean = false;
  isCasteWiseChart: boolean = false;

  impLeadersList: any;
  impLeadersTotal: any;
  impLeadersPaginationNo = 1;
  //socialSupporterPageSize: number = 10;
  //impLeadersPageSize: number = 10;
 // areaWiseVotersPageSize: number = 10;
  //migrationPatrnPageSize: number = 10;
 // votersPageSize: number = 10;
  //boothvotersPageSize: number = 10;
 // boothFamiliesPageSize: number = 10;
 // boothMigratedPageSize: number = 10;
  //comnIssuePageSize: number = 10;
  areaWiseVotersList: any;
  areaWiseVotersTotal: any;
  commonIssuesList: any;
  migrationPatternList: any;
  professionFamiliesList: any;
  partyVotersList: any;
  isPartyVotersChart: boolean = false;
  isocialMediaSuprtChart: boolean = false;

  areaWiseVoterConfig: any;
  socialSupporterConfig: any;
  votersConfig: any;
  comnIssueConfig: any;
  migrationPatternConfig: any;
  socialMediaSuprtList: any;
  votersList: any;
  supportToid: any;

  selectedBoot: any[] = []
  selectedVillage: any;
  boothwiseVotersList: any;
  AreaId: any = 0;
  IsFilled: any = 0;
  openModal: boolean = false;
  PartyId: any = 0;
  selectedBoothIds: any;
  bootwiseVotersConfig: any;
  bootwiseFamiliesConfig: any;
  bootMigratedConfig: any;

  boothwiseFamiliesList: any
  selectedTitle: any
  selectedVoterCount: any
  ProfessionId: any = 0
  CityName: any
  boothMigratedList: any

  HideVoterListLink : boolean = false;
  boothVoterListPromLeaderArray: any;
  boothFamilyVLPromLeaderArray: any;
  IsPartyCheck: any;
  PartyIdper: any;
  // reverseOrder: boolean = true;
  //sortField = 'LeaderImportance';
  //order: string = 'info.name';
  //reverse: boolean = false;
  //caseInsensitive: boolean = false;
  
 
  //sort(sortField: any) {
  //  this.reverseOrder = (this.sortField === sortField) ? !this.reverseOrder : false;
  //  this.sortField = sortField;
  //};

 
  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
 
  }
  //setOrder(value: string) {
  //  if (this.order === value) {
  //    this.reverse = !this.reverse;
  //  }

  //  this.order = value;
  //}
  ngOnInit(): void { 
    this.defaultFilterForm();
    this.getClientName();
    if (this.commonService.loggedInSubUserTypeId() == 2) {
      this.clientIdFlag = false
      this.clientIdDisabled = true
    } else {
      this.clientIdFlag = true
      this.clientIdDisabled = false
    }
    am4core.addLicense("ch-custom-attribution");
    this.searchMigratedFilters('false');
    this.searchVotersFilters('false');
    this.searchFamiliesFilters('false');   
  }
  defaultFilterForm() {
    this.filterForm = this.fb.group({
      ClientId: [0],
      ElectionId: [0],
      ConstituencyId: [0],
      VillageId: [0],
      BoothId: [0],
      Search: ['']
    })
  }
  getClientName() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_ddl?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientNameArray = res.data1; 
        this.clientNameArray.length == 1 ? (this.filterForm.patchValue({ ClientId: this.clientNameArray[0].id }), this.getElectionName(), this.clientIdFlag = false) : '';
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

  getElectionName() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Election_byClientId_ddl?ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.electionNameArray = res.data1;
        this.electionNameArray.length == 1 ? (this.filterForm.patchValue({ ElectionId: this.electionNameArray[0].ElectionId }), this.IsSubElectionApplicable = this.electionNameArray[0].IsSubElectionApplicable, this.getConstituencyName(), this.electionFlag = false) : '';
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

  getIsSubEleAppId(eleId: any) {
    this.electionNameArray.filter((item: any) => {
      if (item.ElectionId == eleId) {
        this.IsSubElectionApplicable = item.IsSubElectionApplicable;
      }
    })
  }

  getConstituencyName() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Constituency_byClientId_ddl?ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.constituencyNameArray = res.data1;
        this.getIsSubEleAppId(this.filterForm.value.ElectionId);
        this.constituencyNameArray.length == 1 ? ((this.filterForm.patchValue({ ConstituencyId: this.constituencyNameArray[0].ConstituencyId }), this.constituencyFlag = false), this.getVillageName()) : '';
      } else {
        this.constituencyNameArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getVillageName() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&AssemblyId=' + 0 + '&IsSubElectionApplicable=' + this.IsSubElectionApplicable
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Clientwise_BoothVillages?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => { 
      if (res.data == 0) {
        this.spinner.hide();
        this.villageNameArray = res.data1;
        this.villageNameArray.length == 1 ? ((this.filterForm.patchValue({ VillageId: this.villageNameArray[0].VillageId }), this.villageFlag = false), this.ClientWiseBoothList()) : this.ClientWiseBoothList();
      } else {
        this.villageNameArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  ClientWiseBoothList() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&AssemblyId=' + 0 + '&IsSubElectionApplicable=' + this.IsSubElectionApplicable + '&VillageId=' + (this.filterForm.value.VillageId || 0)
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Clientwise_BoothList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientWiseBoothListArray = res.data1;
        //this.clientWiseBoothListArray.length == 1 ? ( this.filterForm.patchValue({ BoothId: this.clientWiseBoothListArray[0].BoothId }), this.boothFlag = false, this.bindData()) : '';
        this.clientWiseBoothListArray.length == 1 ? (this.boothFlag = false, this.bindData()) : this.bindData();
      } else {
        this.clientWiseBoothListArray = [];
        this.spinner.hide();
        this.clearForm();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  bindData() { 
    this.impLeadersPaginationNo = 1;
    this.selectedBoot = [];
    this.selectedBoothIds = [];
    if (this.filterForm.value.BoothId) {
      this.clientWiseBoothListArray.filter((ele: any) => {
        if (this.filterForm.value.BoothId == ele.BoothId) {
          this.selectedBoot.push(ele)
          this.selectedBoothIds.push(ele.BoothId);
        }
       
      })
    } else {
      this.selectedBoothIds = this.clientWiseBoothListArray.map(function (ele: any) {
        return ele.BoothId
      })
      //this.clearForm();
    }
 
      this.villageNameArray.filter((ele: any) => {
        if (this.filterForm.value.VillageId == ele.VillageId) {
          this.selectedVillage = ele;
        }
      })

      this.migrationPatternConfig = { id: 'migrationPatternPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
      this.areaWiseVoterConfig = { id: 'areaWiseVoterPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
      this.socialSupporterConfig = { id: 'socialSupporterPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
      this.votersConfig = { id: 'votersListPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
      this.comnIssueConfig = { id: 'commonIssuePagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
      this.bootwiseVotersConfig = { id: 'boothVotersListPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
      this.bootwiseFamiliesConfig = { id: 'boothFamiliesListPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
      this.bootMigratedConfig = { id: 'boothMigratedPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }

      this.bindMigratedVoters()
      this.boothSummary()
      this.boothSummaryGraphs()
      this.bindProfessionWiseFamilies()
      this.bindImpLeaders()
      this.bindAreaWiseVoters()
      this.bindSocialMediaSuprt()
      this.bindAreaWiseCommonIssues()
      this.viewBoothwiseFamiliesList()
  }

  boothSummary() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&BoothId=' + this.selectedBoothIds
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Booth_Analytics_Summary?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) { 
        this.spinner.hide();
        this.cardData = res.data1[0];
        this.dataNotFound = true;
      } else {
        this.cardData = [];
        this.spinner.hide();
        this.dataNotFound = false;
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  casteWiseChart(obj: any) {
    // Create chart instance
    var chart = am4core.create("castewisediv", am4charts.XYChart);

    // Add data
    chart.data = obj;
   
    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "castname";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

    // Create series
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "TotalVoters";
    series.dataFields.categoryX = "castname";
    series.columns.template.strokeWidth = 0;

    var bullet = series.bullets.push(new am4charts.LabelBullet());
    bullet.label.text = "{valueY}";
    bullet.label.verticalCenter = "bottom";
    bullet.label.dy = -5;

    chart.maskBullets = false;

    series.columns.template.adapter.add("fill", function (fill:any, target:any) { 
      return chart.colors.getIndex(target.dataItem.index);
    })
   
  }

  casteWiseChart1(obj: any) {
    // Create chart instance
    let chart = am4core.create("castewisediv", am4charts.PieChart);
    // Add data
    chart.data = obj;
    // Add and configure Series
    var pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "TotalVoters";
    pieSeries.dataFields.category = "castname";
    pieSeries.ticks.template.disabled = true;
    pieSeries.alignLabels = false;
    pieSeries.labels.template.text = "{category}";
    pieSeries.labels.template.fontSize = 13;
    //pieSeries.labels.template.text = "{value.percent.formatNumber('#.0')}%";
    pieSeries.labels.template.radius = am4core.percent(-40);
    pieSeries.labels.template.fill = am4core.color("white");
    pieSeries.labels.template.align = "right";
    pieSeries.labels.template.textAlign = "end";
    pieSeries.labels.template.adapter.add("radius", function (radius, target) {
      if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        return 0;
      }
      return radius;
    });
    pieSeries.labels.template.adapter.add("fill", function (color, target) {
      if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        return am4core.color("#000");
      }
      return color;
    });
    chart.legend = new am4charts.Legend();
    // chart.legend.align = "right";
    // chart.legend.position = "right";
    chart.legend.contentAlign = "right";
    // chart.legend.width = 600;
    // chart.legend.height = 250;
  }

  religionwiseChart(obj: any)  {
    let chart = am4core.create("religionwisediv", am4charts.PieChart);
    // Add data
    chart.data = obj;

    let colorSet = new am4core.ColorSet();
    let totalVehicleCnt = 0;
    
    // Add and configure Series
    var pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "TotalVoters";
    pieSeries.dataFields.category = "religionname";
    pieSeries.innerRadius = am4core.percent(50);
    pieSeries.ticks.template.disabled = true;
    //pieSeries.labels.template.disabled = false;
    pieSeries.colors = colorSet;


    pieSeries.ticks.template.disabled = true;
    pieSeries.alignLabels = false;
    pieSeries.labels.template.text = "{value.percent.formatNumber('#.0')}%";
    pieSeries.labels.template.fontSize = 13;
    pieSeries.labels.template.radius = am4core.percent(-30);
    pieSeries.labels.template.fill = am4core.color("white");
    pieSeries.slices.template.tooltipText = "{category}: {value.percent.formatNumber('#.0')}%";
    pieSeries.labels.template.align = "right";
    pieSeries.labels.template.textAlign = "end";


    pieSeries.labels.template.adapter.add("radius", function (radius, target) {
      if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        return 0;
      }
      return radius;
    });

    pieSeries.labels.template.adapter.add("fill", function (color, target) {
      if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        return am4core.color("#000");
      }
      return color;
    });

    chart.legend = new am4charts.Legend();
    let marker = chart.legend.markers.template.children.getIndex(0);  
    // chart.legend.align = "right";
    // chart.legend.position = "right";
    chart.legend.valueLabels.template.text = "{value.value}";
    chart.legend.valueLabels.template.align = "left";
    //chart.legend.valueLabels.template.textAlign = "end";

  }

  agewiseVotersChart(obj: any) {  
    am4core.useTheme(am4themes_animated);
    var chart = am4core.create('chartdiv', am4charts.XYChart)
    chart.colors.step = 2;

    chart.legend = new am4charts.Legend()
    chart.legend.position = 'bottom'
    chart.legend.paddingBottom = 20
    chart.legend.labels.template.maxWidth = 95

    var xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
    xAxis.dataFields.category = 'Agegroup'
    xAxis.fontSize = 13;
    xAxis.renderer.cellStartLocation = 0.1
    xAxis.renderer.cellEndLocation = 0.9
    xAxis.renderer.grid.template.location = 0;
    xAxis.renderer.labels.template.fontSize = 10;

    var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.min = 0;
    yAxis.renderer.labels.template.fontSize = 10;

    function createSeries(value:any, name:any) {
      var series = chart.series.push(new am4charts.ColumnSeries())
      series.dataFields.valueY = value
      series.dataFields.categoryX = 'Agegroup'
      series.name = name
      series.columns.template.tooltipText = "{name}: [bold]{valueY}[/]";
      series.columns.template.height = am4core.percent(100);
      series.sequencedInterpolation = true;
      return series;
    }
    chart.data = obj;
    createSeries('TotalFemale', 'Female');
    createSeries('TotalMale', 'Male');
  
    chart.scrollbarX = new am4core.Scrollbar();

  }

  boothSummaryGraphs() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&BoothId=' + this.selectedBoothIds
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Booth_Analytics_Summary_Graphs?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) { 
        this.spinner.hide();
        this.boothGraphsData = res;

        setTimeout(() => { // bind charts
        this.boothGraphsData.data1.length > 0 ? (this.isAgewiseChart = true, this.agewiseVotersChart(this.boothGraphsData.data1)) : this.isAgewiseChart = false;
        this.boothGraphsData.data2.length > 0 ? (this.isReligionwiseChart = true, this.religionwiseChart(this.boothGraphsData.data2)) : this.isReligionwiseChart = false ;
        this.boothGraphsData.data3.length > 0 ? (this.isCasteWiseChart = true, this.casteWiseChart(this.boothGraphsData.data3)) : this.isCasteWiseChart = false;
        }, 500);

       } else {
        this.isAgewiseChart = false
        this.isReligionwiseChart = false
        this.isCasteWiseChart = false
        this.boothGraphsData = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  partywiseVotersChart(obj: any) {

    am4core.useTheme(am4themes_animated);
    var chart = am4core.create('partywiseVoterschartdiv', am4charts.XYChart)
    chart.colors.step = 2;

    chart.legend = new am4charts.Legend()
    chart.legend.position = 'bottom'
    chart.legend.paddingBottom = 20
    chart.legend.labels.template.maxWidth = 95

    var xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
    xAxis.dataFields.category = 'Partyshortcode'
    xAxis.fontSize = 13;
    xAxis.renderer.cellStartLocation = 0.1
    xAxis.renderer.cellEndLocation = 0.9
    xAxis.renderer.grid.template.location = 0;
    xAxis.renderer.labels.template.fontSize = 10;
    xAxis.renderer.minGridDistance = 30;

    var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.min = 0;
    yAxis.renderer.labels.template.fontSize = 10;

    function createSeries(value: any, name: any) {
      var series = chart.series.push(new am4charts.ColumnSeries())
      series.dataFields.valueY = value
      series.dataFields.categoryX = 'Partyshortcode'
      series.name = name

      series.columns.template.tooltipText = "{name}: [bold]{valueY}[/]";
      series.columns.template.height = am4core.percent(100);
      series.sequencedInterpolation = true;
      return series;
    }
    chart.data = obj;
    createSeries("TotalFamily", "Family");
    createSeries("TotalVoter", "Voter");

    chart.scrollbarX = new am4core.Scrollbar();  
  }

  bindProfessionWiseFamilies() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&BoothId=' + this.selectedBoothIds
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Booth_Analytics_Summary_Migration?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        //this.migrationPatternList = res.data1;
        this.professionFamiliesList = res.data2;
        this.partyVotersList = res.data3;
        setTimeout(() => { // bind charts
          this.partyVotersList.length > 0 ? (this.isPartyVotersChart = true, this.partywiseVotersChart(this.partyVotersList)) : this.isPartyVotersChart = false;
        }, 500)
       
      } else {        
        //this.migrationPatternList = [];
        this.professionFamiliesList = [];
        this.partyVotersList = [];
        this.isPartyVotersChart = false
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintionMigrattionPattern(pageNo: any) {
    this.migrationPatternConfig.currentPage = pageNo;
    this.bindMigratedVoters();
  }

  bindMigratedVoters() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&BoothId=' + this.selectedBoothIds + '&nopage=' + this.migrationPatternConfig.currentPage
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Booth_Analytics_MigrationPattern_New?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.migrationPatternList = res.data1;
        this.migrationPatternConfig.totalItems = res.data2[0].TotalCount;
      } else {
        this.migrationPatternList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }
  onClickPagintionImpLeaders(pageNo: any) {
    this.impLeadersPaginationNo = pageNo;
    this.bindImpLeaders();
  }

  bindImpLeaders() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&BoothId=' + this.selectedBoothIds + '&nopage=' + this.impLeadersPaginationNo
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Booth_Analytics_Summary_ImpLeaders?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.impLeadersList = res.data1;
        this.impLeadersTotal = res.data2[0].TotalCount;
      } else {
        this.impLeadersList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintionareaWiseVoters(pageNo: any) {
    this.areaWiseVoterConfig.currentPage = pageNo;
    this.bindAreaWiseVoters();
  }

  bindAreaWiseVoters() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&BoothId=' + this.selectedBoothIds + '&nopage=' + this.areaWiseVoterConfig.currentPage
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Booth_Analytics_Summary_Areawise_Voters?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.areaWiseVotersList = res.data1;
        this.areaWiseVoterConfig.totalItems = res.data2[0].TotalCount;
      } else {
        this.areaWiseVotersList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  socialMediaSuprtChart(obj: any) {
    //SrNo: 1
    //Support: 1
    //SupporterName: "Personal"
    //TotalVoter: 1
    //supportToid: 4

    // Create chart instance
    let chart = am4core.create("socialMediaSuprtdiv", am4charts.PieChart);

    // Add data
    chart.data = obj;

    // Add and configure Series
    var pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "Support";
    pieSeries.dataFields.category = "SupporterName";

    pieSeries.ticks.template.disabled = true;
    pieSeries.alignLabels = false;
    //pieSeries.labels.template.text = "{value}";
    pieSeries.labels.template.fontSize = 10;
    pieSeries.labels.template.text = "{value.percent.formatNumber('#.0')}%";
    pieSeries.labels.template.radius = am4core.percent(-40);
    pieSeries.labels.template.fill = am4core.color("white");

    pieSeries.labels.template.adapter.add("radius", function (radius, target) {
      if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        return 0;
      }
      return radius;
    });

    pieSeries.labels.template.adapter.add("fill", function (color, target) {
      if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        return am4core.color("#000");
      }
      return color;
    });

    chart.legend = new am4charts.Legend();
    chart.legend.position = "right";
    chart.legend.contentAlign = "left";
    chart.legend.valueLabels.template.text = "{category.category}";
    chart.legend.scrollable = true;
  }

  onClickPagintionsocialSupporter(pageNo: any) {
    this.socialSupporterConfig.currentPage = pageNo;
    this.bindSocialMediaSuprt();
  }
  bindSocialMediaSuprt() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&BoothId=' + this.selectedBoothIds + "&nopage=" + this.socialSupporterConfig.currentPage
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Booth_Analytics_Summary_Social_Media_Support?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.socialMediaSuprtList = res.data1;
        this.socialSupporterConfig.totalItems = res.data2[0].TotalCount;
        setTimeout(() => { // bind charts
          this.socialMediaSuprtList.length > 0 ? (this.isocialMediaSuprtChart = true, this.socialMediaSuprtChart(this.socialMediaSuprtList)) : this.isocialMediaSuprtChart = false;
        }, 500)
      } else {
        this.isocialMediaSuprtChart = false
        this.socialMediaSuprtList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintionCommonIssues(pageNo: any) {
    this.comnIssueConfig.currentPage = pageNo;
    this.bindAreaWiseCommonIssues();
  }

  bindAreaWiseCommonIssues() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&BoothId=' + this.selectedBoothIds + '&nopage=' + this.comnIssueConfig.currentPage
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Booth_Analytics_Summary_Areawise_Common_Issues?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.commonIssuesList = res.data1;
        this.comnIssueConfig.totalItems = res.data2[0].TotalCount;
      } else {
        this.commonIssuesList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintionVoters(pageNo: any) {
    this.votersConfig.currentPage = pageNo;
    this.showVotersList(this.supportToid);
  }

  showVotersList(supporter:any) {
    this.supportToid = supporter.SupporterOfId
    this.selectedTitle = supporter.SupporterName
    this.selectedVoterCount = supporter.TotalVoter
    this.votersList = [];
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&BoothId=' + this.selectedBoothIds + '&SupportToid=' + this.supportToid + '&nopage=' + this.votersConfig.currentPage
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Booth_Analytics_Summary_Media_Support_Voterlist?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.votersList = res.data1;
        this.votersConfig.totalItems = res.data2[0].TotalCount;
      } else {
        this.votersList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }
  
  redirectToVoterPrfile(obj: any) {
    window.open('../voters-profile/' + (obj.UserId || obj.userid || obj.AgentId || 0) + '.' + this.filterForm.value.ClientId + '.' + obj.VoterId);
  }

  onClickPartyVoter(obj: any, isFill: any) {
    this.searchVoters.setValue('');
    this.bootwiseVotersConfig.currentPage = 1; this.bootwiseVotersConfig.totalItems = 0;
    this.AreaId = 0; this.PartyId = obj.PartyId;
    this.selectedTitle = obj.PartyName;
    this.selectedVoterCount = obj.TotalVoter;
    this.IsFilled = isFill;
    this.boothwiseVotersList = [];
    if(obj.IsParty == 2){
      this.IsPartyCheck = obj.IsParty;
      this.PartyIdper = obj.PartyId;
      this.boothVLNoSubPromLeader(obj.PartyId);
    }else{
      this.viewBoothwiseVotersList();
    }
  }

  onClickAreaVoter(obj: any, isFill: any, voterType:any) { 
    this.searchVoters.setValue('');
    this.bootwiseVotersConfig.currentPage = 1; this.bootwiseVotersConfig.totalItems = 0;
    this.PartyId = 0; this.AreaId = obj.Id;
    this.selectedTitle = obj.AreaName;
    this.selectedVoterCount = (voterType == 't' ? obj.TotalVoters : obj.UpdatedVoters);
    this.IsFilled = isFill;
    this.boothwiseVotersList = [];
    this.viewBoothwiseVotersList();
  }

  onClickPagintionBoothVoters(pageNo: any) {
    this.bootwiseVotersConfig.currentPage = pageNo;
    if(this.IsPartyCheck == 2){
      this.boothVLNoSubPromLeader(this.PartyIdper);
    }else{
      this.viewBoothwiseVotersList(); 
    } 
  }

  viewBoothwiseVotersList() {   
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&AssemblyId=' + 0 + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.bootwiseVotersConfig.currentPage + '&Search=' + this.searchVoters.value +'&AreaId=' + this.AreaId
      + '&Gender=&HaveMobileNo=0&HaveBussiness=2&PartyId=' + this.PartyId + '&LeadeImp=0&IsYuvak=2&InFavourofId=0&InOpposeOfId=0&AgegroupId=0&FamilySize=0&ReligionId=0&CastId=0&IsFilled=' + this.IsFilled
    this.spinner.show();
    let url = '';
    this.IsSubElectionApplicable == 0 ? url = 'Web_Get_Client_BoothVoterList_1_0_No_SubConsti?' + obj : url = 'Web_Get_Client_BoothVoterList_1_0?' + obj
    this.callAPIService.setHttp('get', url, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.boothwiseVotersList = res.data1;
        this.bootwiseVotersConfig.totalItems = res.data2[0].TotalCount;     
      } else {
        this.boothwiseVotersList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onKeyUpFilterVoters() {
    this.subjectForVoters.next();
  }
  
  searchVotersFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchVoters.value == "" || this.searchVoters == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subjectForVoters
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchVoters.value;
        this.bootwiseVotersConfig.currentPage = 1; this.bootwiseVotersConfig.totalItems = 0;
        this.viewBoothwiseVotersList();
      }
      );
  }

  onKeyUpFilterFamilies() {
    this.subjectForFamily.next();
  }

  searchFamiliesFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchVoters.value == "" || this.searchVoters == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subjectForFamily
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchVoters.value;
        this.bootwiseFamiliesConfig.currentPage = 1; this.bootwiseFamiliesConfig.totalItems = 0;
        this.viewBoothwiseFamiliesList();
      }
      );
  }

  clearFiltersVoters(flag: any) {
    if (flag == 'clearSearchVoters') {
      this.searchVoters.setValue('');
      this.viewBoothwiseVotersList();
    } else if (flag == 'clearSearchFamilies') {
      this.searchVoters.setValue('');
      this.viewBoothwiseFamiliesList();
    } else if (flag == 'clearSearchMigrated') {     
      this.searchVoters.setValue('');
      this.viewMigrationVotersList();
    }
  }

  onClickPagintionBoothFamilies(pageNo: any) {
    this.bootwiseFamiliesConfig.currentPage = pageNo;

    if(this.IsPartyCheck == 2){
      this.boothFamillyVLNoSubPromLeader(this.PartyIdper);
    }else{
      this.viewBoothwiseFamiliesList();
    } 
  }
  onClickFamilyCount(obj: any, isFamily: any) {
    isFamily == 1 && (this.AreaId = 0, this.ProfessionId = 0, this.PartyId = obj.PartyId, this.selectedTitle = obj.PartyName, this.selectedVoterCount = obj.TotalFamily)
    isFamily == 2 && (this.PartyId = 0, this.ProfessionId =0, this.AreaId = obj.Id, this.selectedTitle = obj.AreaName, this.selectedVoterCount = obj.TotalFamily)
    isFamily == 3 && (this.PartyId = 0, this.AreaId = 0, this.ProfessionId = obj.SrNo, this.selectedTitle = obj.Profession, this.selectedVoterCount = obj.TotalVoters)
    this.searchVoters.setValue('');
    this.bootwiseFamiliesConfig.currentPage = 1; this.bootwiseFamiliesConfig.totalItems = 0;
    this.boothwiseFamiliesList = [];
    if(obj.IsParty == 2){
      this.IsPartyCheck = obj.IsParty;
      this.PartyIdper = obj.PartyId;
      this.boothFamillyVLNoSubPromLeader(obj.PartyId);
    }else{
      this.viewBoothwiseFamiliesList();
    }
  }

  viewBoothwiseFamiliesList() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&AssemblyId=' + 0 + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.bootwiseFamiliesConfig.currentPage + '&Search=' + this.searchVoters.value + '&AreaId=' + this.AreaId
      + '&PartyId=' + this.PartyId + '&ProfessionId=' + this.ProfessionId
    this.spinner.show();
    let url = '';
    this.IsSubElectionApplicable == 0 ? url = 'Web_Get_Client_Booth_Familly_VoterList_1_0_No_SubEle?' + obj : url = 'Web_Get_Client_Booth_Familly_VoterList_1_0?' + obj
    this.callAPIService.setHttp('get', url, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.boothwiseFamiliesList = res.data1;
        this.bootwiseFamiliesConfig.totalItems = res.data2[0].TotalCount;
      } else {
        this.boothwiseFamiliesList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onKeyUpFilterMigrated() {
    this.subject.next();
  }

  searchMigratedFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchVoters.value == "" || this.searchVoters == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchVoters.value;
        this.bootMigratedConfig.currentPage = 1; this.bootMigratedConfig.totalItems = 0;
        this.viewMigrationVotersList();
      }
      );
  }
  onClickMigratedCount(obj: any) {
    this.CityName = obj.Migratedcity, this.selectedTitle = obj.Migratedcity, this.selectedVoterCount = obj.TotalVoters
    this.searchVoters.setValue('');
    this.bootMigratedConfig.currentPage = 1; this.bootwiseFamiliesConfig.totalItems = 0;
    this.boothMigratedList = [];
    this.viewMigrationVotersList();
  }

  onClickPagintionBoothMigrated(pageNo: any) {
    this.bootMigratedConfig.currentPage = pageNo;
    this.viewMigrationVotersList();
  }
  viewMigrationVotersList() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&AssemblyId=' + 0 + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.bootMigratedConfig.currentPage + '&Search=' + this.searchVoters.value + '&CityName=' + this.CityName
    this.spinner.show();
    let url = '';
    this.IsSubElectionApplicable == 0 ? url = 'Web_Get_Client_Booth_MigrationCitywise_VoterList_1_0_No_Sub?' + obj : url = 'Web_Get_Client_Booth_MigrationCitywise_VoterList_1_0?' + obj
    this.callAPIService.setHttp('get', url, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.boothMigratedList = res.data1;
        this.bootMigratedConfig.totalItems = res.data2[0].TotalCount;
      } else {
        this.boothMigratedList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  boothFamilyDetailsArray:any
  familyDetails(ParentVoterId: any, AgentId: any) {
    let obj = 'ParentVoterId=' + ParentVoterId + '&AgentId=' + AgentId + '&ClientId=' + this.filterForm.value.ClientId + '&Search=';
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_FamilyMember_1_0?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
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
 // Web_Get_Client_Booth_MigrationCitywise_VoterList_1_0(long ClientId, long UserId, long ElectionId, long ConstituencyId, long AssemblyId, long BoothId, long VillageId, string Search, int nopage, string CityName)
  // ------------------------------------------filter data all methodes start here ------------------------------ //
  
  clearForm() { 
    this.cardData = [];
    this.boothGraphsData = [];
    this.impLeadersList = [];
    this.commonIssuesList = [];
    this.socialMediaSuprtList = [];   
    this.votersList = [];
    this.areaWiseVotersList = [];
    this.impLeadersList = [];
    this.dataNotFound = false;
    this.impLeadersPaginationNo = 1;
  }

  clearFilter(flag: any) {
    if (flag == 'clientId') {
      this.filterForm.reset()
    } else if (flag == 'electionId') {
      this.filterForm.reset({ ClientId: this.filterForm.value.ClientId })
    } else if (flag == 'constituencyId') {
      this.filterForm.reset({ ClientId: this.filterForm.value.ClientId, ElectionId: this.filterForm.value.ElectionId })
    } else if (flag == 'VillageId') {
      this.filterForm.reset({ ClientId: this.filterForm.value.ClientId, ElectionId: this.filterForm.value.ElectionId, ConstituencyId: this.filterForm.value.ConstituencyId })
      this.selectedVillage = '';
    } else if (flag == 'BoothId') {
      this.filterForm.reset({ ClientId: this.filterForm.value.ClientId, ElectionId: this.filterForm.value.ElectionId, ConstituencyId: this.filterForm.value.ConstituencyId, VillageId: this.filterForm.value.VillageId })
      this.clientWiseBoothListArray = [];
      this.filterForm.controls['BoothId'].setValue(0);
    }
    this.clearForm();
  }

  filterData() {
    this.paginationNo = 1;
    // this.getClientAgentWithBooths();
  }

      //................................... nullish FilterForm .....................................//

  nullishFilterForm() {
    let fromData = this.filterForm.value;
    fromData.ClientId ?? this.filterForm.controls['ClientId'].setValue(0);
    fromData.ElectionId ?? this.filterForm.controls['ElectionId'].setValue(0);
    fromData.ConstituencyId ?? this.filterForm.controls['ConstituencyId'].setValue(0);
    fromData.VillageId ?? this.filterForm.controls['VillageId'].setValue(0);
    fromData.BoothId ?? this.filterForm.controls['BoothId'].setValue(0);
    fromData.Search ?? this.filterForm.controls['Search'].setValue('');
  }

  // ........................  Redirect To redToViewBoothWise Voter-List Page ...............................//

  redToViewBoothWiseVoterListPage(){
    this.nullishFilterForm();
    let formData = this.filterForm.value;
    // if(formData.VillageId != 0 && formData.BoothId != 0){

      let obj = {ClientId:formData.ClientId,ElectionId:formData.ElectionId,ConstituencyId:formData.ConstituencyId,
        VillageId:formData.VillageId,BoothId:formData.BoothId,flag:1}
      window.open('../view-boothwise-voters-list/' + obj.ClientId  + '.' + obj.ElectionId + '.' + obj.ConstituencyId
      + '.' + obj.VillageId + '.' + obj.BoothId + '.' + obj.flag);
    // } 
    // else {
    //   if(formData.VillageId != 0){
    //     this.toastrService.error("Please Select Booth.....");
    //   }else if(formData.BoothId != 0){
    //     this.toastrService.error("Please Select Village.....");
    //   } else{
    //     this.toastrService.error("Please Select Village & Booth.....");
    //   }
    // }
  }

  VoterListLinkShowHide(){
  if( this.filterForm.value.VillageId !=0 && this.filterForm.value.BoothId !=0 && this.areaWiseVotersList?.length != 0){
    this.HideVoterListLink = true;
  }
  else{
    this.HideVoterListLink = false;
  }
}

//............................   Prominent Leader Regarding Code Start Here ...................................//


boothVLNoSubPromLeader(PartyId:any) {
  let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&AssemblyId=' + 0 + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.bootwiseVotersConfig.currentPage + '&Search=' + this.searchVoters.value + '&ProminentLeaderId=' + PartyId
  this.spinner.show();
  let url = '';
  this.IsSubElectionApplicable == 0 ? url = 'Web_Get_Client_BoothVoterList_NoSub_PromLeader_1_0?' + obj : url = 'Web_Get_Client_BoothVoterList_PromLeader_1_0?' + obj
  this.callAPIService.setHttp('get', url, false, false, false, 'electionServiceForWeb');
  this.callAPIService.getHttp().subscribe((res: any) => {
    if (res.data == 0) {
      this.spinner.hide();
      this.boothwiseVotersList = res.data1;  // Array Name is Same As viewBoothwiseVotersList();
      this.bootwiseVotersConfig.totalItems = res.data2[0].TotalCount;  
    } else {
      this.boothwiseVotersList = [];
      this.spinner.hide();
    }
  }, (error: any) => {
    this.spinner.hide();
    if (error.status == 500) {
      this.router.navigate(['../500'], { relativeTo: this.route });
    }
  })
}

boothFamillyVLNoSubPromLeader(PartyId:any) {
  let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&AssemblyId=' + 0 + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.bootwiseFamiliesConfig.currentPage + '&Search=' + this.searchVoters.value + '&ProminentLeaderId=' + PartyId
  this.spinner.show();
  let url = '';
  this.IsSubElectionApplicable == 0 ? url = 'Web_Get_Client_Booth_Familly_VoterList_PromLeader_No_SubEle?' + obj : url = 'Web_Get_Client_Booth_Familly_VoterList_1_0_PromLeader_1_0?' + obj
  this.callAPIService.setHttp('get', url, false, false, false, 'electionServiceForWeb');
  this.callAPIService.getHttp().subscribe((res: any) => {
    if (res.data == 0) {
      this.spinner.hide();
      this.boothwiseFamiliesList = res.data1; //  Array Name is Same As viewBoothwiseFamiliesList();
      this.bootwiseFamiliesConfig.totalItems = res.data2[0].TotalCount;
    } else {
      this.boothwiseFamiliesList = [];
      this.spinner.hide();
    }
  }, (error: any) => {
    this.spinner.hide();
    if (error.status == 500) {
      this.router.navigate(['../500'], { relativeTo: this.route });
    }
  })
}

}
