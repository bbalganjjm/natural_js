(function(window, N) {

    var CommonController = {
    };

    var CommonMessages = {
		"ko_KR" : {
			"COMM-0001" : "변경된 데이터가 없습니다.",
			"COMM-0002" : "저장이 완료 되었습니다.",
			"COMM-0003" : "데이터를 수정 중 입니다. 선택한 행의 데이터를 조회 하겠습니까?",
			"COMM-0005" : "저장 하겠습니까?",
			"COMM-0006" : " - 입력 : {0} 건",
			"COMM-0007" : " - 수정 : {0} 건",
			"COMM-0008" : " - 삭제 : {0} 건",
			"COMM-0009" : "삭제 하겠습니까?<br/>저장 버튼을 누르기 전까지는 DB 에 반영 되지 않습니다.",
			"COMM-0010" : "선택된 행이 없습니다."
		},
		"en_US" : {
			"COMM-0001" : "No changed data",
			"COMM-0002" : "Saving is complete.",
			"COMM-0003" : "You are on the editing the data. are you sure you want to retrieve the data from the selected row?",
			"COMM-0005" : "Do you want to save it?",
			"COMM-0006" : " - Create : {0} rows",
			"COMM-0007" : " - Update : {0} rows",
			"COMM-0008" : " - Delete : {0} rows",
			"COMM-0009" : "Do you want to delete it?<br/>It will not be stored in the DB until you press the save button.",
			"COMM-0010" : "No rows selected."
		}
	}
    
    var CommonUtils = {
        /**
         * N.grid 나 N.list 에서 체크(check)되거나 선택(select) 된 행들을 삭제하기 위한 함수 - 삭제 전 동의 메시지 다이얼로그 표시 후 remove 함수 호출 등의 반복적인 루틴들을 한번에 처리 해 줍니다.
         * 
         * @this : 호출한 함수 인스턴스
         * @opts.cont : N.cont object
         * @opts.inst : 행을 삭제 할 N.grid 인스턴스 명,
         * @opts.before : 선택한 행을 삭제하기 전 실행 할 함수. 핸들러 함수의 인자로 체크한 행의 index 들을 반환 합니다.
         * @opts.after : 선택한 행을 삭제 한 후 실행 할 함수. 
        */
		del : function(opts) {
			var checkedIndexs = opts.cont[opts.inst].check();
			if(N.isEmptyObject(checkedIndexs)) {
			    checkedIndexs = opts.cont[opts.inst].select();
			}
	        if(opts.before) {
	   			opts.before.call(opts.cont, checkedIndexs);
	   		}
	        
            if(checkedIndexs.length > 0) {
                var isAllAddedLine = true;
                $(checkedIndexs).each(function() {
                    if(opts.cont[opts.inst].data()[this].rowStatus !== "insert") {
                        isAllAddedLine = false;
                    }
                });
                
                if(isAllAddedLine) {
                    opts.cont[opts.inst].remove(checkedIndexs);
                    
                    if(opts.after) {
                        opts.after.call(opts.cont);
                    }             
                } else {
                    N(window).alert({
                        msg : N.message.get(APP.comm.messages, "COMM-0009"),
                        confirm : true,
                        onOk : function() {
                            opts.cont[opts.inst].remove(checkedIndexs);
                            
                            if(opts.after) {
                                opts.after.call(opts.cont);
                            }
                        }
                    }).show(); 
                }
            } else {
				N(window).alert(N.message.get(APP.comm.messages, "COMM-0010")).show();
			}
		},
		/**
		 * 추가, 수정, 삭제된 데이터를 저장 하는 함수 - 저장 전 데이터 검증, 변경 된 데이터 확인, 저장 메시지 다이얼로그 표시등 데이터 저장에 대한 반복적인 루틴들을 한번에 처리 해 줍니다.
		 * 
		 * @this : 호출한 함수 인스턴스
		 * @opts.cont : N.cont object
		 * @opts.comm : 데이터 저장을 처리하는 N.comm 이 정의 된 함수명.
		 * @opts.msg : 저장 확인 메시지, undefined 이면 기본 메시지가 표시 됨.
		 * @opts.changed : 변경 된 데이터 유무를 참조 할 컴포넌트 인스턴스 명.
		 * @opts.validate : 추가/수정 된 데이터의 유효성을 검증할 컴포넌트 인스턴스 명. 
		 * @opts.before : 서버에 저장 하기 전 실행 할 함수. 
		 * @opts.after : 서버에 저장 한 후 실행 할 함수. 
		 */
		save : function(opts) {
	   		if(opts.changed) {
	   			if(opts.cont[opts.changed].data("modified").length === 0) {
	   			    N.notify.add(N.message.get(APP.comm.messages, "COMM-0001"));
		        	return false;
		        }	   			
	   		}

	   		if(opts.validate) {
	   			if(opts.cont[opts.validate] instanceof N.form) {
	   				if(opts.cont[opts.validate].row() > -1) {
			        	if(!opts.cont[opts.validate].validate()) {
			        		return false;
			        	}
			        }	   				
	   			} else {
	   				if(!opts.cont[opts.validate].validate()) {
		        		return false;
		        	}
	   			}
	   		}

	   		if(opts.before) {
	   			opts.before.call(opts.cont);
	   		}
	   		
	        N(window).alert({
	    		msg : opts.msg ? opts.msg : N.message.get(APP.comm.messages, "COMM-0005"),
	    		confirm : true,
	    		onOk : function() {
	    			opts.cont[opts.comm]().submit(function(data) {
	    				var msg = N.message.get(APP.comm.messages, "COMM-0002");
	    				if(data.insert !== undefined && data.update !== undefined && data.delete !== undefined) {
		    				msg += "<br>" + N.message.get(APP.comm.messages, "COMM-0006", [data.insert]);
		    				msg += "<br>" + N.message.get(APP.comm.messages, "COMM-0007", [data.update]);
		    				msg += "<br>" + N.message.get(APP.comm.messages, "COMM-0008", [data.delete]);
	    				}
	    				
	    				N.notify({
	    				    html : true
	    				}).add(msg);
	    				
	    				opts.after.call(opts.cont, data);
	    			});
	    		}
	    	}).show();
	   	},
	   	/**
	   	 * N.grid 나 N.list 의 행을 선택했을 때(onSelect 이벤트 핸들러 함수 이용) N.form 컴포넌트에 같은 데이터를 연동하기 위한 반복적인 루틴들을 한번에 처리 해 줍니다.
	   	 * 
	   	 * @this : 호출한 함수 인스턴스 - onSelect 함수의 this 이므로 N.grid나 N.list 인스턴스
	   	 * @opts.cont : N.cont object
         * @opts.form : 데이터를 연동 할 N.form 인스턴스 명.
         */
	   	selectNBind : function(opts) {
	   		if(opts.args === undefined) {
	   			opts.args = arguments.callee.caller.arguments; 
	   		}
	   		if((opts.args[2][opts.args[0]] !== undefined && opts.args[2][opts.args[0]].rowStatus !== "insert") && opts.cont[opts.form] > -1  && !opts.cont[opts.form].validate()) {
   				return false;
   			}

			if(this.context("> " + (this instanceof N.grid ? "tbody" : "li") + ":eq(" + opts.args[3] + ")").hasClass("row_data_changed__")) {
				if(opts.args[0] !== opts.cont[opts.form].row()) {
					var self = this;
					N(window).alert({
	  					msg : N.message.get(APP.comm.messages, "COMM-0003"),
	   					confirm : true,
	   					onOk : function() {
	   						// bind data to detail form;
	   					    if(opts.dataSync === false) {
	   					        opts.cont[opts.form].bind(0, [opts.args[2][opts.args[0]]]);
	   					    } else {
	   					        opts.cont[opts.form].bind(opts.args[0], opts.args[2]);
	   					    }
	   						opts.args[1].click();
	   					},
	   					onCancel : function() {
	   						self.select(opts.args[3]);
	   					}
   					}).show();
				}
  			} else {
  			    if(opts.dataSync === false) {
  			        opts.cont[opts.form].bind(0, [opts.args[2][opts.args[0]]]);
  			    } else {
  			        opts.cont[opts.form].bind(opts.args[0], opts.args[2]);
  			    }
  			}
	   	},
	   	/**
         * 엑셀 다운로드
         * 
         * 
         */
        excelDownload : function(params, url, filename, columnNames, extColumnNames) {
            if(filename === undefined) {
                return N.error("엑셀 파일명(arguments[0]) 을 입력 하세요.");
            }
          
            if(params) {
                N.browser.cookie("n-excel-params", btoa(encodeURIComponent(JSON.stringify(params))));
            }
            
            N.browser.cookie("n-excel-filename", btoa(encodeURIComponent(filename)));
            
            if(columnNames instanceof N.grid) {
                columnNamesObj = {};
                $(columnNames.tableMap.thead).each(function() {
                    $(this).each(function() {
                        var selfEle = $(this);
                        var id = selfEle.data("id");
                        var thClone = selfEle.clone();
                        thClone.find(">*").remove();
                        var colName = thClone.text();
                        if(!N.string.isEmpty(id)) {
                            columnNamesObj[encodeURIComponent(id)] = encodeURIComponent(thClone.text()); 
                        }
                    });
                });  
                columnNames = columnNamesObj;
            } else {
                for(var k in columnNames) {
                    var v = columnNames[k];
                    delete columnNames[k];
                    columnNames[encodeURIComponent(k)] = encodeURIComponent(v); 
                }
            }
            
            if(extColumnNames) {
                for(var k in extColumnNames) {
                    var v = extColumnNames[k];
                    delete extColumnNames[k];
                    extColumnNames[encodeURIComponent(k)] = encodeURIComponent(v); 
                }
            }
            
            if(columnNames !== undefined) {
                var nExcelColumnNames = btoa(JSON.stringify($.extend(columnNames, extColumnNames)));
                var maxCookieLength = 2048;
                for(var i=0;i<Math.ceil(nExcelColumnNames.length / maxCookieLength);i++) {
                    N.browser.cookie("n-excel-column-names-" + String(i), nExcelColumnNames.substring(i * maxCookieLength, (i+1) * maxCookieLength));
                }
            }
            
            CommonUtils.fileDownload(url);
        },
	   	/**
	   	 * 엑셀 대용량 데이터 다운로드
	   	 * 
	   	 * 대용량 엑셀 데이터 조회시 Heap 메모리 Full 을 발생시키지 않고 빠르게 다운로드 함. 그러나
	   	 * Service 나 Controller 에서 파라미터는 조작 가능하지만 리턴 데이터는 MyBatis 에서 엑셀파일을 바로 생성하기 때문에 조작이 불가능함. 
	   	 */
        excelStreaming : function(params, url, filename, columnNames, extColumnNames) {
	   	    N.browser.cookie("n-excel-stream", btoa("true"));
	   	    CommonUtils.excelDownload(params, url, filename, columnNames, extColumnNames);
	   	},
	   	fileDownload : function(url) {
	   	    location.href = url;
	   	},
	   	/**
	   	 * 파일 요약 목록을 만들어 준다.
	   	 * @fileList : 파일 목록 Array
	   	 * @fileNameCol : 파일명 컬럼명
	   	 * @length : 파일 목록 문자열을 자를 기준 길이
	   	 * @fileButton : 파일팝업 버튼(입력하지 않으면 파일요약목록 문자열을 반환하고 입력하면 버튼 옆에 목록을 표시 해 준다)
	   	 */
	   	createFileSummaryList : function(fileList, fileNameCol, length, fileButton) {
    	   	if(!N.isEmptyObject(fileList)) {
                var fileListStr = N.formatter.limit(N(fileList).map(function() {
                    return this[fileNameCol];
                }).get().join(", "), [length, "..."]);
                
                fileListStr += "(" + fileList.length + ")";
                
                if(fileButton) {
                    fileButton.siblings(".fileSummaryList").remove();
                    fileButton.after('<span class="fileSummaryList">' + fileListStr + '</span>');
                } else {
                    return fileListStr;
                }
            } else {
                if(fileButton) {
                    fileButton.next(".fileSummaryList").text("(0)");                    
                }
            }
	   	},
	   	/**
         * fileId 로 서버에서 업로드 된 파일을 조회 후 파일 요약 목록을 만들어 준다.
         * @fileId : 파일 아이디
         * @fileNameCol : 파일명 컬럼명
         * @length : 파일 목록 문자열을 자를 기준 길이
         * @fileButton : 파일팝업 버튼(입력하지 않으면 파일요약목록 문자열을 반환하고 입력하면 버튼 옆에 목록을 표시 해 준다)
         */
        getFileSummaryList : function(fileId, fileNameCol, length, fileButton) {
            N({ "fileId" : fileId }).comm("file/getFileList.json").submit(function(fileList) {
                CommonUtils.createFileSummaryList(fileList, fileNameCol, length, fileButton);
            });
        }
    }
    
    if(!window.APP) {
        window.APP = {};
    }
    window.APP.comm = CommonController;
    window.APP.comm.utils = CommonUtils;
    window.APP.comm.messages = CommonMessages;
    
    // N.comm 에 Excel 다운로드 기능 확장
    N.comm.excelDownload = function(args) {
        if(args === undefined || args.length === 0) {
            return N.error("엑셀 파일명(arguments[0]) 을 입력 하세요.");
        }
        var url = this.request.options.url;
        if(url.indexOf(".") < 0) {
            url += ".xlsx";
        } else {
            url = url.replace(".json", ".xlsx");
        }
        CommonUtils.excelDownload.call(this, this.request.options.data ? JSON.parse(this.request.options.data) : undefined, url, args[0], args[1], args[2]);
        return this;
    };
    N.comm.excelStreaming = function(args) {
        if(args === undefined || args.length === 0) {
            return N.error("엑셀 파일명(arguments[0]) 을 입력 하세요.");
        }
        var url = this.request.options.url;
        if(url.indexOf(".") < 0) {
            url += ".xlsx";
        } else {
            url = url.replace(".json", ".xlsx");
        }
        CommonUtils.excelStreaming.call(this, this.request.options.data ? JSON.parse(this.request.options.data) : undefined, url, args[0], args[1], args[2]);
        return this;
    };
    
    /**
     * N.grid 에 Excel 업로드 기능 확장
     * 
     * header : JSON Object 키값 - 엑셀 컬럼 순서대로 JSON Object 의 키값을 정의(필수)
     * opts : 추가 옵션 오브젝트(선택)
     *  - start : 데이터로 추출 할 시작 엑셀 행 인덱스
     *  - mode : 데이터 바인드 모드 - insert 면 무조건 INSERT, update 면 pk 로 지정한 행 데이터가 있으면 UPDATE, 없으면 INSERT
     *  - pk : mode 옵션이 update 일 때 INSERT, UPDATE 를 판단 할 기준 키 컬럼 명
     *  - server : JSON 데이터를 추출 하기 위해 Excel 파일을 Server 에 업로드 하여 처리 할 것인지 브라우저에서 javascript 로 처리 할 것인지 여부(boolean)
     *  - after : 엑셀 데이터 추출 완료 후 실행 할 콜백 함수(함수의 첫번째 인자로 추출 된 JSON 타입의 엑셀 데이터가 반환 됨)
     */
    N.grid.prototype.bindExcel = function(header, opts) {
        var self = this;
        
        if(opts === undefined) {
            opts = {};
        }
        if(opts.start === undefined) {
            opts.start = 1;
        }
        if(opts.mode === undefined) {
            opts.mode = "update";
        }
        
        var fileInput = N('<input type="file" name="xlsxFile" class="excel_import__" style="display: none;" />').appendTo(self.context());
        
        var rABS = !N.browser.is("ie");
        
        if(opts.mode === "update" && !$.isEmptyObject(opts.pk)) {
            var gridDataStr = JSON.stringify(self.options.data.get());
            var i=0;
            var isDupPk = function(pk, xlsxRowData) {
                if(self.options.data.length === 0) {
                    return false;
                }
                
                var keyObj;
                var isDupKeys = [];
                $(pk).each(function(i, k) {
                    if(xlsxRowData[k]) {
                        keyObj = {};
                        keyObj[k] = xlsxRowData[k];
                        if(gridDataStr.indexOf(JSON.stringify(keyObj).replace("{", "").replace("}", "")) > -1) {
                            isDupKeys.push(true);
                        } else {
                            isDupKeys.push(false);
                        }
                        keyObj = undefined;
                    } else {
                        N.warn("데이터에 PK 로 지정한 \"" + k + "\" 컬럼이 없습니다.");
                    }
                });
                
                if(isDupKeys.join(",").indexOf("false") < 0) {
                    isDupKeys = undefined;
                    return true;                        
                } else {
                    isDupKeys = undefined;
                    return false;
                }
            };
        }
        
        fileInput.on("change", function(e) {
            var files = this.files;
            
            if(opts.server) {
                var formData = new FormData();
                formData.append("xlsxFile", files[0]);
                if(header) {
                    formData.append("header", header);
                }
                formData.append("start", opts.start);
                
                opts.header = header;
                N.comm({
                    url: "file/getDataListFromXlsx.json",
                    data : formData,
                    type: "POST",
                    contentType: false,
                    processData: false,
                    cache: false,
                    dataType: "json"
                }).error(function() {
                    N.notify.add("서버 오류가 발생 했거나 업로드 된 엑셀 파일이 양식에 맞지 않아 데이터 추출을 하지 못 했습니다.");
                }).submit(function(data) {
                    N(data).each(function(i, rowData) {
                        if(opts.mode === "insert" || $.isEmptyObject(opts.pk)) {
                            rowData.rowStatus = "insert";
                        } else if(opts.mode === "update") {
                            if(isDupPk.call(self, opts.pk, rowData)) {
                                rowData.rowStatus = "update";
                            } else {
                                rowData.rowStatus = "insert";
                            }
                        }
                    });
                    isDupPk = undefined;                        
                    
                    self.bind(data);
                    
                    if(opts.after) {
                        opts.after.call(self, data);
                    }
                });
                return false;
            }
            
            var i,f;
            for (i = 0; i != files.length; ++i) {
                f = files[i];
                var reader = new FileReader();
                var name = f.name;
                
                var fixdata = function(data) {
                    var o = "", l = 0, w = 10240;
                    for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
                    o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
                    return o;
                }

                reader.onload = function(e) {
                    var data = e.target.result;
         
                    var workbook;
         
                    if(rABS) {
                        workbook = XLSX.read(data, {type: 'binary'});
                    } else {
                        var arr = fixdata(data);
                        workbook = XLSX.read(btoa(arr), {type: 'base64'});
                    }
         
                    if(workbook.SheetNames && workbook.SheetNames.length > 0) {
                        var json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
                            range : opts.start,
                            header : header
                        });
                    
                        $(json).each(function(i, rowData) {
                            if(opts.mode === "insert" || $.isEmptyObject(opts.pk)) {
                                rowData.rowStatus = "insert";
                            } else if(opts.mode === "update") {
                                if(isDupPk.call(self, opts.pk, rowData)) {
                                    rowData.rowStatus = "update";
                                } else {
                                    rowData.rowStatus = "insert";
                                }
                            }
                        });
                        
                        gridDataStr = undefined;
                        
                        self.bind(json);
                        
                        fileInput.remove();
                    };
                };
         
                if(rABS) {
                    reader.readAsBinaryString(f);
                } else {
                    reader.readAsArrayBuffer(f);
                }
            }
        });
        
        fileInput.click();
    }
    
})(window, N);