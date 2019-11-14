/**
 * G740Viewer
 * Copyright 2017-2019 Galinsky Leonid lenq740@yandex.ru
 * Licensed under the BSD license
 */

define(
	[],
	function() {
		if (typeof(g740)=='undefined') g740={};
		
// g740.PanelTitle - виджет: заголовок панели
		dojo.declare(
			'g740.PanelTitle',
			[dijit._Widget, dijit._TemplatedMixin],
			{
				templateString: '<div class="g74-paneltitle" data-dojo-attach-point="titleNode"></div>',
			    //templateString: '<div style="border-style:none"><h4 data-dojo-attach-point="titleNode"></h4></div>',
			    title: '',
				_setTitleAttr: { node: "titleNode", type: "innerHTML" }
			}
		);
// g740.PanelSeparator - виджет для отступа между панелями
		dojo.declare(
			'g740.PanelSeparator',
			[dijit._Widget, dijit._TemplatedMixin],
			{
			    templateString: '<div></div>',
			    height: '0px',
				set: function(name, value) {
					if (name=='height') {
						this.height=value;
						if (this.domNode) {
							dojo.style(this.domNode, 'height', this.height);
						}
					}
					else {
						this.inherited(arguments);
					}
				},
				postCreate: function() {
					if (this.domNode) {
						dojo.style(this.domNode, 'height', this.height);
					}
					this.inherited(arguments);
				}
			}
		);
// g740.Paginator - виджет: пагнатор
		dojo.declare(
			'g740.Paginator',
			[dijit._Widget, dijit._TemplatedMixin],
			{
				templateString: 
					'<div class="g740-paginator">'+
						'<div class="paginator-center">'+
							'<div class="btn btn-first" '+
								'data-dojo-attach-point="domNodeBtnFirst" '+
								'data-dojo-attach-event="onclick: onBtnFirstClick" '+
							'></div>'+
							'<div class="btn btn-prev" '+
								'data-dojo-attach-point="domNodeBtnPrev" '+
								'data-dojo-attach-event="onclick: onBtnPrevClick" '+
							'></div>'+
							
							'<div class="pages" data-dojo-attach-point="domNodePaginatorPage"></div>'+
							
							'<div class="btn btn-next" '+
								'data-dojo-attach-point="domNodeBtnNext" '+
								'data-dojo-attach-event="onclick: onBtnNextClick" '+
							'></div>'+
							'<div class="btn btn-last" '+
								'data-dojo-attach-point="domNodeBtnLast" '+
								'data-dojo-attach-event="onclick: onBtnLastClick" '+
							'></div>'+
							'<div style="clear:both"></div>'+
						'</div>'+
					'</div>',
				rowsetName: null,
				objForm: null,
				objRowSet: null,
				isPrevEnabled: true,
				isNextEnabled: true,
				set: function(name, value) {
					if (name=='objForm') {
						this.objForm=value;
						if (this.objForm && this.rowsetName) {
							this.objRowSet=this.objForm.rowsets[this.rowsetName];
						}
						return true;
					}
					if (name=='rowsetName') {
						this.rowsetName=value;
						if (this.objForm && this.rowsetName) {
							this.objRowSet=this.objForm.rowsets[this.rowsetName];
						}
						return true;
					}
					if (name=='isPrevEnabled') {
						this.isPrevEnabled=value;
						if (this.domNodeBtnFirst && this.domNodeBtnPrev) {
							if (this.isPrevEnabled) {
								if (dojo.hasClass(this.domNodeBtnFirst,'disabled')) dojo.removeClass(this.domNodeBtnFirst,'disabled');
								if (dojo.hasClass(this.domNodeBtnPrev,'disabled')) dojo.removeClass(this.domNodeBtnPrev,'disabled');
							} else {
								if (!dojo.hasClass(this.domNodeBtnFirst,'disabled')) dojo.addClass(this.domNodeBtnFirst,'disabled');
								if (!dojo.hasClass(this.domNodeBtnPrev,'disabled')) dojo.addClass(this.domNodeBtnPrev,'disabled');
							}
						}
					}
					if (name=='isNextEnabled') {
						this.isNextEnabled=value;
						if (this.domNodeBtnFirst && this.domNodeBtnPrev) {
							if (this.isNextEnabled) {
								if (dojo.hasClass(this.domNodeBtnLast,'disabled')) dojo.removeClass(this.domNodeBtnLast,'disabled');
								if (dojo.hasClass(this.domNodeBtnNext,'disabled')) dojo.removeClass(this.domNodeBtnNext,'disabled');
							} else {
								if (!dojo.hasClass(this.domNodeBtnLast,'disabled')) dojo.addClass(this.domNodeBtnLast,'disabled');
								if (!dojo.hasClass(this.domNodeBtnNext,'disabled')) dojo.addClass(this.domNodeBtnNext,'disabled');
							}
						}
					}
					this.inherited(arguments);
				},
				destroy: function() {
					this.objForm=null;
					this.objRowSet=null;
					this.inherited(arguments);
				},
				postCreate: function() {
					this.set('isPrevEnabled',false);
					this.set('isNextEnabled',false);
					this.domNodeBtnFirst.title=g740.getMessage('paginatorFirst');
					this.domNodeBtnPrev.title=g740.getMessage('paginatorPrev');
					this.domNodeBtnNext.title=g740.getMessage('paginatorNext');
					this.domNodeBtnLast.title=g740.getMessage('paginatorLast');
					
					this.repaint();
					this.inherited(arguments);
				},
			    
				repaint: function() {
					if (!this.domNodePaginatorPage) return true;
					this.domNodePaginatorPage.innerHTML='';
					var pageCount=this.getPageCount();
					if (pageCount==1) return true;
					
					var pageIndex=this.getPageIndex();
					if (Math.floor(pageIndex/2)*2==pageIndex) {
						var pageIndexFirst=pageIndex-2;
					}
					else {
						if (Math.floor((pageIndex-1)/4)*4==(pageIndex-1)) {
							var pageIndexFirst=pageIndex-1;
						}
						else {
							var pageIndexFirst=pageIndex-3;
						}
					}
					
					if (pageIndexFirst>=pageCount-5) pageIndexFirst=pageCount-5;
					if (pageIndexFirst<0) pageIndexFirst=0;
					for(var i=0; i<5; i++) {
						var pg=pageIndexFirst+i;
						if (pg>=pageCount) break;
						var domItem=document.createElement('div');
						domItem.setAttribute('data-page', pg);
						dojo.addClass(domItem, 'item');
						dojo.on(domItem, 'click', dojo.hitch(this, this.onPageClick));
						if (pg==pageIndex) dojo.addClass(domItem, 'current');
						var domText=document.createTextNode(pg+1);
						domItem.appendChild(domText);
						this.domNodePaginatorPage.appendChild(domItem);
					}
					var domItem=document.createElement('div');
					domItem.style.clear='both';
					this.domNodePaginatorPage.appendChild(domItem);
					
				},
				onPageClick: function(evt) {
					if (!evt) return true;
					var domItem=evt.target;
					var pageIndex=domItem.getAttribute('data-page');
					this.execRefreshPage(pageIndex);
				},
				doG740Repaint: function (para) {
					if (!para) para={};
					if (!para.objRowSet) return true;
					if (para.objRowSet.name!=this.rowsetName) return true;
					if (!para.isFull) return true;
					if (!para.objRowSet.paginatorCount || !para.objRowSet.paginatorAll) {
						this.set('isPrevEnabled',false);
						this.set('isNextEnabled',false);
						return true;
					}

					var pageCount=this.getPageCount();
					var pageIndex=this.getPageIndex();
					this.set('isPrevEnabled',pageIndex>0);
					this.set('isNextEnabled',pageIndex<(pageCount-1));
					this.repaint();
			    },
				getPageCount: function() {
					if (!this.objRowSet) return 0;
					var paginatorCount=Math.floor(this.objRowSet.paginatorCount*0.9);
					if (paginatorCount==0) paginatorCount=1;
					
					var result=Math.floor((this.objRowSet.paginatorAll-0.5*paginatorCount)/paginatorCount)+1;
					if (result<1) result=1;
					return result;
				},
				getPageIndex: function() {
					if (!this.objRowSet) return 0;
					var paginatorCount=Math.floor(this.objRowSet.paginatorCount*0.9);
					if (paginatorCount==0) paginatorCount=1;
					
					var pageCount=this.getPageCount();
					var result=Math.floor(this.objRowSet.paginatorFrom/paginatorCount);
					if (result>=pageCount) result=pageCount-1;
					return result;
				},
				getPageFrom: function(pageIndex) {
					if (!this.objRowSet) return 0;
					var paginatorCount=Math.floor(this.objRowSet.paginatorCount*0.9);
					if (paginatorCount==0) paginatorCount=1;
					
					var pageCount=this.getPageCount();
					if (pageIndex>=pageCount) pageIndex=pageCount-1;
					if (pageIndex<0) pageIndex=0;
					return pageIndex*paginatorCount;
				},
				
				execRefreshPage: function(pageIndex) {
					if (!this.objRowSet) return true;
					var pageCount=this.getPageCount();
					if (pageIndex<0) pageIndex=0;
					if (pageIndex>(pageCount-1)) pageIndex=pageCount-1;
					
					var G740params={
						'paginator.from': this.getPageFrom(pageIndex)
					};
					if (pageIndex==(pageCount-1)) {
						G740params['paginator.count']=this.objRowSet.paginatorCount*3;
					}
					this.objRowSet.exec({
						requestName: 'refresh',
						G740params: G740params
					});
				},
				onBtnFirstClick: function() {
					if (!this.isPrevEnabled) return true;
					this.execRefreshPage(0);
				},
				onBtnPrevClick: function() {
					if (!this.isPrevEnabled) return true;
					var pageIndex=this.getPageIndex();
					this.execRefreshPage(pageIndex-1);
				},
				onBtnNextClick: function() {
					if (!this.isNextEnabled) return true;
					var pageIndex=this.getPageIndex();
					this.execRefreshPage(pageIndex+1);
				},
				onBtnLastClick: function() {
					if (!this.isNextEnabled) return true;
					var pageCount=this.getPageCount();
					this.execRefreshPage(pageCount-1);
				}
			}
		);
// g740.TextBox - виджет: строковый редактор с кнопкой вызова диалога
		dojo.declare(
			'g740.TextBox',
			[dijit._Widget, dijit._TemplatedMixin],
			{
				templateString: '<div class="g740-widget-text" data-dojo-attach-event="'+
					'onblur: onBlur, onfocus: onFocus'+
				'">'+
					'<table class="g740-widget-table" cellpadding="0px" cellspacing="0px">'+
					'<tr>'+
						'<td class="g740-widget-td-input">'+
							'<input type="text" class="g740-widget-input" '+
							'data-dojo-attach-point="domNodeInput" data-dojo-attach-event="'+
							'onkeydown: onKeyDown, onkeyup: onKeyUp, onkeypress: onKeyPress, onchange: doInputChange, ondblclick: onInputDblClick'+
							'"/>'+
							'<div class="btnfieldclear" title="'+g740.getMessage('messageBtnClear')+'" '+
							'data-dojo-attach-event="onclick: onClearClick"></div>'+
						'</td>'+
						'<td style="width:0px;display:none" valign="top" align="center" data-dojo-attach-point="domNodeTdButton">'+
							'<div class="btnfieldeditor" data-dojo-attach-event="'+
							'onclick: onButtonClick'+
							'"></div>'+
						'</td>'+
					'</tr>'+
					'</table>'+
				'</div>',
				buttonVisible: false,
				_readOnly: false,
				_buttonOnly: false,
				colorReadOnly: 'gray',
				set: function(name, value) {
					if (name=='value') {
						this.domNodeInput.value=value;
						return true;
					}
					if (name=='readOnly' || name=='buttonOnly') {
						if (name=='readOnly') this._readOnly=value;
						if (name=='buttonOnly') this._buttonOnly=value;
						
						if (this.colorReadOnly) {
							//dijitTextBoxReadOnly
							var classColorReadOnly='g740-color-'+this.colorReadOnly;
							if (this._readOnly) {
								dojo.addClass(this.domNodeInput, classColorReadOnly);
							}
							else {
								dojo.removeClass(this.domNodeInput, classColorReadOnly);
							}
						}
						if (this._readOnly || this._buttonOnly) {
							this.domNodeInput.readOnly=true;
							if (!dojo.hasClass(this.domNodeInput.parentNode, 'readonly')) dojo.addClass(this.domNodeInput.parentNode, 'readonly');
						}
						else {
							this.domNodeInput.readOnly=false;
							if (dojo.hasClass(this.domNodeInput.parentNode, 'readonly')) dojo.removeClass(this.domNodeInput.parentNode, 'readonly');
						}
						
						if (this._buttonOnly && !this._readOnly) {
							if (!dojo.hasClass(this.domNodeInput.parentNode, 'cursorpointer')) dojo.addClass(this.domNodeInput.parentNode, 'cursorpointer');
						}
						else {
							if (dojo.hasClass(this.domNodeInput.parentNode, 'cursorpointer')) dojo.removeClass(this.domNodeInput.parentNode, 'cursorpointer');
						}
						
						return true;
					}
					if (name=='buttonVisible' && this.buttonVisible!=value) {
						if (value) {
							dojo.style(this.domNodeTdButton, 'width', '23px');
							dojo.style(this.domNodeTdButton, 'display', 'table-cell');
						}
						else {
							dojo.style(this.domNodeTdButton, 'width', '0px');
							dojo.style(this.domNodeTdButton, 'display', 'none');
						}
						this.buttonVisible=value;
					}
					this.inherited(arguments);
				},
				postCreate: function() {
					this.inherited(arguments);
					this.focusNode=this.domNodeInput;
				},
				doSelect: function() {
					if (this.domNodeInput.readOnly) return;
					var value=this.domNodeInput.value;
					var cursorPos=String(value).length;
					if (this.domNodeInput.setSelectionRange) {
						this.domNodeInput.setSelectionRange(0,cursorPos);
					}
					else if (this.domNodeInput.createTextRange) {
						var range=this.domNodeInput.createTextRange();
						range.collapse(true);
						range.moveStart('character', 0);
						range.moveEnd('character', cursorPos);
						range.select();
					}
				},
				onInputDblClick: function() {
					if (this._buttonOnly) this.onButtonClick();
				},
				onButtonClick: function() {
				},
				onClearClick: function() {
				},
				onKeyDown: function(evt) {
				},
				onKeyUp: function(evt) {
				},
				onKeyPress: function(evt) {
				},
				doInputChange: function(evt) {
					this.onChange(this.domNodeInput.value);
				},
				onChange: function(newValue) {
				},
				onBlur: function() {
				},
				onFocus: function() {
					g740.execDelay.go({
						delay: 50,
						obj: this,
						func: this.doSelect
					});
				}
				
			}
		);
// g740.Memo - виджет: Memo редактор с кнопкой вызова диалога
		dojo.declare(
			'g740.Memo',
			[dijit._Widget, dijit._TemplatedMixin],
			{
				templateString: '<div class="g740-widget-text" data-dojo-attach-event="'+
					'onblur: onBlur, onfocus: onFocus'+
				'">'+
					'<table class="g740-widget-table" cellpadding="0px" cellspacing="0px">'+
					'<tr>'+
						'<td class="g740-widget-td-input">'+
							'<textarea class="g740-widget-textarea" style="height:100%"'+
							'data-dojo-attach-point="domNodeTextArea" data-dojo-attach-event="'+
							'onkeydown: onKeyDown, onkeyup: onKeyUp, onkeypress: onKeyPress, onchange: doTextAreaChange, ondblclick: onInputDblClick'+
							'">'+
							'</textarea>'+
						'</td>'+
						'<td style="width:23px" valign="top" align="center">'+
							'<div class="btnfieldeditor" data-dojo-attach-event="'+
							'onclick: onButtonClick'+
							'"></div>'+
						'</td>'+
					'</tr>'+
					'</table>'+
				'</div>',
				_readOnly: false,
				_buttonOnly: false,
				colorReadOnly: 'gray',
				set: function(name, value) {
					if (name=='value') {
						this.domNodeTextArea.value=value;
						return true;
					}
					if (name=='readOnly' || name=='buttonOnly') {
						if (name=='readOnly') this._readOnly=value;
						if (name=='buttonOnly') this._buttonOnly=value;
						this.domNodeTextArea.readOnly=(this._readOnly || this._buttonOnly);

						if (this.colorReadOnly) {
							// dijitTextBoxReadOnly
							var classColorReadOnly='g740-color-'+this.colorReadOnly;
							if (this._readOnly) {
								dojo.addClass(this.domNodeTextArea, classColorReadOnly);
							}
							else {
								dojo.removeClass(this.domNodeTextArea, classColorReadOnly);
							}
						}

						if (this._buttonOnly && !this._readOnly) {
							if (!dojo.hasClass(this.domNodeTextArea.parentNode, 'cursorpointer')) dojo.addClass(this.domNodeTextArea.parentNode, 'cursorpointer');
						}
						else {
							if (dojo.hasClass(this.domNodeTextArea.parentNode, 'cursorpointer')) dojo.removeClass(this.domNodeTextArea.parentNode, 'cursorpointer');
						}
						return true;
					}
					this.inherited(arguments);
				},
				postCreate: function() {
					this.inherited(arguments);
					this.focusNode=this.domNodeTextArea;
				},
				onInputDblClick: function() {
					if (this._buttonOnly) this.onButtonClick();
				},
				onButtonClick: function() {
				},
				onKeyDown: function(evt) {
				},
				onKeyUp: function(evt) {
				},
				onKeyPress: function(evt) {
				},
				doTextAreaChange: function(evt) {
					this.onChange(this.domNodeTextArea.value);
				},
				onChange: function(newValue) {
				},
				onBlur: function() {
				},
				onFocus: function() {
				}
			}
		);
// g740.ComboBox - виджет: Текстовый редактор с кнопкой вызова диалога
		dojo.declare(
			'g740.ComboBox',
			[dijit._Widget, dijit._TemplatedMixin],
			{
				templateString: '<div class="g740-combobox g740-widget-text" data-dojo-attach-event="'+
					'onblur: onBlur, onfocus: onFocus'+
				'">'+
					'<table class="g740-widget-table" cellpadding="0px" cellspacing="0px">'+
					'<tr>'+
						'<td class="g740-widget-td-input">'+
							'<input type="text" class="g740-widget-input" '+
							'data-dojo-attach-point="domNodeInput" data-dojo-attach-event="'+
							'onkeydown: onKeyDown, onkeyup: onKeyUp, onkeypress: onKeyPress, onchange: doInputChange, ondblclick: onInputDblClick'+
							'">'+
							'<div class="btnfieldclear" title="'+g740.getMessage('messageBtnClear')+'" '+
							'data-dojo-attach-event="onclick: onClearClick"></div>'+
						'</td>'+
						'<td style="width:23px" valign="top" align="center">'+
							'<div class="btnfieldeditor" data-dojo-attach-event="'+
							'onclick: onButtonClick'+
							'"></div>'+
						'</td>'+
					'</tr>'+
					'</table>'+
				'</div>',
				_readOnly: false,
				_buttonOnly: false,
				_value: '',
				colorReadOnly: 'gray',
				getReadOnly: function() {
					return this._readOnly;
				},
				set: function(name, value) {
					if (name=='value') {
						if (this.domNodeInput) {
							this.domNodeInput.value=value;
							this._value=value;
						}
						return true;
					}
					if (name=='readOnly' || name=='buttonOnly') {
						if (name=='readOnly') this._readOnly=value;
						if (name=='buttonOnly') this._buttonOnly=value;
						var inputReadOnly=(this._readOnly || this._buttonOnly);

						if (this.colorReadOnly) {
							// dijitTextBoxReadOnly
							var classColorReadOnly='g740-color-'+this.colorReadOnly;
							if (this._readOnly) {
								dojo.addClass(this.domNodeInput, classColorReadOnly);
							}
							else {
								dojo.removeClass(this.domNodeInput, classColorReadOnly);
							}
						}

						if (this._readOnly || this._buttonOnly) {
							this.domNodeInput.readOnly=true;
							if (!dojo.hasClass(this.domNodeInput.parentNode, 'readonly')) dojo.addClass(this.domNodeInput.parentNode, 'readonly');
						}
						else {
							this.domNodeInput.readOnly=false;
							if (dojo.hasClass(this.domNodeInput.parentNode, 'readonly')) dojo.removeClass(this.domNodeInput.parentNode, 'readonly');
						}
						
						if (this._buttonOnly && !this._readOnly) {
							if (!dojo.hasClass(this.domNodeInput.parentNode, 'cursorpointer')) dojo.addClass(this.domNodeInput.parentNode, 'cursorpointer');
						}
						else {
							if (dojo.hasClass(this.domNodeInput.parentNode, 'cursorpointer')) dojo.removeClass(this.domNodeInput.parentNode, 'cursorpointer');
						}
						
						return true;
					}
					this.inherited(arguments);
				},
				postCreate: function() {
					this.inherited(arguments);
					this.focusNode=this.domNodeInput;
				},
				doSelect: function() {
					if (this.getReadOnly()) return;
					var value=this.domNodeInput.value;
					var cursorPos=String(value).length;
					if (this.domNodeInput.setSelectionRange) {
						this.domNodeInput.setSelectionRange(0,cursorPos);
					}
					else if (this.domNodeInput.createTextRange) {
						var range=this.domNodeInput.createTextRange();
						range.collapse(true);
						range.moveStart('character', 0);
						range.moveEnd('character', cursorPos);
						range.select();
					}
				},
				onInputDblClick: function() {
					if (this._buttonOnly) this.onButtonClick();
				},
				onClearClick: function() {
				},
				onButtonClick: function() {
				},
				onKeyDown: function(e) {
					if (!e) var e=window.event;
					if (e.keyCode==13 && e.ctrlKey) {
						// Ctrl+Enter
						dojo.stopEvent(e);
						this.onButtonClick();
					}
				},
				onKeyUp: function(evt) {
				},
				onKeyPress: function(evt) {
				},
				doInputChange: function(evt) {
					this.onChange(this.domNodeInput.value);
				},
				onChange: function(newValue) {
				},
				onBlur: function() {
				},
				onFocus: function() {
					g740.execDelay.go({
						delay: 50,
						obj: this,
						func: this.doSelect
					});
				}
			}
		);
// g740.ListCheckBox - виджет: список с пометками элементов
		dojo.declare(
			'g740.ListCheckBox',
			[dijit._Widget, dijit._TemplatedMixin],
			{
				fieldName: '',
				objRowSet: null,
				
				templateString: '<div class="g740-widget-listcheckbox">'+
				'</div>',
				_itemsDomCheckBox: null,
				_itemsChecked: null,
				_itemsData: null,
				destroy: function() {
					this._itemsDomCheckBox=null;
					this._itemsChecked=null;
					this._itemsData=null;
					this.objRowSet=null;
					this.inherited(arguments);
				},
				set: function(name, value) {
					if (name=='value') {
						this.setValue(value);
						return true;
					}
					if (name=='focused') {
						if (value) this.focus();
					}
					this.inherited(arguments);
				},
				postCreate: function() {
					this.render();
					this.inherited(arguments);
				},
				setChecked: function(id, checked) {
					if (!this._itemsChecked) this._itemsChecked={};
					this._itemsChecked[id]=checked;
					if (!this._itemsDomCheckBox) return false;
					var domCheckBox=this._itemsDomCheckBox[id];
					if (!domCheckBox) return false;
					domCheckBox.checked=checked;
				},
				render: function() {
					if (!this.domNode) return false;
					if (!this._itemsChecked) this._itemsChecked={};
					this.domNode.innerHTML='';
					this._itemsDomCheckBox={};
					var lst=this.getItems();

					for (var i=0; i<lst.length; i++) {
						var item=lst[i];
						if (!item.id) continue;
						if (this._itemsDomCheckBox[item.id]) continue;
						
						var domDiv=document.createElement('div');
						var domLabel=document.createElement('label');
						var domLabelText=document.createTextNode(' '+item.value);
						var domCheckBox=document.createElement('input');
						domCheckBox.setAttribute('type','checkbox');
						domCheckBox.setAttribute('name',item.id);
						if (this._itemsChecked[item.id]) domCheckBox.checked=true;
						
						domLabel.appendChild(domCheckBox);
						domLabel.appendChild(domLabelText);
						domDiv.appendChild(domLabel);
						this.domNode.appendChild(domDiv);
						this._itemsDomCheckBox[item.id]=domCheckBox;
					}
				},
				setValue: function(newValue) {
					this._itemsChecked={};
					if (!newValue) newValue='';
					if (!newValue.toString) newValue='';
					newValue=newValue.toString();
					var lst=newValue.split("\n");
					for(var i=0; i<lst.length; i++) {
						var item=lst[i];
						var n=item.indexOf('=');
						if (n<0) continue;
						var id=item.substr(0,n);
						this._itemsChecked[id]=true;
					}
					if (this._itemsDomCheckBox) for (var id in this._itemsDomCheckBox) {
						var domCheckBox=this._itemsDomCheckBox[id];
						if (!domCheckBox) continue;
						domCheckBox.checked=this._itemsChecked[id]?true:false;
					}
				},
				getValue: function() {
					var result='';
					if (this._itemsDomCheckBox) {
						this._itemsChecked={};
						for(var id in this._itemsDomCheckBox) {
							var domCheckBox=this._itemsDomCheckBox[id];
							if (!domCheckBox) continue;
							if (domCheckBox.checked) this._itemsChecked[id]=true;
						}
					}
					var items=this.getItems();
					for(var i=0; i<items.length; i++) {
						var item=items[i];
						if (!this._itemsChecked[item.id]) continue;
						if (result) result+="\n";
						result+=item.id+'='+item.value;
					}
					return result;
				},
				focus: function() {
					if (this._itemsDomCheckBox) {
						var lst=this.getItems();
						if (lst.length>0) {
							var item=lst[0];
							var domCheckBox=this._itemsDomCheckBox[item.id];
							if (domCheckBox) {
								domCheckBox.focus();
								return;
							}
						}
					}
					if (this.domNode) this.domNode.focus();
				},
				// возвращает упорядоченный массив элементов в виде {id: <id>, value: <value>}
				getItems: function() {
					if (this._itemsData) return this._itemsData;
					var result=[];
					if (!this.objRowSet) return result;
					if (this.objRowSet.g740className!='g740.RowSet') return result;
					if (this.objRowSet.isObjectDestroed) return result;
					var objTreeStorage=this.objRowSet.objTreeStorage;
					if (!objTreeStorage) return result;
					if (objTreeStorage.isObjectDestroed) return result;

					var nodes=objTreeStorage.getChildsOrdered(objTreeStorage.rootNode);
					for (var i=0; i<nodes.length; i++) {
						var node=nodes[i];
						if (!node) continue;
						var row=node.info;
						if (!row) continue;
						var fields=this.objRowSet.getFields(node);
						var fld=fields[this.fieldName];
						if (!fld) continue;
						var item={id: node.id, value: g740.convertor.js2text(row[this.fieldName+'.value'],fld.type)};
						result.push(item);
					}
					this._itemsData=result;
					return this._itemsData;
				},
				onBlur: function() {
					this.focused=false;
				},
				onFocus: function() {
					this.focused=true;
				}
			}
		);
// g740._ListAbstract - виджет: абстрактный предок списка
		dojo.declare(
			'g740._ListAbstract',
			[dijit._Widget, dijit._TemplatedMixin],
			{
				filter: '',
				value: null,
				isAddEmptyItem: false,
				templateString: 
					'<div class="g740-list">'+
						'<div class="g740-list-div-input" data-dojo-attach-point="domNodeDivInput">'+
							'<input type="text" class="g740-list-input" data-dojo-attach-point="domNodeInput" data-dojo-attach-event="'+
								'onkeydown: doInputKeyDown'+
							'"/>'+
						'</div>'+
						'<div class="g740-list-items" data-dojo-attach-point="domNodeItems">'+
						'</div>'+
					'</div>',
				_listOfDomItem: {},
				postCreate: function() {
					this.inherited(arguments);
					this.focusNode=this.domNodeInput;
					this.domNodeInput.value=this.filter;
					this._renderItems();
					g740.execDelay.go({
						delay: 50,
						obj: this,
						func: function() {
							var cursorPos=String(this.filter).length;
							if (this.domNodeInput.setSelectionRange) {
								this.domNodeInput.setSelectionRange(cursorPos,cursorPos);
							}
							else if (this.domNodeInput.createTextRange) {
								var range = this.domNodeInput.createTextRange();
								range.collapse(true);
								range.moveEnd('character', cursorPos);
								range.moveStart('character', cursorPos);
								range.select();
							}
							this.layout();
						}
					});
				},

				destroy: function() {
					this._listOfDomItem={};
					this.inherited(arguments);
				},
				set: function(name, value) {
					if (name=='value') {
						if (this.value!=value) {
							this.value=value;
							this._renderValue();
						}
						return true;
					}
					if (name='focused') {
						if (value) {
							if (this.domNodeInput) this.domNodeInput.focus();
						}
						return true;
					}
					this.inherited(arguments);
				},
				// абстрактный метод - возвращает упорядоченный массив элементов в виде {id: <id>, value: <value>}
				getItems: function() {
					return [];
				},
				_renderItems: function() {
					if (!this.domNodeItems) return false;
					this.domNodeItems.innerHTML='';
					this._listOfDomItem={};
					var items=this.getItems();
					for (var i=0; i<items.length; i++) {
						var item=items[i];
						var domItem=document.createElement('div');
						domItem.setAttribute('data-id',item['id']);
						domItem.setAttribute('title',item['value']);
						domItem.className='g740-list-item';
						domItem.obj=this;
						dojo.on(domItem, 'click', function() {
							if (this.obj && this.obj.doItemClick) {
								var id=this.getAttribute('data-id');
								this.obj.doItemClick(id);
							}
						});
						dojo.on(domItem, 'dblclick', function() {
							if (this.obj && this.obj.doItemDblClick) {
								var id=this.getAttribute('data-id');
								this.obj.doItemDblClick(id);
							}
						});
						var domSpan=document.createElement('span');
						var domText=document.createTextNode(item['value']);
						domSpan.appendChild(domText);
						domItem.appendChild(domSpan);
						this.domNodeItems.appendChild(domItem);
						this._listOfDomItem[item['id']]=domItem;
					}
					if (this.value=='' || !this._listOfDomItem[this.value]) this.value=this.getIdFirst();
					this._renderValue();
					this.onResize();
				},
				_oldValue: null,
				_renderValue: function() {
					if (!this._listOfDomItem) return;
					var domDivOld=this._listOfDomItem[this._oldValue];
					if (domDivOld && dojo.hasClass(domDivOld, 'selected')) dojo.removeClass(domDivOld, 'selected');
					var domDivNew=this._listOfDomItem[this.value];
					if (domDivNew && !dojo.hasClass(domDivNew, 'selected')) dojo.addClass(domDivNew, 'selected');
					this._oldValue=this.value;
					this.scrollToSelected();
				},
				
				getIdFirst: function() {
					var result=null;
					if (!this.domNodeItems) return result;
					for (var i=0; i<this.domNodeItems.childNodes.length; i++) {
						var domItem=this.domNodeItems.childNodes[i];
						if (domItem.nodeName!='DIV') continue;
						result=domItem.getAttribute('data-id');
						break;
					}
					return result;
				},
				getIdLast: function() {
					var result=null;
					if (!this.domNodeItems) return result;
					for (var i=this.domNodeItems.childNodes.length-1; i>=0; i--) {
						var domItem=this.domNodeItems.childNodes[i];
						if (domItem.nodeName!='DIV') continue;
						result=domItem.getAttribute('data-id');
						break;
					}
					return result;
				},
				getIdNext: function(id) {
					if (!this.domNodeItems) return null;
					if (!this._listOfDomItem) return null;
					var domItem=this._listOfDomItem[id];
					while (domItem) {
						domItem=domItem.nextSibling;
						if (domItem && domItem.nodeName=='DIV') {
							return domItem.getAttribute('data-id');
						}
					}
					return this.getIdLast();
				},
				getIdPrev: function(id) {
					if (!this.domNodeItems) return null;
					if (!this._listOfDomItem) return null;
					var domItem=this._listOfDomItem[id];
					while (domItem) {
						domItem=domItem.previousSibling;
						if (domItem && domItem.nodeName=='DIV') {
							return domItem.getAttribute('data-id');
						}
					}
					return this.getIdFirst();
				},
				getHeight: function() {
					var n=0;
					for(var id in this._listOfDomItem) {
						n++;
						if (n>=25) break;
					}
					if (n<5) n=5;
					return n*18+25;
				},
				doInputKeyDown: function(e) {
					if (!e) var e=window.event;
					if (!e.ctrlKey && e.keyCode==40) {
						// Dn
						this.set('value',this.getIdNext(this.value));
						dojo.stopEvent(e);
					}
					else if (!e.ctrlKey && e.keyCode==38) {
						// Up
						this.set('value',this.getIdPrev(this.value));
						dojo.stopEvent(e);
					}
					else if (!e.ctrlKey && e.keyCode==34) {
						// PgDn
						if (this.domNodeItems) {
							var id=this.value;
							var n=parseInt(this.domNodeItems.clientHeight/18);
							for(var i=0; i<n; i++) id=this.getIdNext(id);
							this.set('value',id);
						}
						dojo.stopEvent(e);
					}
					else if (!e.ctrlKey && e.keyCode==33) {
						// PgUp
						if (this.domNodeItems) {
							var id=this.value;
							var n=parseInt(this.domNodeItems.clientHeight/18);
							for(var i=0; i<n; i++) id=this.getIdPrev(id);
							this.set('value',id);
						}
						dojo.stopEvent(e);
					}
					else if (!e.ctrlKey && e.keyCode==13) {
						// Enter
						dojo.stopEvent(e);
						this.onDblClick();
					}
					else {
						this._refreshIndex++;
						g740.execDelay.go({
							delay: 400,
							obj: this,
							func: this._refreshGo
						});
					}
				},
				_refreshIndex: 0,
				_refreshGo: function() {
					this._refreshIndex--;
					if (this._refreshIndex>0) return;
					if (!this.domNodeInput) return;
					if (this.filter==this.domNodeInput.value) return;
					this.filter=this.domNodeInput.value;
					this._renderItems();
					this._renderValue();
				},
				layout: function() {
					this.inherited(arguments);
					if (this.domNodeItems) {
						var h=(this.domNode.clientHeight-this.domNodeDivInput.offsetHeight)+'px';
						dojo.style(this.domNodeItems,'height',h);
					}
					this.scrollToSelected();
				},
				scrollToSelected: function() {
					if (!this.domNodeItems) return;
					if (!this._listOfDomItem) return;
					var domItem=this._listOfDomItem[this.value];
					if (!domItem) return;
					
					var y=this.domNodeItems.scrollTop;
					var h=this.domNodeItems.offsetHeight;
					var delta=10;
					if (delta*4>h) delta=h/4;
					if (domItem.offsetTop<(y+delta)) {
						y=parseInt(domItem.offsetTop-h/2);
					}
					if ((domItem.offsetTop+domItem.offsetHeight)>(y+h-delta)) {
						y=parseInt(domItem.offsetTop-h/2);
					}
					if (y<0) y=0;
					this.domNodeItems.scrollTop=y;
				},
				doItemClick: function(id) {
					if (this.domNodeInput) this.domNodeInput.focus();
					this.set('value',id);
					this.onChange(id);
					this.onClick();
				},
				doItemDblClick: function(id) {
					if (this.domNodeInput) this.domNodeInput.focus();
					this.set('value',id);
					this.onChange(id);
					this.onDblClick();
				},
				onChange: function(newValue) {
				},
				onClick: function(evt) {
				},
				onDblClick: function(evt) {
				},
				onResize: function() {
				}
			}
		);
// g740.ListRowSet - виджет: список, начитываемый из RowSet
		dojo.declare(
			'g740.ListRowSet',
			g740._ListAbstract,
			{
				fieldName: '',
				objRowSet: null,
				constructor: function(para, domElement) {
					if (!para) para={};
					if (para.objRowSet) this.objRowSet=para.objRowSet;
					if (para.fieldName) this.fieldName=para.fieldName;
					if (para.isAddEmptyItem) this.isAddEmptyItem=para.isAddEmptyItem;
				},
				destroy: function() {
					this.objRowSet=null;
					this.fieldName='';
					this.inherited(arguments);
				},
				set: function(name, value) {
					if (name=='fieldName') {
						if (this.fieldName!=value) {
							this.fieldName=value;
							this.render();
						}
						return true;
					}
					if (name=='objRowSet') {
						if (this.objRowSet!=value) {
							this.objRowSet=value;
							this.render();
						}
						return true;
					}
					this.inherited(arguments);
				},
				getItems: function() {
					var result=[];
					if (!this.objRowSet) return result;
					if (this.objRowSet.g740className!='g740.RowSet') return result;
					if (this.objRowSet.isObjectDestroed) return result;
					var objTreeStorage=this.objRowSet.objTreeStorage;
					if (!objTreeStorage) return result;
					if (objTreeStorage.isObjectDestroed) return result;
					

					var nodes=objTreeStorage.getChildsOrdered(objTreeStorage.rootNode);
					var filter='';
					if (this.filter) filter=this.filter.toLowerCase();
					if (!filter && this.isAddEmptyItem) result.push({id: '', value: '---//---'});
					for (var i=0; i<nodes.length; i++) {
						var node=nodes[i];
						if (!node) continue;
						var row=node.info;
						if (!row) continue;
						var fields=this.objRowSet.getFields(node);
						var fld=fields[this.fieldName];
						if (!fld) continue;
						var value=g740.convertor.js2text(row[this.fieldName+'.value'],fld.type);
						if (filter) {
							if (value.toLowerCase().indexOf(filter)<0) continue;
						}
						var item={id: node.id, value: value};
						result.push(item);
					}
					if (filter && this.isAddEmptyItem) result.push({id: '', value: '---//---'});
					return result;
				}
			}
		);
// g740.ListItems - виджет: список, начитываемый из строки, разделенной ;
		dojo.declare(
			'g740.ListItems',
			g740._ListAbstract,
			{
				g740list: '',
				baseType: 'string',
				isAddEmptyItem: false,
				constructor: function(para, domElement) {
					if (!para) para={};
					if (para.list) this.g740list=para.list;
				},
				set: function(name, value) {
					if (name=='list') {
						if (this.g740list!=value) {
							this.g740list=value;
							if (typeof(this.g740list)!='string') this.g740list='';
							this.render();
						}
						return true;
					}
					if (name=='baseType') {
						if (this.baseType!=value) {
							if (value!='string' && value!='num') g740.systemError('g740.ListItems.set(baseType)',errorIncorrectValue, value);
							this.baseType=value;
						}
						return true;
					}
					this.inherited(arguments);
				},
				getItems: function() {
					var result=[];
					var lst=this.g740list.split(';');
					
					if (this.isAddEmptyItem) {
						if (this.baseType=='string') {
							var item={id: '', value: '---//---'};
						}
						if (this.baseType=='num') {
							var item={id: 0, value: '---//---'};
						}
						result.push(item);
					}
					
					var filter='';
					if (this.filter) filter=this.filter.toLowerCase();
					for (var i=0; i<lst.length; i++) {
						if (!lst[i]) continue;

						var value=lst[i];
						if (filter) {
							if (value.toLowerCase().indexOf(filter)<0) continue;
						}
						
						if (this.baseType=='string') {
							var item={id: lst[i], value: value};
						}
						if (this.baseType=='num') {
							var item={id: i+1, value: value};
						}
						result.push(item);
					}
					return result;
				}
			}
		);
// g740.MenuBar - строка меню
		dojo.declare(
			'g740.MenuBar',
			dijit.MenuBar,
			{
			    g740className: 'g740.MenuBar',			// Имя базового класса
			    isObjectDestroed: false,				// Признак - объект уничтожен
			    connectedUser: '',
				constructor: function (para, domElement) {
			        var procedureName = 'g740.MenuBar.constructor';
			        try {
			        }
			        finally {
			        }
			    },
				destroy: function () {
			        var procedureName = 'g740.MenuBar.destroy';
			        try {
			            this.isObjectDestroed = true;
			            this.inherited(arguments);
			        }
			        finally {
			        }
			    },
				postCreate: function() {
					this.inherited(arguments);
					if (this.connectedUser) {
						var domNodeConnectedUser=document.createElement('div');
						domNodeConnectedUser.className='connecteduser';
						domNodeConnectedUser.setAttribute('title',g740.getMessage('disconnect'));
						this.domNode.appendChild(domNodeConnectedUser);
						
						var domNodeLabel=document.createElement('div');
						domNodeLabel.className='label';
						var txt=document.createTextNode(this.connectedUser);
						domNodeLabel.appendChild(txt);
						domNodeConnectedUser.appendChild(domNodeLabel);

						var domNodeExit=document.createElement('div');
						domNodeExit.className='icon';
						domNodeConnectedUser.appendChild(domNodeExit);
						dojo.on(domNodeConnectedUser, 'click', function() {
							var objOwner=this;
							while(true) {
								if (objOwner.className=='g740.Form') break;
								if (!objOwner.getParent) break;
								objOwner=objOwner.getParent();
							}
							g740.request.send({
								objOwner: objOwner,
								arrayOfRequest:['<request name="disconnect"/>'],
								requestName: 'disconnect'
							});
						});
					}
				},
			    doG740Repaint: function (para) {
			        // Перерисовываем детей
			        var lst = this.getChildren();
			        for (var i = 0; i < lst.length; i++) {
			            var obj = lst[i];
			            if (!obj) continue;
			            if (!obj.doG740Repaint) continue;
			            obj.doG740Repaint(para);
			        }
			    }
			}
		);
// g740.Toolbar
		dojo.declare(
			'g740.Toolbar',
			dijit.Toolbar,
			{
				g740className: 'g740.Toolbar',			// Имя базового класса
				isObjectDestroed: false,				// Признак - объект уничтожен
				g740size: 'small',
				set: function(name, value) {
					if (name=='g740size') {
						if (value!='large' && value!='medium' && value!='small') value=g740.config.iconSizeDefault;
						this.g740size=value;
						return true;
					}
					this.inherited(arguments);
				},
				destroy: function() {
					var procedureName='g740.Toolbar.destroy';
					try {
						this.isObjectDestroed=true;
						this.inherited(arguments);
					}
					finally {
					}
				},
				postCreate: function() {
					this.inherited(arguments);
					if (this.g740size=='large') dojo.addClass(this.domNode,'g740large');
					if (this.g740size=='medium') dojo.addClass(this.domNode,'g740medium');
					if (this.g740size=='small') dojo.addClass(this.domNode,'g740small');
				},
				doG740Repaint: function(para) {
					// Перерисовываем детей
					var lst=this.getChildren();
					for (var i=0; i<lst.length; i++) {
						var obj=lst[i];
						if (!obj) continue;
						if (!obj.doG740Repaint) continue;
						obj.doG740Repaint(para);
					}
				}
			}
		);
// g740.ToolbarButton - кнопка в Toolbar
		dojo.declare(
			'g740.ToolbarButton',
			dijit.form.Button,
			{
				g740className: 'g740.ToolbarButton',	// Имя базового класса
				objAction: null,
				g740size: 'small',
				description: '',
				visible: true,
				set: function(name, value) {
					if (name=='objAction') {
						this.objAction=value;
						if (this.objAction.label) this.set('label',this.objAction.label.toHtml());
						if (this.objAction.iconClass) this.set('iconClass',this.objAction.getIconClass(this.g740size));
						if (this.objAction.description) this.set('description',this.objAction.description);
						return true;
					}
					if (name=='focused') {
						if (value) if (this.focusedNode) this.focusedNode.focus();
						return true;
					}
					if (name=='g740size') {
						if (value!='large' && value!='medium') value='small';
						this.g740size=value;
						return true;
					}
					if (name=='description') {
						if (this.description!=value) {
							this.description=value;
							return true;
						}
						return true;
					}
					if (name=='visible') {
						var value=value?true:false;
						if (this.visible!=value) {
							if (value) {
								if (dojo.hasClass(this.domNode, 'g740-hide')) dojo.removeClass(this.domNode, 'g740-hide');
							}
							else {
								if (!dojo.hasClass(this.domNode, 'g740-hide')) dojo.addClass(this.domNode, 'g740-hide');
							}
							this.visible=value;
							if (this.getParent) {
								var objParent=this.getParent();
								if (objParent && objParent.layout) objParent.layout();
							}
						}
						return true;
					}
					this.inherited(arguments);
				},
				destroy: function() {
					var procedureName='g740.ToolbarButton.destroy';
					try {
						if (this.objAction) {
							this.objAction.destroy();
							this.objAction=null;
						}
						this.inherited(arguments);
					}
					finally {
					}
				},
				postCreate: function() {
					if (this.domNode) {
						for(var i=0; i<this.domNode.childNodes.length; i++) {
							var child=this.domNode.childNodes[i];
							if (child.nodeName=='INPUT') {
								this.focusedNode=child;
							}
						}
						if (this.showLabel) {
							dojo.attr(this.domNode, 'title', this.label);
						}
					}
					this.on('Click', this.onG740Click);
					this.on('KeyDown', this.onG740KeyDown);
					this.on('Focus', this.onG740Focus);
					this.on('Blur', this.onG740Blur);
					this.inherited(arguments);
					
				},
				doG740Repaint: function(para) {
					if (!this.objAction) {
						this.set('disabled', true);
						return;
					}
					
					var isEnabled=this.objAction.getEnabled();
					this.set('disabled', !isEnabled);
					if (this.objAction.request) {
						var r=this.objAction.request;
						if (r.js_icon) {
							this.set('iconClass',this.objAction.getIconClass(this.g740size));
						}
						if (r.js_visible) {
							this.set('visible',this.objAction.getVisible());
						}
					}
					
					if (isEnabled) {
						this.set('label',this.objAction.getCaption().toHtml());
					}
					else {
						if (!this.showLabel) this.set('label','');
					}
				},
				onG740Click: function() {
					var objPanel=this.getPanelForFocus();
					if (objPanel && objPanel.doG740FocusChildFirst) objPanel.doG740FocusChildFirst();

					if (this._isClickTimeout) return false;
					this._isClickTimeout=true;
					g740.execDelay.go({
						delay: 400,
						obj: this,
						func: this._setClickTimeoutOff
					});
					
					if (this.objAction) return this.objAction.exec();
					return false;
				},
				getPanelForFocus: function() {
					var objForm=null;
					var objToolBarPanel=null;

					var obj=this.getParent();
					if (obj && obj.getParent) obj=obj.getParent();
					if (obj.g740className=='g740.Panel') {
						objToolBarPanel=obj;
						objForm=objToolBarPanel.objForm;
					}
					
					if (!this.objAction) {
						if (!objForm) return null;
						var objFocusedPanel=objForm.objFocusedPanel;
						if (objFocusedPanel) return objFocusedPanel;
						if (objToolBarPanel) return objToolBarPanel;
						return null;
					}
					
					if (!objForm) objForm=this.objAction.objForm;
					if (!objForm) return null;
					var objFocusedPanel=objForm.objFocusedPanel;
					
					var rowsetName=this.objAction.rowsetName;
					if (!rowsetName || rowsetName=='#focus' || rowsetName=='#form') {
						if (objFocusedPanel) return objFocusedPanel;
						return null;
					}
					if (objToolBarPanel && objToolBarPanel.rowsetName==rowsetName) return objToolBarPanel;
					if (objFocusedPanel && objFocusedPanel.rowsetName==rowsetName) return objFocusedPanel;
					return null;
				},
				onG740KeyDown: function(e) {
					if (!e) var e=window.event;
					dojo.stopEvent(e);
				},
				onG740Focus: function() {
				},
				onG740Blur: function() {
				},
				_isClickTimeout: false,
				_setClickTimeoutOff: function() {
					this._isClickTimeout=false;
				}
			}
		);
// g740.PanelButton - кнопка в панели
		dojo.declare(
			'g740.PanelButton',
			g740.ToolbarButton,
			{
				g740className: 'g740.PanelButton',		// Имя базового класса
				g740size: 'medium',
				postCreate: function() {
					this.inherited(arguments);
					if (this.region=='top') {
						dojo.addClass(this.domNode,'btnstretch');
					}
					if (this.domNode) this.domNode.title=this.description;
				},
				onG740KeyDown: function(e) {
					if (!e) var e=window.event;
					if (!e.ctrlKey && e.keyCode==13) {
						dojo.stopEvent(e);
						this.onClick();
					}
					else {
						dojo.stopEvent(e);
					}
				},
				resize: function(size) {
					if (size && size.h) size.h=parseInt(size.h);
					this.inherited(arguments);
				},
				doG740Repaint: function(para) {
					if (!this.objAction) {
						this.set('disabled', true);
						return;
					}
					
					var isEnabled=this.objAction.getEnabled();
					this.set('disabled', !isEnabled);
					
					if (this.objAction.request) {
						var r=this.objAction.request;
						if (r.js_icon) {
							this.set('iconClass',this.objAction.getIconClass('medium'));
						}
						if (r.js_visible) {
							this.set('visible',this.objAction.getVisible());
						}
					}
					this.set('label',this.objAction.getCaption().toHtml());
				},
				onG740Focus: function() {
					if (!dojo.hasClass(this.domNode,'g740focused')) dojo.addClass(this.domNode,'g740focused');
				},
				onG740Blur: function() {
					if (dojo.hasClass(this.domNode,'g740focused')) dojo.removeClass(this.domNode,'g740focused');
				}
			}
		);
// g740.ToolbarComboButton
		dojo.declare(
			'g740.ToolbarComboButton',
			dijit.form.DropDownButton,
			{
				g740className: 'g740.ToolbarComboButton',	// Имя базового класса
				objAction: null,
				g740size: 'small',
				js_enabled: '',
				description: '',
				visible: true,
				set: function(name, value) {
					if (name=='objAction') {
						this.objAction=value;
						if (this.objAction.label) this.set('label',this.objAction.label.toHtml());
						if (this.objAction.iconClass) this.set('iconClass',this.objAction.getIconClass(this.g740size));
						if (this.objAction.description) this.set('description',this.objAction.description);
						return true;
					}
					if (name=='g740size') {
						if (value!='large' && value!='medium') value='small';
						this.g740size=value;
						return true;
					}
					if (name=='description') {
						if (this.description!=value) {
							this.description=value;
							this.domNode.title=value;
							return true;
						}
						return true;
					}
					if (name=='visible') {
						var value=value?true:false;
						if (this.visible!=value) {
							if (value) {
								if (dojo.hasClass(this.domNode, 'g740-hide')) dojo.removeClass(this.domNode, 'g740-hide');
							}
							else {
								if (!dojo.hasClass(this.domNode, 'g740-hide')) dojo.addClass(this.domNode, 'g740-hide');
							}
							this.visible=value;
							if (this.getParent) {
								var objParent=this.getParent();
								if (objParent && objParent.layout) objParent.layout();
							}
						}
						return true;
					}
					this.inherited(arguments);
				},
				constructor: function(para, domElement) {
					var procedureName='g740.ToolbarComboButton.constructor';
					try {
						this.on('Click', this.onG740Click);
					}
					finally {
					}
				},
				destroy: function() {
					var procedureName='g740.ToolbarComboButton.destroy';
					try {
						if (this.objAction) {
							this.objAction.destroy();
							this.objAction=null;
						}
						this.inherited(arguments);
					}
					finally {
					}
				},
				doG740Repaint: function(para) {
					if (this.objAction && this.objAction.request) {
						var r=this.objAction.request;
						if (r.js_icon) {
							this.set('iconClass',this.objAction.getIconClass(this.g740size));
						}
						if (r.js_enabled) {
							var obj=this.objAction.getObjRowSet();
							if (!obj) obj=this.objAction.objForm;
							if (obj) {
								var isEnabled=g740.js_eval(obj, r.js_enabled, true);
							}
							this.set('disabled', !isEnabled);
						}
						if (r.js_caption) {
							this.set('label',this.objAction.getCaption());
						}
						if (r.js_visible) {
							this.set('visible',this.objAction.getVisible());
						}
					}
					return true;
				},
				_onDropDownClick: function(e) {
					if (!e) var e=window.event;
					if (this.dropDown) {
						g740.execDelay.go({
							obj: this,
							delay: 100,
							func: function() {
								var lst=this.dropDown.getChildren();
								for (var i=0; i<lst.length; i++) {
									var obj=lst[i];
									if (obj.doG740Repaint) {
										obj.doG740Repaint({});
									}
								}
							}
						});
					}
					this.inherited(arguments);
				},
				onG740Click: function() {
					if (this.objAction) return this.objAction.exec();
					return false;
				}
			}
		);
// g740.CustomButton
		dojo.declare(
			'g740.CustomButton',
			[dijit._Widget, dijit._TemplatedMixin],
			{
				g740className: 'g740.CustomButton',	// Имя базового класса
				templateString: 
					'<div class="g740-custombutton" data-dojo-attach-event="'+
						'onclick: onBtnClick'+
					'">'+
						'<table class="g740-table">'+
							'<tr>'+
								'<td class="icons-white"><div class="g740-icon" data-dojo-attach-point="domNodeIcon"></div></td>'+
								'<td><div class="g740-label" data-dojo-attach-point="domNodeLabel"></div></td>'+
							'</tr>'+
						'</table>'+
					'</div>',
				objAction: null,
				btnstyle: '',
				label: '',
				size: 'medium',
				description: '',
				visible: true,
				set: function(name, value) {
					if (name=='objAction') {
						this.objAction=value;
						if (this.objAction.label) this.set('label',this.objAction.label.toHtml());
						if (this.objAction.description) this.set('description',this.objAction.description);
						if (this.objAction.icon && this.objAction.icon!='default') {
							this.set('iconClass',this.objAction.getIconClass(this.size));
						}
						else {
							this.set('iconClass','');
						}
						return true;
					}
					if (name=='size') {
						if (this.size!=value) {
							dojo.removeClass(this.domNode,'g740-custombutton-'+this.size);
							this.size=value;
							dojo.addClass(this.domNode,'g740-custombutton-'+this.size);
						}
					}
					if (name=='label') {
						if (this.label!=value) {
							this.domNodeLabel.innerText=value;
							this.label=value;
							if (this.getParent) {
								var objParent=this.getParent();
								if (objParent && objParent.layout) objParent.layout();
							}
							return true;
						}
						return true;
					}
					if (name=='description') {
						if (this.description!=value) {
							this.domNode.title=value;
							this.description=value;
							return true;
						}
						return true;
					}
					if (name=='iconClass') {
						if (value) {
							dojo.removeClass(this.domNodeIcon, 'g740-hide');
							dojo.addClass(this.domNodeIcon, value);
						}
						else {
							this.domNodeIcon.className='g740-icon g740-hide';
						}
						return true;
					}
					if (name=='btnstyle') {
						if (value!='success' && value!='info' && value!='warning' && value!='danger') value='default';
						if (this.btnstyle!=value) {
							if (this.btnstyle) dojo.removeClass(this.domNode, 'g740-style-'+this.btnstyle);
							this.btnstyle=value;
							dojo.addClass(this.domNode, 'g740-style-'+this.btnstyle);
							return true;
						}
						return true;
					}
					if (name=='disabled') {
						if (value) {
							if (!dojo.hasClass(this.domNode, 'g740-disabled')) dojo.addClass(this.domNode, 'g740-disabled');
						}
						else {
							if (dojo.hasClass(this.domNode, 'g740-disabled')) dojo.removeClass(this.domNode, 'g740-disabled');
						}
						return true;
					}
					if (name=='visible') {
						var value=value?true:false;
						if (this.visible!=value) {
							if (value) {
								if (dojo.hasClass(this.domNode, 'g740-hide')) dojo.removeClass(this.domNode, 'g740-hide');
							}
							else {
								if (!dojo.hasClass(this.domNode, 'g740-hide')) dojo.addClass(this.domNode, 'g740-hide');
							}
							this.visible=value;
							if (this.getParent) {
								var objParent=this.getParent();
								if (objParent && objParent.layout) objParent.layout();
							}
						}
						return true;
					}
					this.inherited(arguments);
				},
				postCreate: function() {
					{
						var btnStyle=this.btnstyle;
						this.btnstyle='';
						this.set('btnstyle', btnStyle);
						
						var btnSize=this.size;
						this.size='';
						this.set('size', btnSize);
					}
					this.inherited(arguments);
				},
				doG740Repaint: function(para) {
					if (!this.objAction) {
						this.set('disabled', true);
						return;
					}
					var isEnabled=this.objAction.getEnabled();
					this.set('disabled', !isEnabled);
					if (this.objAction.request) {
						var r=this.objAction.request;
						if (r.js_icon) {
							this.set('iconClass',this.objAction.getIconClass(this.g740size));
						}
						if (r.js_visible) {
							this.set('visible',this.objAction.getVisible());
						}
					}
					this.set('label',this.objAction.getCaption().toHtml());
				},
				onBtnClick: function() {
					var objPanel=this.getPanelForFocus();
					if (objPanel && objPanel.doG740FocusChildFirst) objPanel.doG740FocusChildFirst();

					if (this._isClickTimeout) return false;
					this._isClickTimeout=true;
					g740.execDelay.go({
						delay: 400,
						obj: this,
						func: this._setClickTimeoutOff
					});
					
					if (this.objAction) return this.objAction.exec();
					return false;
				},
				getPanelForFocus: function() {
					var objForm=null;
					var objToolBarPanel=null;

					var obj=this.getParent();
					if (obj && obj.getParent) obj=obj.getParent();
					if (obj.g740className=='g740.Panel') {
						objToolBarPanel=obj;
						objForm=objToolBarPanel.objForm;
					}
					
					if (!this.objAction) {
						if (!objForm) return null;
						var objFocusedPanel=objForm.objFocusedPanel;
						if (objFocusedPanel) return objFocusedPanel;
						if (objToolBarPanel) return objToolBarPanel;
						return null;
					}
					
					if (!objForm) objForm=this.objAction.objForm;
					if (!objForm) return null;
					var objFocusedPanel=objForm.objFocusedPanel;
					
					var rowsetName=this.objAction.rowsetName;
					if (!rowsetName || rowsetName=='#focus' || rowsetName=='#form') {
						if (objFocusedPanel) return objFocusedPanel;
						return null;
					}
					if (objToolBarPanel && objToolBarPanel.rowsetName==rowsetName) return objToolBarPanel;
					if (objFocusedPanel && objFocusedPanel.rowsetName==rowsetName) return objFocusedPanel;
					return null;
				},
				_isClickTimeout: false,
				_setClickTimeoutOff: function() {
					this._isClickTimeout=false;
				}
			}
		);
// g740.WidgetButtonContainer
		dojo.declare(
			'g740.WidgetButtonContainer',
			[dijit._Widget, dijit._TemplatedMixin],
			{
				g740className: 'g740.WidgetButtonContainer',	// Имя базового класса
				templateString: 
					'<div class="g740-buttoncontainer">'+
						'<div class="g740-items" data-dojo-attach-point="domNodeItems">'+
							'<div style="clear:both" data-dojo-attach-point="domNodeLast"></div>'+
						'</div>'+
					'</div>',
				child: null,
				constructor: function(para, domElement) {
					var procedureName='g740.ButtonContainer.constructor';
					this.child=[];
				},
				destroy: function() {
					var procedureName='g740.WidgetButtonContainer.destroy';
					if (this.child) {
						var lst=this.getChildren();
						for(var i=0; i<lst.length; i++) {
							var obj=lst[i];
							if (obj) obj.destroyRecursive();
						}
						this.child=[];
					}
					this.inherited(arguments);
				},
				addChild: function(obj, insertIndex) {
					if (!obj) return false;
					if (!obj.domNode) return false;
					if (obj.region!='top' || obj.region!='bottom') {
						var align='left';
						if (obj.region=='right') align='right';
						dojo.style(obj.domNode, 'float', align);
					}
					this.domNodeItems.insertBefore(obj.domNode, this.domNodeLast);
					this.child.push(obj);
				},
				getChildren: function() {
					return this.child;
				},
				
				_isLayoutExecuted: false,
				_isLayoutWaiting: false,
				doG740Repaint: function(para) {
					this._isLayoutWaiting=true;
					try {
						this._isLayoutExecuted=false;
						var lst=this.getChildren();
						for(var i=0; i<lst.length; i++) {
							var obj=lst[i];
							if (obj && obj.doG740Repaint) {
								if (obj.doG740Repaint(para)) isChanged=true;
							}
						}
					}
					finally {
						this._isLayoutWaiting=false;
					}
					if (this._isLayoutExecuted) {
						this.layout();
					}
				},
				layout: function() {
					this._isLayoutExecuted=true;
					if (this._isLayoutWaiting) return;
					this.resize();
				},
				_resizeHeight: 0,
				resize: function(size) {
					var pos=dojo.geom.position(this.domNodeItems, false);
					var lst=this.getChildren();
					var isChildVisibleExists=false;
					for(var i=0; i<lst.length; i++) {
						var obj=lst[i];
						if (obj.visible) isChildVisibleExists=true;
						if (obj.region=='top' || obj.region=='bottom') {
							dojo.style(obj.domNode, 'width', (pos.w-18)+'px');
						}
					}
					if (!isChildVisibleExists) pos.h=0;
					
					dojo.style(this.domNode,'width','100%');
					if (this._resizeHeight!=pos.h) {
						this._resizeHeight=pos.h;
						dojo.style(this.domNode,'height',pos.h+'px');
						if (this.getParent) {
							var objParent=this.getParent();
							if (objParent && objParent.layout) {
								g740.execDelay.go({
									delay: 50,
									obj: objParent,
									func: objParent.layout
								});
							}
						}
					}
					this.inherited(arguments);
				}
			}
		);
// g740.Menu - выпадающее по правой кнопке меню
		dojo.declare(
			'g740.Menu',
			dijit.Menu,
			{
				g740className: 'g740.Menu',
				postCreate: function() {
					this.inherited(arguments);
					this.on('Focus', this.onG740Show);
				},
				doG740Repaint: function(para) {
					// Перерисовываем детей
					var lst=this.getChildren();
					for (var i=0; i<lst.length; i++) {
						var obj=lst[i];
						if (!obj) continue;
						if (!obj.doG740Repaint) continue;
						obj.doG740Repaint(para);
					}
				},
				onG740Show: function() {
					this.doG740Repaint();
				}
			}
		);
// g740.PopupMenuItem
		dojo.declare(
			'g740.PopupMenuItem',
			dijit.PopupMenuItem,
			{
				g740className: 'g740.PopupMenuItem',
				objAction: null,
				g740size: 'small',
				set: function(name, value) {
					if (name=='objAction') {
						this.objAction=value;
						if (this.objAction.label) this.set('label',this.objAction.label.toHtml());
						if (this.objAction.iconClass) this.set('iconClass',this.objAction.getIconClass(this.g740size));
						return true;
					}
					if (name=='g740size') {
						if (value!='large' && value!='medium') value='small';
						this.g740size=value;
						return true;
					}
					this.inherited(arguments);
				},
				destroy: function() {
					var procedureName='g740.PopupMenuItem.destroy';
					try {
						if (this.objAction) {
							this.objAction.destroy();
							this.objAction=null;
						}
						this.inherited(arguments);
					}
					finally {
					}
				}
			}
		);
// g740.MenuItem
		dojo.declare(
			'g740.MenuItem',
			dijit.MenuItem,
			{
				g740className: 'g740.MenuItem',			// Имя базового класса
				objAction: null,
				g740size: 'small',
				set: function(name, value) {
					if (name=='objAction') {
						this.objAction=value;
						if (this.objAction.label) this.set('label',this.objAction.label.toHtml());
						if (this.objAction.iconClass) this.set('iconClass',this.objAction.getIconClass(this.g740size));
						return true;
					}
					if (name=='g740size') {
						if (value!='large' && value!='medium') value='small';
						this.g740size=value;
						return true;
					}
					this.inherited(arguments);
				},
				postCreate: function() {
					this.inherited(arguments);
					this.on('Click', this.onG740Click);
				},
				destroy: function() {
					if (this.objAction) {
						this.objAction.destroy();
						this.objAction=null;
					}
					this.inherited(arguments);
				},
				doG740Repaint: function(para) {
					var isEnabled=false;
					if (this.objAction) isEnabled=this.objAction.getEnabled();
					this.set('disabled', !isEnabled);
					if (this.objAction) {
						if (this.objAction.request.js_icon) {
							this.set('iconClass',this.objAction.getIconClass(this.g740size));
						}
						if (this.objAction.request.js_caption) {
							this.set('label',this.objAction.getCaption());
						}
					}
				},
				onG740Click: function() {
					if (this.objAction) return this.objAction.exec();
					return false;
				}
			}
		);
// g740.PopupMenuBarItem
		dojo.declare(
			'g740.PopupMenuBarItem',
			dijit.PopupMenuBarItem,
			{
			    g740className: 'g740.PopupMenuBarItem',
			    objAction: null,
				g740size: 'small',
			    set: function (name, value) {
			        if (name == 'objAction') {
			            this.objAction = value;
			            if (this.objAction.label) this.set('label', this.objAction.label.toHtml());
			            if (this.objAction.iconClass) this.set('iconClass', this.objAction.getIconClass(this.g740size));
			            return true;
			        }
					if (name=='g740size') {
						if (value!='large' && value!='medium') value='small';
						this.g740size=value;
						return true;
					}
			        this.inherited(arguments);
			    },
			    destroy: function () {
			        var procedureName = 'g740.PopupMenuBarItem.destroy';
			        try {
			            if (this.objAction) {
			                this.objAction.destroy();
			                this.objAction = null;
			            }
			            this.inherited(arguments);
			        }
			        finally {
			        }
			    },
			    doG740Repaint: function (para) {
					if (this.popup) {
						var lst=this.popup.getChildren();
						for (var i=0; i<lst.length; i++) {
							var obj=lst[i];
							if (obj.doG740Repaint) {
								obj.doG740Repaint(para);
							}
						}
					}
			    }
			}
		);
// g740.MenuBarItem
		dojo.declare(
			'g740.MenuBarItem',
			dijit.MenuBarItem,
			{
			    g740className: 'g740.MenuBarItem',			// Имя базового класса
			    objAction: null,
				g740size: 'small',
			    set: function (name, value) {
			        if (name == 'objAction') {
			            this.objAction = value;
			            if (this.objAction.label) this.set('label', this.objAction.label.toHtml());
			            if (this.objAction.iconClass) this.set('iconClass', this.objAction.getIconClass(this.g740size));
			            return true;
			        }
					if (name=='g740size') {
						if (value!='large' && value!='medium') value='small';
						this.g740size=value;
						return true;
					}
			        this.inherited(arguments);
			    },
			    postCreate: function () {
			        this.inherited(arguments);
			        this.on('Click', this.onG740Click);
			    },
			    destroy: function () {
			        if (this.objAction) {
			            this.objAction.destroy();
			            this.objAction = null;
			        }
			        this.inherited(arguments);
			    },
			    doG740Repaint: function (para) {
			        var isEnabled = false;
			        if (this.objAction) isEnabled = this.objAction.getEnabled();
			        this.set('disabled', !isEnabled);
					if (this.objAction) {
						if (this.objAction.request.js_icon) {
							this.set('iconClass',this.objAction.getIconClass(this.g740size));
						}
						if (this.objAction.request.js_caption) {
							this.set('label',this.objAction.getCaption());
						}
					}
			    },
			    onG740Click: function () {
			        if (this.objAction) return this.objAction.exec();
			        return false;
			    }
			}
		);
// g740.Action
		dojo.declare(
			'g740.Action',
			null,
			{
				g740className: 'g740.Action',			// Имя базового класса
				objForm: null,							// Ссылка на экранную форму
				rowsetName: '',							// Ссылка на имя набора строк
				request: {},							// Описание запроса
				label: '',
				description: '',
				icon: 'default',
				iconClass: '',
				constructor: function(para) {
					var procedureName='g740.Action.constructor';
					try {
						if (!para) para={};
						if (para.objForm) this.objForm=para.objForm;
						if (para.rowsetName) this.rowsetName=para.rowsetName;
						if (para.request) this.request=para.request;
						
						if (this.request.name=='delete' && !this.request.confirm) this.request.confirm=g740.getMessage('messageConfirmDelete');
						
						var label=this.request.caption;
						var icon=this.request.icon;
						var description=this.request.description;
						
						if (this.request.name=='connect') this.rowsetName='#form';
						if (this.request.name=='disconnect') this.rowsetName='#form';
						if (this.request.name=='close') this.rowsetName='#form';
						if (this.request.name=='result') this.rowsetName='#form';
						if (this.request.name=='form') this.rowsetName='#form';
						if (this.request.name=='httpget') this.rowsetName='#form';
						if (this.request.name=='httpput') this.rowsetName='#form';
						if (this.objForm) {
							var fullName=this.request.name;
							if (this.request.mode) fullName+='.'+this.request.mode;
							var r=this.objForm.requests[fullName];
							if (r) this.rowsetName='#form';
						}
						if (!this.rowsetName) this.rowsetName='#focus';

						if (this.rowsetName=='#focus') {
							var info=g740.rowsetRequestInfo[this.request.name];
							if (info) {
								if (info.mode && info.mode[this.request.mode]) info=info.mode[this.request.mode];
								if (!label) {
									if (info.captionId) label=g740.getMessage(info.captionId);
								}
							}
						}
						else if (this.rowsetName=='#form') {
							if (this.objForm) {
								var fullName=this.request.name;
								if (this.request.mode) fullName+='.'+this.request.mode;
								var r=this.objForm.requests[fullName];
								if (r) {
									if (!this.request.js_caption && r.js_caption) this.request.js_caption=r.js_caption;
									if (!this.request.js_icon && r.js_icon) this.request.js_icon=r.js_icon;
									if (!this.request.js_visible && r.js_visible) this.request.js_visible=r.js_visible;
									if (!this.request.confirm && r.confirm) this.request.confirm=r.confirm;

									if (!label) label=r.caption;
									if (!icon) icon=r.icon;
									if (!description) description=r.description;
								}
							}
						}
						else {
							var objRowSet=this.getObjRowSet();
							if (objRowSet) {
								var r=objRowSet.getRequestForAnyNodeType(this.request.name, this.request.mode);
								if (r) {
									if (!this.request.js_caption && r.js_caption) this.request.js_caption=r.js_caption;
									if (!this.request.js_icon && r.js_icon) this.request.js_icon=r.js_icon;
									if (!this.request.js_visible && r.js_visible) this.request.js_visible=r.js_visible;
									if (!this.request.confirm && r.confirm) this.request.confirm=r.confirm;

									if (!label) label=r.caption;
									if (!icon) icon=r.icon;
									if (!description) description=r.description;
								}
							}
						}
						
						if (!label) label=this.request.name;
						if (!icon) {
							if (this.request.mode) {
								icon=this.request.name+'.'+this.request.mode;
								if (!g740.icons.getIconClassName(icon)) icon='';
							}
							if (!icon) icon=this.request.name;
						}
						
						this.description=description;
						this.label=label;
						this.icon=icon;
						this.iconClass=g740.icons.getIconClassName(icon);
						if (!this.iconClass) {
							this.iconClass=g740.icons.getIconClassName('default');
							this.icon='default';
						}
					}
					finally {
					}
				},
				destroy: function() {
					var procedureName='g740.ToolbarButton.destroy';
					try {
						this.objForm=null;
						this.request={};
						this.inherited(arguments);
					}
					finally {
					}
				},
				getRequestAttr: function() {
					var result={
						objForm: this.objForm,
						rowsetName: this.rowsetName,
						save: this.request.save,
						close: this.request.close
					};
					if (this.request.name=='form') {
						result['modal']=this.request.modal;
						result['closable']=this.request.closable;
						result['width']=this.request.width;
						result['height']=this.request.height;
					}
					if (this.request.name=='httpget' || this.request.name=='httpput') {
						result['url']=this.request.url;
						result['ext']=this.request.ext;
						result['windowName']=this.request.windowName;
					}
					return result;
				},
				getEnabled: function() {
					if (this.request.name=='clipboard') {
						try {
							if (this.request.mode=='paste') return false;
							return document.queryCommandSupported(this.request.mode);
						}
						catch (e) {
						}
						return false;
					}
					if (!this.objForm) return false;
					if (this.objForm.isActionExecuted) return false;
					if (this.objForm.fifoRequests.length>0) return false;
					
					var obj=this.getObjRowSet();
					if (!obj) obj=this.objForm;
					if (!obj) return false;
					if (!obj.getRequestEnabled) return false;
					if (this.request.js_enabled) {
						var isEnabled=g740.js_eval(obj, this.request.js_enabled, true);
						if (!isEnabled) return false;
						if (isEnabled=='0') return false;
					}
					if (this.request.name=='connect' || this.request.name=='disconnect' || this.request.name=='form') {
						if (this.request.name=='form' && !this.request.mode) return false;
						return true;
					}
					if (!this.request.name && this.request.exec) return true;
					result=obj.getRequestEnabled(this.request.name, this.request.mode);
					return result;
				},
				exec: function(isNoConfirm) {
					if (!this.getEnabled()) return false;
					if (this.request.name=='clipboard') {
						try {
							document.execCommand(this.request.mode);
						}
						catch(e) {
						}
						return true;
					}
					var obj=this.objForm;
					var objRowSet=this.getObjRowSet();
					if (objRowSet) obj=objRowSet;
					if (obj.getRequest) {
						var r=obj.getRequest(this.request.name, this.request.mode);
						if (r) {
							if (!this.request.confirm && r.confirm) this.request.confirm=r.confirm;
							if (!this.request.lock && r.lock) this.request.lock=r.lock;
						}
					}
					if (this.request.confirm) {
						var objOwner=null;
						if (this.objForm) objOwner=this.objForm.objFocusedPanel;
						g740.showConfirm({
							messageText: this.request.confirm,
							closeObj: this,
							onCloseOk: this._execGoStart,
							objOwner: objOwner
						});
						return true;
					}
					else {
						this._execGoStart();
					}
					return true;
				},
				_execGoStart: function() {
					if (this.request.lock) {
						g740.application.doLockScreenShow();
						g740.execDelay.go({
							obj: this,
							func: this._execGo,
							delay: 50
						});
					}
					else {
						this._execGo();
					}
				},
				_execGo: function() {
					if (!this.objForm) return false;
					if (!this.getEnabled()) return false;
					this.objForm.isActionExecuted=true;
					try {
						var obj=this.objForm;
						var objRowSet=this.getObjRowSet();
						if (objRowSet) {
							var objFocusedRowSet=this.objForm.getFocusedRowSet();
							if (objFocusedRowSet && objFocusedRowSet!=objRowSet && !objFocusedRowSet.isFilter && objFocusedRowSet.getExistUnsavedChanges()) {
								if (!objFocusedRowSet.exec({requestName: 'save'})) return false;
							}
							obj=objRowSet;
						}
						if (!obj) return false;
						if (this.request.save) {
							var objFocusedRowSet=this.objForm.getFocusedRowSet();
							if (objFocusedRowSet && !objFocusedRowSet.isFilter && objFocusedRowSet.getExistUnsavedChanges()) {
								if (!objFocusedRowSet.exec({requestName: 'save'})) return false;
							}
						}
						var G740params={};
						if (obj._getRequestG740params) {
							var ppp=obj._getRequestG740params(this.request.params);
							for(var name in ppp) G740params[name]=ppp[name];
						}
				
						var result=obj.exec({
							requestName: this.request.name, 
							requestMode: this.request.mode,
							G740params: G740params,
							attr: this.getRequestAttr()
						});
					}
					finally {
						if (this.request.lock) g740.application.doLockScreenHide();
						
						g740.execDelay.go({
							obj: this,
							func: function() {
								if (!this.objForm) return false;
								this.objForm.isActionExecuted=false;
								this.objForm.doG740Repaint();
							},
							delay: 50
						})
					}
				},
		
				getIconClass: function(size) {
					var icon=this.icon;
					if (this.request.js_icon) {
						var obj=this.getObjRowSet();
						if (!obj) obj=this.objForm;
						if (obj && obj.isObjectDestroed) obj=null;
						if (obj) {
							icon=g740.js_eval(obj, this.request.js_icon, icon);
						}
					}
					return g740.icons.getIconClassName(icon, size);
				},
				getVisible: function() {
					if (this.request.js_visible) {
						var obj=this.getObjRowSet();
						if (!obj) obj=this.objForm;
						if (obj && obj.isObjectDestroed) obj=null;
						if (obj) {
							return g740.js_eval(obj, this.request.js_visible, true)?1:0;
						}
					}
					return 1;
				},
				getCaption: function() {
					var result=this.label;
					if (this.request.js_caption) {
						var obj=this.getObjRowSet();
						if (!obj) obj=this.objForm;
						if (obj && obj.isObjectDestroed) obj=null;
						if (obj) {
							result=g740.js_eval(obj, this.request.js_caption, this.label);
						}
					}
					if (!result) result='';
					return result;
				},
				getObjRowSet: function() {
					var result=null;
					if (!this.objForm) return null;
					if (this.objForm.isObjectDestroed) return null;
					if (!this.rowsetName) return null;
					if (this.rowsetName=='#focus') {
						result=this.objForm.getFocusedRowSet();
					}
					else {
						var result=this.objForm.rowsets[this.rowsetName];
					}
					if (result && result.isObjectDestroed) result=null;
					return result;
				}
			}
		);
		
		return g740;
	}
);