## Natural-UI v0.38.238
 * N.tab : Fixed a bug where the tab scroll element's margin value was set incorrectly or an error occurred on mobile when the tab scroll option was true and there was no tab scroll related element("a" tag).
 * N.alert : Fixed a bug that caused an error when specifying the context as a window object when creating an instance of N.alert directly with new.
 * N.grid : A "pastiable" option for pasting cell data copied from Excel to the grid has been added.
 * N.grid, N.list : The val method has been enhanced to change the values ​​of rows that have not yet been created by scroll paging.
 * N.grid, N.list : Added an error message about errors that occur when a row index that is not in the data is specified with the val method.
 * N.datepicker : yearsPanelPosition true 로 설정 되었을때 yearChangeInput 옵션이 false 이면 연도를 바꿔도 달력이 갱신되지 않는 버그가 수정 되었습니다.
 * N.datepicker : minDate 와 maxDate 옵션이 되었습니다. 이 옵션들을 통해서 선택할 수 있는 일자를 지정 할 수 있습니다.
 * N.datepicker : holiday 옵션이 추가되 었습니다. 이 옵션에 휴일 데이터 객체를 넣으면 Datepicker 에 표시 해 줍니다.

## Natural-DATA v0.10.72
 *

## Natural-ARCHITECTURE v0.13.11
 *

## Natural-CORE v0.18.26
 * N.date.dateList : Fixed a bug where the date was returned as NaN in Internet Explorer.

## Natural-UI.Shell v0.9.47
 * Edited comments and error messages.

## natural.ui.css
 * Changed N.pagination, N.datepicker realted styles.
 * Fixed font-size has been removed.
 * Changed fixedcol option related styles of N.grid.
 * Added scrollbar style on webkit based browsers.
 * Changed detail view of more option style.

##natural.config.js
 * Changed misc option related values of N.grid.
 * Removed unnecessary setting values ​​and edited a comment.

## For more information on added and changed features, refer to the API manual(http://bbalganjjm.github.io/natural_js/)