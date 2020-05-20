$(document).ready(function () {
  var visualHeight = $(".main_visual").height();
  var btnElem = $(".btn_wrap");
  var isVisible1 = false;
  var isVisible2 = false;
  var isVisible3 = false;

  $(window).on("scroll", function () {
    // 글쓰기, 탑 버튼 나타내기
    if ($(this).scrollTop() > visualHeight) {
      btnElem.addClass("on");
    } else {
      btnElem.removeClass("on");
    }

    // 스크롤을 내려 섹션의 타이틀(h3)이 보이면 해당 섹션의 막대 차트 생성
    if (checkVisible($("#postingSection h3")) && !isVisible1) {
      createGraph(".posting_chart_table", ".posting_chart");
      searchHighData(".posting_chart", 2, "on"); // 차트1: 2017년 포스팅을 가장 많이 한 달 찾기
      isVisible1 = true;
    }
    if (checkVisible($("#eglooSection h3")) && !isVisible2) {
      createGraph(".hot_egloo_table", ".hot_egloo");
      searchHighData(".hot_egloo", 1, "on"); // 차트2: 내 이글루가 가장 핫했던 달 찾기
      isVisible2 = true;
    }
    if (checkVisible($("#tagValleySection h3")) && !isVisible3) {
      createGraph(".tag_valley_table", ".tag_valley");
      searchHighData(".tag_valley", 1, "tag"); // 차트3: 태그를 많이 발행한 달 찾기
      searchHighData(".tag_valley", 2, "valley"); // 차트3: 밸리를 많이 발행한 달 찾기
      isVisible3 = true;
    }
  });

  // 스크롤을 내리면 특정 영역에서 이벤트가 발생하는 함수
  function checkVisible(elm, eval) {
    eval = eval || "object visible";
    var viewportHeight = $(window).height(), // Viewport Height
      scrolltop = $(window).scrollTop(), // Scroll Top
      y = $(elm).offset().top,
      elementHeight = $(elm).height();

    if (eval == "object visible")
      return y < viewportHeight + scrolltop && y > scrolltop - elementHeight;
    if (eval == "above") return y < viewportHeight + scrolltop;
  }

  // 차트의 가장 높은 데이터를 조회하여 해당 월에 클래스를 추가하는 함수
  function searchHighData(chart, trNum, className) {
    var Arr = new Array();
    $(chart + "_table tr:eq(" + trNum + ") td").each(function (i) {
      // 데이터 담기
      Arr.push(
        $(".posting_chart_table tr:eq(" + trNum + ") td")
          .eq(i)
          .text()
      );
    });
    var index_num = Arr.indexOf(String(Math.max.apply(null, Arr)));
    $(chart + " #figure ul.x-axis li:eq(" + index_num + ")").addClass(
      className
    );
    $(chart + " #figure .bars .bar-group:eq(" + index_num + ")").addClass(
      className
    );
  }

  // 원형 차트 생성
  $(".percent.mobile").percentageLoader({
    valElement: Math.round("strong"),
    strokeWidth: 4,
    bgColor: "#e8e8e8",
    ringColor: "#6481ff",
  });
  $(".percent.pc").percentageLoader({
    valElement: Math.round("strong"),
    strokeWidth: 4,
    bgColor: "#e8e8e8",
    ringColor: "#1ad8f5",
  });

  // 차트 그리기 라이브러리
  function createGraph(data, container) {
    var bars = [];
    var figureContainer = $('<div id="figure"></div>');
    var graphContainer = $('<div class="graph"></div>');
    var barContainer = $('<div class="bars"></div>');
    var data = $(data);
    var container = $(container);
    var chartData;
    var chartYMax;
    var columnGroups;

    var barTimer;
    var graphTimer;

    var tableData = {
      chartData: function () {
        var chartData = [];
        data.find("tbody td").each(function () {
          chartData.push($(this).text());
        });
        return chartData;
      },

      chartLegend: function () {
        var chartLegend = [];
        data.find("tbody th").each(function () {
          chartLegend.push($(this).text());
        });
        return chartLegend;
      },
      chartYMax: function () {
        var chartData = this.chartData();
        var chartYMax =
          Math.ceil(Math.max.apply(Math, chartData) / 1000) * 1000;
        return chartYMax;
      },
      yLegend: function () {
        var chartYMax = this.chartYMax();
        var yLegend = [];
        var yAxisMarkings = 9;
        for (var i = 0; i < yAxisMarkings; i++) {
          yLegend.unshift((chartYMax * i) / (yAxisMarkings - 1) / 1.25);
        }
        return yLegend;
      },
      xLegend: function () {
        var xLegend = [];
        data.find("thead th").each(function () {
          xLegend.push($(this).text());
        });
        return xLegend;
      },
      columnGroups: function () {
        var columnGroups = [];
        var columns = data.find("tbody tr:eq(0) td").length;
        for (var i = 0; i < columns; i++) {
          columnGroups[i] = [];
          data.find("tbody tr").each(function () {
            columnGroups[i].push($(this).find("td").eq(i).text());
          });
        }
        return columnGroups;
      },
    };

    chartData = tableData.chartData();
    chartYMax = tableData.chartYMax();
    columnGroups = tableData.columnGroups();

    $.each(columnGroups, function (i) {
      var barGroup = $('<div class="bar-group"></div>');
      for (var j = 0, k = columnGroups[i].length; j < k; j++) {
        var barObj = {};
        barObj.label = this[j];
        barObj.height = Math.floor((barObj.label / chartYMax) * 100) + "%";
        barObj.bar = $(
          '<div class="bar fig' +
            j +
            '"><span>' +
            barObj.label +
            "</span></div>"
        ).appendTo(barGroup);
        bars.push(barObj);
      }
      barGroup.appendTo(barContainer);
    });

    var chartLegend = tableData.chartLegend();
    var legendList = $('<ul class="legend"></ul>');
    $.each(chartLegend, function (i) {
      var listItem = $(
        '<li><span class="y_icon fig' + i + '"></div></span>' + this + "</li>"
      ).appendTo(legendList);
    });
    legendList.appendTo(figureContainer);

    var xLegend = tableData.xLegend();
    var xAxisList = $('<ul class="x-axis"></ul>');
    $.each(xLegend, function (i) {
      var listItem = $("<li><span>" + this + "</span></li>").appendTo(
        xAxisList
      );
    });
    xAxisList.appendTo(graphContainer);

    var yLegend = tableData.yLegend();
    var yAxisList = $('<ul class="y-axis"></ul>');
    $.each(yLegend, function (i) {
      var listItem = $("<li><span>" + this + "</span></li>").appendTo(
        yAxisList
      );
    });
    yAxisList.appendTo(graphContainer);

    barContainer.appendTo(graphContainer);

    graphContainer.appendTo(figureContainer);

    figureContainer.appendTo(container);

    function displayGraph(bars, i) {
      if (i < bars.length) {
        $(bars[i].bar).animate(
          {
            height: bars[i].height,
          },
          800
        );
        $(".bar span").animate(
          {
            opacity: 1,
          },
          5000
        );
        barTimer = setTimeout(function () {
          i++;
          displayGraph(bars, i);
        }, 100);
      }
    }

    function resetGraph() {
      $.each(bars, function (i) {
        $(bars[i].bar).stop().css({ height: 0 });
      });

      clearTimeout(barTimer);
      clearTimeout(graphTimer);

      graphTimer = setTimeout(function () {
        displayGraph(bars, 0);
      }, 200);
    }

    resetGraph();
  }
});
