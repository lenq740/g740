/**
 * G740Viewer
 * Copyright 2017-2019 Galinsky Leonid lenq740@yandex.ru
 * Licensed under the BSD license
 */

define(
	[],
	function() {
		if (typeof(g740)=='undefined') g740={};
// g740.PanelFields - панель анкеты полей
		dojo.declare(
			'g740.PanelFields',
			[g740._PanelAbstract, dijit._TemplatedMixin],
			{
				isG740Fields: true,
				isG740Clipboard: true,
				isG740CanToolBar: true,
				isG740CanButtons: true,
				isLayoutContainer: true,
				lines: [],
				columns: {},
				linesMinWidth: [],
				_childs: [],
				title: '',
				isLabelTop: false,
				padding: '2px',
				deltaH: 5,
				deltaW: 8,
				objToolBar: null,
				objPanelButtons: null,
				colorReadOnly: 'gray',
				templateString: 
					'<div class="g740-fieldsmultiline">'+
					'<div data-dojo-attach-point="domNodeTitle"></div>'+
					'<div data-dojo-attach-point="domNodeToolbar"></div>'+
					'<div data-dojo-attach-point="domNodeDivPadding">'+
						'<div class="g740-fieldsmultiline-body" data-dojo-attach-point="domNodeDivBody"></div>'+
					'</div>'+
					'<div data-dojo-attach-point="domNodeButtons"></div>'+
					'</div>',
				
				set: function(name, value) {
					if (name=='fields' && value) {
						this._isRendered=false;
						this.lines=[];
						this.columns={};
						var objRowSet=this.getRowSet();
						if (!objRowSet) return false;
						if (!value) return false;
						if (typeof(value)!='object') return false;
						if (!value.length) return false;
						var rowsetFields=objRowSet.getFieldsByNodeType(this.nodeType);
						
						var lineNames={};
						var lineCount=0;
						for(var i=0; i<value.length; i++) {
							var fldNew=value[i];
							if (!fldNew) continue;
							var fieldName=fldNew.name;
							var fldRowSet=rowsetFields[fieldName];
							if (!fldRowSet) continue;
							var fld={};
							for (var paramName in fldRowSet) fld[paramName]=fldRowSet[paramName];
							for (var paramName in fldNew) fld[paramName]=fldNew[paramName];
							
							var lineName=fld.line;
							if (!lineName) lineName='linename-autogen-'+lineCount;
							var lineIndex=lineNames[lineName];
							if (!lineIndex && lineIndex!==0) {
								lineIndex=lineCount;
								lineCount++;
								if (!fld.column) fld.column='columnname-autogen-first';
								lineNames[lineName]=lineIndex;
								this.lines[lineIndex]=[];
							}
							if (fld.column) this.columns[fld.column]=0;
							var fields=this.lines[lineIndex];
							fields.push(fld);
						}
						return true;
					}
					this.inherited(arguments);
				},
				constructor: function(para, domElement) {
					var procedureName='g740.PanelFields.constructor';
					this.lines=[];
					this._childs=[];
					this.set('objForm',para.objForm);
					this.set('rowsetName',para.rowsetName);
					if (para.nodeType) this.set('nodeType', para.nodeType);
					this.on('Focus', this.onG740Focus);
				},
				destroy: function() {
					var procedureName='g740.PanelFields.destroy';
					if (this.lines) {
						for(var i=0; i<this.lines.length; i++) this.lines[i]=null;
						this.lines=[];
					}
					if (this._childs) {
						for(var i=0; i<this._childs.length; i++) {
							var obj=this._childs[i];
							if (!obj) continue;
							obj.destroyRecursive();
							this._childs[i]=null;
						}
						this._childs=[];
					}
					this.columns={};
					this.linesMinWidth=[];
					
					if (this.objToolBar) {
						this.objToolBar.destroyRecursive();
						this.objToolBar=null;
					}
					if (this.objPanelButtons) {
						this.objPanelButtons.destroyRecursive();
						this.objPanelButtons=null;
					}
					
					this.inherited(arguments);
				},
				addChild: function(obj) {
					if (!obj) return;
					if (obj.g740className=='g740.Toolbar') {
						if (this.objToolBar) this.objToolBar.destroyRecursive();
						this.objToolBar=obj;
						if (this.objToolBar.domNode && this.domNodeToolbar) this.domNodeToolbar.appendChild(this.objToolBar.domNode);
					} 
					else if (obj.isG740PanelButtons) {
						if (this.objPanelButtons) this.objPanelButtons.destroyRecursive();
						this.objPanelButtons=obj;
						if (this.objPanelButtons.domNode && this.domNodeButtons) this.domNodeButtons.appendChild(this.objPanelButtons.domNode);
					}
				},
				postCreate: function() {
					this.inherited(arguments);
					this.domNode.title='';
					this.renderTitle();
					this.render();
				},
				_isRendered: false,
				renderTitle: function() {
					if (!this.domNodeTitle) return false;
					if (!this.domNodeDivBody) return false;
					this.domNodeTitle.innerHTML='';
					if (this.title && this.isShowTitle) {
						objDiv=document.createElement('div');
						objDiv.className='g74-paneltitle';
						var objText=document.createTextNode(this.title);
						objDiv.appendChild(objText);
						this.domNodeTitle.appendChild(objDiv);
					}
					else {
						dojo.style(this.domNodeDivPadding, 'padding-top', this.padding);
					}
					dojo.style(this.domNodeDivPadding, 'padding-bottom', this.padding);
				},
				render: function() {
					if (!this.domNodeTitle) return false;
					if (!this.domNodeDivBody) return false;

					for(var i=0; i<this._childs.length; i++) {
						var obj=this._childs[i];
						if (!obj) continue;
						obj.destroyRecursive();
						this._childs[i]=null;
					}
					this._childs=[];
					this.linesMinWidth=[];
					
					this.domNodeDivBody.innerHTML='';
					var top=0;
					for(var i=0; i<this.lines.length; i++) {
						this.linesMinWidth[i]=0;
						var line=this.lines[i];
						var lineH=0;
						for(var index=0; index<line.length; index++) {
							var fld=line[index];
							var p={
								objForm: this.objForm,
								objPanel: this,
								rowsetName: this.rowsetName,
								fieldName: fld.name,
								fieldDef: fld,
								colorReadOnly: this.colorReadOnly,
								nodeType: this.nodeType
							};
							if (fld.rowId) p.rowId=fld.rowId;
							var objFieldEditor=g740.panels.createObjField(fld, p, null);
							var label=fld.name;
							if (fld.caption) label=fld.caption;
							if (fld.type=='check' || fld.type=='icons') label='';
							var objFC=new g740.FieldContainer({
								isLabelTop: this.isLabelTop,
								label: label,
								objFieldEditor: objFieldEditor,
								style: 'opacity:0'
							}, null);
							if (fld.stretch) {
								fld.stretch=false;
								objFC.isStretch=true;
							}
							this.domNodeDivBody.appendChild(objFC.domNode);
							var h=objFC.getHeight();
							dojo.style(objFC.domNode,'position','absolute');
							dojo.style(objFC.domNode,'top',top+'px');
							
							if (lineH<h) lineH=h;
							fld.objFC=objFC;
							objFC.doResize();
						}
						if (lineH) top+=lineH+this.deltaH;
					}
					for(var i=0; i<this.lines.length; i++) {
						var line=this.lines[i];
						for(var index=0; index<line.length; index++) {
							var fld=line[index];
							if (!fld) continue;
							if (!fld.objFC) continue;
							this._childs.push(fld.objFC.objFieldEditor);
						}
					}
					dojo.style(this.domNodeDivBody,'height',top+'px');

					// Вычисляем левую позицию исходя из минимальной ширины поля
					var isChanged=true;
					while(isChanged) {
						isChanged=false;
						for(var i=0; i<this.lines.length; i++) {
							var line=this.lines[i];
							if (this._rebuildLineLeftPosition(i,{isMinWidth: true})) isChanged=true;
							var fldLast=line[line.length-1];
							objFC=fldLast.objFC;
							this.linesMinWidth[i]=objFC.left+objFC.getMinWidth();
						}
					}
					// Предварительная обработка strtech полей
					for(var i=0; i<this.lines.length; i++) {
						var line=this.lines[i];
						
						// разбиваем строку на колонки
						var columns=[];
						var lst=[];
						columns.push(lst);
						for(var index=0; index<line.length; index++) {
							var fld=line[index];
							if (!fld) continue;
							objFC=fld.objFC;
							if (!objFC) continue;
							if (fld.column) {
								var lst=columns[columns.length-1];
								if (lst.length>0) columns.push([]);
							}
							var lst=columns[columns.length-1];
							lst.push(fld);
						}
						
						// все колонки, кроме последней, выравниваем по stretch
						for(var index=0; index<columns.length-1; index++) {
							var lst=columns[index];
							if (lst.length==0) continue;
							var countStretch=0;
							for (var j=0; j<lst.length; j++) {
								var fld=lst[j];
								objFC=fld.objFC;
								if (objFC.isStretch) countStretch++;
							}
							if (countStretch==0) continue;
							
							var fld=lst[lst.length-1];
							objFC=fld.objFC;
							var x0=objFC.left+objFC.getMinWidth()+this.deltaW;
							var lst1=columns[index+1];
							var fld1=lst1[0];
							objFC1=fld1.objFC;
							var x1=objFC1.left;
							var delta=x1-x0;
							
							for (var j=0; j<lst.length; j++) {
								var fld=lst[j];
								objFC=fld.objFC;
								if (!objFC.isStretch) continue;
								objFC.isStretch=false;
								var w=objFC.getFieldMinWidth();
								var deltaW=parseInt(delta/countStretch);
								objFC.setFieldWidth(w+deltaW);
								delta-=deltaW;
								countStretch--;
							}
						}
						this._rebuildLineLeftPosition(i,{isWidth: true});
					}
					// Проставляем левую позицию
					for(var i=0; i<this.lines.length; i++) {
						var line=this.lines[i];
						var left=this.deltaW;
						for(var index=0; index<line.length; index++) {
							var fld=line[index];
							if (!fld) continue;
							objFC=fld.objFC;
							if (!objFC) continue;
							var left=objFC.left;
							objFC.left=0;
							objFC.set('left', left);
						}
					}
					// Делаем элементы видимыми
					for(var i=0; i<this.lines.length; i++) {
						var line=this.lines[i];
						var left=this.deltaW;
						for(var index=0; index<line.length; index++) {
							var fld=line[index];
							if (!fld) continue;
							objFC=fld.objFC;
							if (!objFC) continue;
							dojo.style(objFC.domNode,'opacity','1');
						}
					}
					this._isRendered=true;
					this.layout();
				},
				// пересчет левых позиций элементов для строки
				_rebuildLineLeftPosition: function(lineIndex, params) {
					if (!params) params={};
					var result=false;
					if (!this.lines) return result;
					var line=this.lines[lineIndex];
					if (!line) return result;
					var left=this.deltaW;
					for(var i=0; i<line.length; i++) {
						var fld=line[i];
						if (!fld) continue;
						objFC=fld.objFC;
						if (!objFC) continue;
						if (fld.column) {
							var fldColumnLeftPosition=left+objFC.getFieldLeftPosition();
							if (this.columns[fld.column]<fldColumnLeftPosition) {
								this.columns[fld.column]=fldColumnLeftPosition;
								result=true;
							}
							if (this.columns[fld.column]>fldColumnLeftPosition) {
								left=this.columns[fld.column]-objFC.getFieldLeftPosition();
							}
						}
						if (objFC.left!=left) {
							result=true;
							if (params.isGo) {
								objFC.set('left', left);
							} else {
								objFC.left=left;
							}
						}

						var w=0;
						if (params.isMinWidth) w=objFC.getMinWidth();
						else if (params.isWidth) w=objFC.getWidth();
						if (w) left+=w+this.deltaW;
					}
					return result;
				},
				
				layout: function() {
					if (!this._isRendered) return true;
					if (this.objPanelButtons) this.objPanelButtons.resize();
					var panelWidth=this.domNode.clientWidth-this.deltaW;

					for(var i=0; i<this.lines.length; i++) {
						var line=this.lines[i];
						
						// Находим список stretch полей
						var lst=[];
						for(var index=0; index<line.length; index++) {
							var fld=line[index];
							if (!fld) continue;
							objFC=fld.objFC;
							if (!objFC) continue;
							if (objFC.isStretch) lst.push(fld);
						}
						if (lst.length==0) continue;
						var lineMinWidth=this.linesMinWidth[i];
						var lineWidth=panelWidth;
						if (lineWidth<lineMinWidth) lineWidth=lineMinWidth;
						var delta=lineWidth-lineMinWidth;
						var countStretch=lst.length;
						for (var j=0; j<lst.length; j++) {
							var fld=lst[j];
							objFC=fld.objFC;
							var w=objFC.getFieldMinWidth();
							var deltaW=parseInt(delta/countStretch);
							objFC.setFieldWidth(w+deltaW);
							delta-=deltaW;
							countStretch--;
						}
						this._rebuildLineLeftPosition(i,{
							isWidth: true,
							isGo: true
						});
					}
				},
				resize: function(size) {
					if (!this.domNode) return false;
					if (!size) return true;
					dojo.style(this.domNode,'left',size.l+'px');
					dojo.style(this.domNode,'top',size.t+'px');
					dojo.style(this.domNode,'width',size.w+'px');
					dojo.style(this.domNode,'height',size.h+'px');
					this.layout();
				},
				doG740Repaint: function(para) {
					var objRowSet=this.getRowSet();
					if (!objRowSet) return false;
					if (!para) para={};
					if (this.objToolBar) this.objToolBar.doG740Repaint(para);
					if (this.objPanelButtons) this.objPanelButtons.doG740Repaint(para);
					if (para.isEnabledOnly && !para.isFull && !para.isRowUpdate && !para.isNavigate) return true;
					if (para.objRowSet && para.objRowSet.name!=this.rowsetName) return true;
					for(var i=0; i<this._childs.length; i++) {
						var obj=this._childs[i];
						if (!obj) continue;
						if (obj.fieldDef && obj.fieldDef.objFC) {
							if (obj.fieldDef.objFC.doG740Repaint) obj.fieldDef.objFC.doG740Repaint();
						}
						else {
							if (obj.doG740Repaint) obj.doG740Repaint();
						}
					}
				},
				onG740Focus: function() {
					if (this.objForm) this.objForm.onG740ChangeFocusedPanel(this);
					return true;
				},
				
				canFocused: function() {
					var result=false;
					for(var i=0; i<this._childs.length; i++) {
						var obj=this._childs[i];
						if (!obj) continue;
						if (!obj.getVisible()) continue;
						result=true;
						break;
					}
					return result;
				},
				doG740Focus: function() {
					this.inherited(arguments);
					var objChildFirst=null;
					for(var i=0; i<this._childs.length; i++) {
						var obj=this._childs[i];
						if (!obj) continue;
						if (!obj.getVisible()) continue;
						if (!objChildFirst)	objChildFirst=obj;
						if (obj.isLastFocused) objChildFirst=obj;
					}
					if (objChildFirst) objChildFirst.set('focused',true);
				},
				doG740FocusChildFirst: function() {
					var objChild=null;
					for(var i=0; i<this._childs.length; i++) {
						var obj=this._childs[i];
						if (!obj) continue;
						if (!obj.getVisible()) continue;
						objChild=obj;
						break;
					}
					if (objChild) objChild.set('focused',true);
				},
				doG740FocusChildLast: function() {
					var objChild=null;
					for(var i=this._childs.length-1; i>=0; i--) {
						var obj=this._childs[i];
						if (!obj) continue;
						if (!obj.getVisible()) continue;
						objChild=obj;
						break;
					}
					if (objChild) objChild.set('focused',true);
				},
				doG740FocusChildNext: function(objChild) {
					var index=this._childs.length;
					for(var i=0; i<this._childs.length; i++) {
						if (objChild==this._childs[i]) {
							index=i;
							break;
						}
					}
					var objChild=null;
					for(var i=index+1; i<this._childs.length; i++) {
						var obj=this._childs[i];
						if (!obj) continue;
						if (!obj.getVisible()) continue;
						objChild=obj;
						break;
					}
					if (objChild) {
						objChild.set('focused',true);
					}
					else {
						var objParent=this.getParent();
						if (objParent && objParent.doG740FocusChildNext) objParent.doG740FocusChildNext(this);
					}
				},
				doG740FocusChildPrev: function(objChild) {
					var index=-1;
					for(var i=0; i<this._childs.length; i++) {
						if (objChild==this._childs[i]) {
							index=i;
							break;
						}
					}
					var objChild=null;
					for(var i=index-1; i>=0; i--) {
						var obj=this._childs[i];
						if (!obj) continue;
						if (!obj.getVisible()) continue;
						objChild=obj;
						break;
					}
					if (objChild) {
						objChild.set('focused',true);
					}
					else {
						var objParent=this.getParent();
						if (objParent && objParent.doG740FocusChildPrev) objParent.doG740FocusChildPrev(this);
					}
				}
			}
		);
		g740.panels._builderPanelFields=function(xml, para) {
			var result=null;
			var procedureName='g740.panels._builderPanelFields';
			if (!g740.xml.isXmlNode(xml)) g740.systemError(procedureName, 'errorValueUndefined', 'xml');
			if (xml.nodeName!='panel') g740.systemError(procedureName, 'errorXmlNodeNotFound', xml.nodeName);
			if (!para) g740.systemError(procedureName, 'errorValueUndefined', 'para');
			if (!para.objForm) g740.systemError(procedureName, 'errorValueUndefined', 'para.objForm');
			if (!para.rowsetName) {
				g740.trace.goBuilder({
					formName: para.objForm.name,
					panelType: 'fields',
					messageId: 'errorRowSetNameEmpty'
				});
				return null;
			}
			var objRowSet=para.objForm.rowsets[para.rowsetName];
			if (!objRowSet) {
				g740.trace.goBuilder({
					formName: para.objForm.name,
					panelType: 'fields',
					rowsetName: para.rowsetName,
					messageId: 'errorRowSetNotFoundInForm'
				});
				return null;
			}
			
			var rowsetFields=objRowSet.getFieldsByNodeType(para.nodeType);
			var fields=[];
			var xmlFields=g740.xml.findFirstOfChild(xml,{nodeName:'fields'});
			if (!g740.xml.isXmlNode(xmlFields)) xmlFields=xml;
			var lst=g740.xml.findArrayOfChild(xmlFields,{nodeName:'field'});
			for(var i=0; i<lst.length; i++) {
				var xmlField=lst[i];
				var fld=g740.panels.buildFldDef(xmlField);
				if (g740.xml.isAttr(xmlField,'line')) fld.line=g740.xml.getAttrValue(xmlField,'line','');
				if (g740.xml.isAttr(xmlField,'column')) fld.column=g740.xml.getAttrValue(xmlField,'column','');
				
				if (!fld.name) continue;
				if (!fld.visible) continue;
				var fldRowSet=rowsetFields[fld.name];
				if (!fldRowSet) continue;
				if (fldRowSet.visible===false) continue;

				if (para.nodeType) fld.nodeType=para.nodeType;
				fields.push(fld);
			}
			para.fields=fields;
			if (g740.xml.getAttrValue(xml,'captionup','0')=='1') para.isLabelTop=true;
			if (g740.xml.isAttr(xml,'color.readonly')) {
				var color=g740.xml.getAttrValue(xml,'color.readonly','');
				if (color=='white') color='';
				para.colorReadOnly=color;
			}
			var result=new g740.PanelFields(para, null);
			return result;
		};
		g740.panels.registrate('fields', g740.panels._builderPanelFields);

// g740.PanelAttribute - панель аттрибутов, набираемых из строк таблицы
		dojo.declare(
			'g740.PanelAttribute',
			[g740.PanelFields],
			{
				doG740Repaint: function(para) {
					var objRowSet=this.getRowSet();
					if (!objRowSet) return false;
					if (!para) para={};

					if (this.objToolBar) this.objToolBar.doG740Repaint(para);
					if (this.objPanelButtons) this.objPanelButtons.doG740Repaint(para);
					if (para.isEnabledOnly && !para.isFull && !para.isRowUpdate && !para.isNavigate) return true;
					if (para.objRowSet && objRowSet!=para.objRowSet) return false;
					if (para.isFull) {
// Борьба с морганием при перечитке
// Если источник данных пуст и еще не начитан, то делаем все элементы ReadOnly и ждем перерисовки после начитки. Если в течении секунды все еще не начитан, то перерисовываем пустой
						if (objRowSet.isEnabled || para.isRenderForce) {
							var fields=this.getFields();
							this.set('fields',fields);
							this.render();
							this.layout();
						}
						else {
							for(var i=0; i<this._childs.length; i++) {
								var obj=this._childs[i];
								if (!obj) continue;
								if (obj.fieldDef) obj.fieldDef.readonly=true;
							}
							g740.execDelay.go({
								delay: 1000,
								obj: this,
								func: function() {
									var objRowSet=this.getRowSet();
									if (!objRowSet) return false;
									if (!objRowSet.isEnabled) this.doG740Repaint({
										isFull: true,
										objRowSet: objRowSet,
										isRenderForce: true
									});
								}
							});
						}
					}
					
					if (this.objToolBar) this.objToolBar.doG740Repaint(para);
					if (this.objPanelButtons) this.objPanelButtons.doG740Repaint(para);
					if (para.objRowSet && para.objRowSet.name!=this.rowsetName) return true;
					for(var i=0; i<this._childs.length; i++) {
						var obj=this._childs[i];
						if (!obj) continue;
						if (obj.fieldDef && obj.fieldDef.objFC) {
							if (obj.fieldDef.objFC.doG740Repaint) obj.fieldDef.objFC.doG740Repaint();
						}
						else {
							if (obj.doG740Repaint) obj.doG740Repaint();
						}
					}
				},
				getFields: function() {
					var result=[];
					var objRowSet=this.getRowSet();
					if (!objRowSet) return result;
					var rowsetFields=objRowSet.getFieldsByNodeType('');
					var rowsetFldDefValue=rowsetFields['value'];
					
					var objTreeStorage=objRowSet.objTreeStorage;
					if (!objTreeStorage) return result;
					for (var node=objTreeStorage.getFirstChildNode(objTreeStorage.rootNode); node; node=objTreeStorage.getNextNode(node)) {
						var info=node.info;
						var fldDef={};
						fldDef.name='value';
						fldDef.rowId=info.id;
						fldDef.maxlength=rowsetFldDefValue.maxlength;
						fldDef.save=1;
						var type='string';
						var len=0;
						var dec=0;
						if (info['row.readonly']) fldDef.readonly=1;
						if (rowsetFields.caption) fldDef.caption=info['caption.value'];
						if (rowsetFields.stretch) (fldDef.stretch=info['stretch.value']==1);
						if (rowsetFields.type) type=info['type.value'];
						if (rowsetFields.len) len=info['len.value'];
						if (rowsetFields.dec) dec=info['dec.value'];
						
						fldDef.type=type;
						if (type=='date') {
							fldDef.len=10;
							if (rowsetFields.action && info['action.value']) fldDef.evt_onaction=info['action.value'];
						}
						else if (type=='num') {
							if (!len) len=10;
							fldDef.len=len;
							if (dec) fldDef.dec=dec;
							if (rowsetFields.action && info['action.value']) fldDef.evt_onaction=info['action.value'];
						}
						else if (type=='memo') {
							fldDef.stretch=1;
							if (rowsetFields.action && info['action.value']) fldDef.evt_onaction=info['action.value'];
						}
						else if (type=='radio') {
							if (!rowsetFields.list) continue;
							fldDef.list=info['list.value'].toString();
						}
						else if (type=='list') {
							if (!rowsetFields.list) continue;
							fldDef.list=info['list.value'].toString();
							if (len) {
								fldDef.len=len;
							}
							else {
								fldDef.stretch=1;
							}
							if (rowsetFields.action && info['action.value']) fldDef.evt_onaction=info['action.value'];
						}
						else if (type=='ref') {
							if (!rowsetFields.valueid) continue;
							
							var fldRefName=null;
							for(var index in rowsetFields) {
								var fld=rowsetFields[index];
								if (fld.refid!='valueid') continue;
								if (!fldRefName) {
									fldRefName=fld;
									continue;
								}
								if (fld.refname=='name') {
									fldRefName=fld;
									continue;
								}
							}
							if (!fldRefName) continue;
							
							fldDef.name=fldRefName.name;
							fldDef.refname=fldRefName.refname;
							fldDef.refid='valueid';
							fldDef.type='string';
							if (len) {
								fldDef.len=len;
							}
							else {
								fldDef.stretch=1;
							}
							if (rowsetFields.action && info['action.value']) fldDef.evt_onaction=info['action.value'];
						}
						else {
							fldDef.type='string';
							if (len) {
								fldDef.len=len;
							}
							else {
								fldDef.stretch=1;
							}
							if (rowsetFields.action && info['action.value']) fldDef.evt_onaction=info['action.value'];
						}
						result.push(fldDef);
					}
					return result;
				}
			}
		);
		g740.panels._builderPanelAttribute=function(xml, para) {
			var result=null;
			var procedureName='g740.panels._builderPanelAttribute';
			if (!g740.xml.isXmlNode(xml)) g740.systemError(procedureName, 'errorValueUndefined', 'xml');
			if (xml.nodeName!='panel') g740.systemError(procedureName, 'errorXmlNodeNotFound', xml.nodeName);
			if (!para) g740.systemError(procedureName, 'errorValueUndefined', 'para');
			if (!para.objForm) g740.systemError(procedureName, 'errorValueUndefined', 'para.objForm');
			if (!para.rowsetName) {
				g740.trace.goBuilder({
					formName: para.objForm.name,
					panelType: 'attribute',
					messageId: 'errorRowSetNameEmpty'
				});
				return null;
			}
			var objRowSet=para.objForm.rowsets[para.rowsetName];
			if (!objRowSet) {
				g740.trace.goBuilder({
					formName: para.objForm.name,
					panelType: 'attribute',
					rowsetName: para.rowsetName,
					messageId: 'errorRowSetNotFoundInForm'
				});
				return null;
			}
			
			var rowsetFields=objRowSet.getFieldsByNodeType(para.nodeType);
			var lst=['caption','type','value'];
			for(var i=0; i<lst.length; i++) {
				var fieldName=lst[i];
				if (!rowsetFields[fieldName]) {
					g740.trace.goBuilder({
						formName: para.objForm.name,
						panelType: 'attribute',
						rowsetName: para.rowsetName,
						messageId: 'errorNotFoundFieldName',
						fieldName: fieldName
					});
					return null;
				}
			}
			
			if (g740.xml.getAttrValue(xml,'captionup','0')=='1') para.isLabelTop=true;
			if (g740.xml.isAttr(xml,'color.readonly')) {
				var color=g740.xml.getAttrValue(xml,'color.readonly','');
				if (color=='white') color='';
				para.colorReadOnly=color;
			}
			var result=new g740.PanelAttribute(para, null);
			return result;
		};
		g740.panels.registrate('attribute', g740.panels._builderPanelAttribute);

		return g740;
	}
);