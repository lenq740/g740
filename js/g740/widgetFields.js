//-----------------------------------------------------------------------------
// Виджеты для использования в панелях
//-----------------------------------------------------------------------------
define(
	[],
	function() {
		if (typeof(g740)=='undefined') g740={};
		
		// Абстрактный предок всех полей
		dojo.declare(
			'g740.FieldEditor',
			null,
			{
				g740className: 'g740.FieldEditor',	// Имя базового класса
				objForm: null,
				objRowSet: null,
				objPanel: null,
				objActionGo: null,
				rowsetName: null,
				fieldName: null,
				nodeType: '',
				fieldDef: {},
				color: '',
				rowId: null,
				emptyValue: '',
				isSaveOnChange: false,
				isShowNullAsEmptyString: true,
				set: function(name, value) {
					if (name=='objForm') {
						this.objForm=value;
						this.objRowSet=this.getRowSet();
						return true;
					}
					if (name=='rowsetName') {
						this.rowsetName=value;
						this.objRowSet=this.getRowSet();
						return true;
					}
					if (name=='fieldName') {
						this.fieldName=value;
						return true;
					}
					if (name=='nodeType') {
						this.nodeType=value;
						return true;
					}
					if (name=='fieldDef') {
						this.fieldDef=value;
						return true;
					}
					if (name=='rowId') {
						this.rowId=value;
						return true;
					}
					if (name=='isSaveOnChange') {
						this.isSaveOnChange=value;
						return true;
					}
					if (name=='color') {
						this.color=value;
						return true;
					}
					if (name=='focused') {
						if (value) this.doG740Focus();
						return true;
					}
					this.inherited(arguments);
				},
				preamble: function(para, domElement) {
					var procedureName='g740.FieldEditor.preamble';
					try {
						var p=para.constraints;
						if (p) for(var name in p) if (!para[name]) para[name]=p[name];
						this.inherited(arguments);
					}
					finally {
					}
				},
				constructor: function(para, domElement) {
					var procedureName='g740.FieldEditor.constructor';
					try {
						this._repaint={
							isRepaint: false,
							value: ''
						};
					}
					finally {
					}
				},
				destroy: function() {
					var procedureName='g740.FieldEditor.destroy';
					try {
						this.objForm=null;
						this.objRowSet=null;
						this.fieldDef=null;
						this._repaint=null;
						if (this.objActionGo) {
							this.objActionGo.destroy();
							this.objActionGo=null;
						}
						this.objPanel=null;
						this.inherited(arguments);
					}
					finally {
					}
				},
				postMixInProperties: function() {
					this.inherited(arguments);
					var styles={};
					var lstStyles=[];
					if (this.style) lstStyles=this.style.split(';');
					for(var i=0; i<lstStyles.length; i++) {
						var item=lstStyles[i];
						if (!item) continue;
						var lst=item.split(':');
						if (lst.length!=2) continue;
						var name=dojo.string.trim(lst[0].toLowerCase());
						styles[name]=dojo.string.trim(lst[1]);
					}
					var w=this.getStyleWidth();
					if (w) {
						styles['width']=w;
					}
					var style='';
					for(var name in styles) {
						style+=name+':'+styles[name]+';';
					}
					this.style=style;
				},
				postCreate: function() {
					this.on('Change',this.onG740Change);
					this.on('Focus',this.onG740Focus);
					this.on('Blur',this.onG740Blur);
					this.on('KeyPress',this.onG740KeyPress);
					this.inherited(arguments);
				},
				getActionGo: function() {
					if (!this.objActionGo && this.fieldDef && this.fieldDef.on && this.fieldDef.on.dblclick) {
						var p={
							objForm: this.objForm,
							rowsetName: this.rowsetName,
							request: this.fieldDef.on.dblclick
						};
						this.objActionGo=new g740.Action(p);
					}
					return this.objActionGo;
				},
				getRowSet: function() {
					var procedureName='g740.FieldEditor.getRowSet';
					try {
						if (!this.objForm) return null;
						if (this.objForm.isObjectDestroed) return null;
						if(!this.rowsetName) return null;
						var objRowSet=this.objForm.rowsets[this.rowsetName];
						if (!objRowSet) return null;
						if (objRowSet.isObjectDestroed) return null;
					}
					finally {
					}
					return objRowSet;
				},
				getReadOnly: function() {
					if (!this.objRowSet) return true;
					if (this.fieldDef.readonly) return true;
					var rowId=this.rowId;
					if (rowId===null) rowId=this.objRowSet.getFocusedId();
					return this.objRowSet.getFieldProperty({fieldName: this.fieldName, propertyName: 'readonly', id: rowId});
				},
				getVisible: function() {
					if (!this.objRowSet) return false;
					if (this.fieldDef.visible===false) return false;
					return this.objRowSet.getFieldProperty({fieldName: this.fieldName, propertyName: 'visible'});
				},
				_getButtonWidth: function() {
					return 0;
				},
				getStyleWidth: function() {
					var w='';
					if (this.fieldDef.width) {
						w=this.fieldDef.width;
					}
					else if (this.fieldDef.len) {
						w=parseInt(this.fieldDef.len*g740.config.charwidth+this._getButtonWidth()+5)+'px';
					}
					var isStretch=false;
					if (!w) isStretch=true;
					if (this.fieldDef.stretch) isStretch=true;
					if (isStretch) w='100%';
					return w;
				},
				// Блокируем обратную отписку изменений в RowSet из перерисовки
				_repaint: {
					isRepaint: false,
					value: ''
				},
				doG740Repaint: function() {
					var procedureName='g740.FieldEditor.doG740Repaint';
					if (!this.objRowSet) return false;
					var rowId=this.rowId;
					if (rowId===null) rowId=this.objRowSet.getFocusedId();

					var value=this.objRowSet.getFieldProperty({fieldName: this.fieldName, propertyName: 'value', id: rowId});
					var readOnly=this.getReadOnly();
					
					if (this.objRowSet.isTree && this.nodeType) {
						var nodeType='';
						var node=this.objRowSet.objTreeStorage.getNode(rowId,this.objRowSet.getFocusedParentNode());
						if (node) nodeType=node.nodeType;
						if (this.nodeType!=nodeType) {
							value=this.emptyValue;
							readOnly=true;
						}
					}

					this._repaint.isRepaint=true;
					if (this.isShowNullAsEmptyString) {
						if (value==null) value='';
					}
					this._repaint.value=value;

					var textValue=this.convertFromValueToTextValue(value);
					this.set('value',textValue);
					this.set('readOnly',readOnly);
					return true;
				},
				onG740Change: function(newTextValue) {
					try {
						if (!this.objRowSet) return false;
						var newValue=this.convertFromTextValueToValue(newTextValue);

						// Если onchange вызван из doG740Repaint, то отписывать обратно в RowSet не надо
						if (this._repaint.isRepaint) {
							var fields=this.objRowSet.getFieldsByNodeType(this.nodeType);
							var fld=fields[this.fieldName];
							if (!fld) return false;
							if (g740.convertor.toG740(newValue,fld.type)==g740.convertor.toG740(this._repaint.value,fld.type)) {
								this._repaint.isRepaint=false;
								this._repaint.value='';
								return true;
							}
						}
						var rowId=this.rowId;
						if (rowId===null) rowId=this.objRowSet.getFocusedId();

						// Если в дереве не то nodeType, то отписывать не надо
						if (this.objRowSet.isTree && this.nodeType) {
							var nodeType='';
							var node=this.objRowSet.objTreeStorage.getNode(rowId,this.objRowSet.getFocusedParentNode());
							if (node) nodeType=node.nodeType;
							if (this.nodeType!=nodeType) return false;
						}
						
						this.objRowSet.setFieldProperty({fieldName: this.fieldName, propertyName: 'value', value: newValue, id: rowId});
						if (this.isSaveOnChange && this.objRowSet.getExistUnsavedChanges()) {
							this.objRowSet.exec({requestName: 'save'});
						}
					}
					finally {
					}
				},
				
				convertFromValueToTextValue: function(value) {
					return value;
				},
				convertFromTextValueToValue: function(text) {
					return text;
				},
				
				onG740Focus: function() {
					if (this.rowId && this.objRowSet && this.rowId!=this.objRowSet.getFocusedId()) this.objRowSet.setFocusedId(this.rowId);
				},
				onG740Blur: function() {
				},
				onG740KeyPress: function(e) {
				},
				doG740Focus: function() {
					var node=this.domNode;
					if (this.focusNode) node=this.focusNode;
					if (node.focus) node.focus();
				},
				_isWaitClick: false,
				_setWaitClickToFalse: function() {
					this._isWaitClick=false;
				}
			}
		);
		
	    // Виджет для поля даты
		dojo.declare(
			'g740.FieldEditor.Date',
			[dijit.form.DateTextBox, g740.FieldEditor],
			{
				isShowNullAsEmptyString: false,
				constructor: function(para, domElement) {
					var procedureName='g740.FieldEditor.Date.constructor';
					try {
						this.set('datePattern','dd.MM.yyyy');
						this.set('selector','date');
						this.emptyValue=null;
						this.inherited(arguments);
					}
					finally {
					}
				},

				postCreate: function() {
					this.inherited(arguments);
				},
				_onKey: function(e) {
					if (e.keyCode==13 && e.ctrlKey) {
						// Ctrl+Enter
						dojo.stopEvent(e);
						if (!this.getReadOnly()) this.openDropDown();
					}
					else if (this._opened && e.keyCode == 27) {
						this.closeDropDown();
					}
					else if (!e.ctrlKey && (e.keyCode==13 || (e.keyCode==9 && !e.shiftKey))) {
						// Enter, Tab
						dojo.stopEvent(e);
						if (this.textbox) this.set('displayedValue',this.textbox.value);
						if (this.objPanel) this.objPanel.doG740FocusChildNext(this);
					}
					else if (!e.ctrlKey && (e.keyCode==9 && e.shiftKey)) {
						// Shift+Tab
						dojo.stopEvent(e);
						if (this.textbox) this.set('displayedValue',this.textbox.value);
						if (this.objPanel) this.objPanel.doG740FocusChildPrev(this);
					}
				},
				getStyleWidth: function() {
					var w='';
					if (this.fieldDef.width) {
						w=this.fieldDef.width;
					}
					else if (this.fieldDef.len) {
						w=parseInt(9*g740.config.charwidth+this._getButtonWidth())+'px';
					}
					var isStretch=false;
					if (!w) isStretch=true;
					if (this.fieldDef.stretch) isStretch=true;
					if (isStretch) w='100%';
					return w;
				},

				_getButtonWidth: function() {
					return 15;
				},
				openDropDown: function() {
					var objActionGo=this.getActionGo();
					if (objActionGo) {
						// предотвращаем дребезг
						if (this._isWaitClick) return false;
						this._isWaitClick=true;
						if (objActionGo && objActionGo.getEnabled()) objActionGo.exec();
						g740.execDelay.go({
							delay: 250,
							obj: this,
							func: this._setWaitClickToFalse
						});
						return false;
					}
					this.inherited(arguments);
				}
			}
		);
		// Виджет для поля строки
		dojo.declare(
			'g740.FieldEditor.String',
			[g740.TextBox, g740.FieldEditor],
			{
				constructor: function(para, domElement) {
					var procedureName='g740.FieldEditor.String.constructor';
					try {
						//this.inherited(arguments);
					}
					finally {
					}
				},
				postCreate: function() {
					if (this.fieldDef && this.fieldDef.on && this.fieldDef.on.dblclick) {
						this.set('buttonVisible',true);
					}
					this.on('ButtonClick',this.onG740ButtonClick);
					this.on('Blur',this.onG740Blur);
					this.inherited(arguments);
				},
				onG740Blur: function() {
					if (this.domNodeInput) this.onG740Change(this.domNodeInput.value);
				},
				onKeyDown: function(e) {
					if (e.keyCode==13 && e.ctrlKey) {
						// Ctrl+Enter
						dojo.stopEvent(e);
						this.onG740ButtonClick();
					}
					else if (!e.ctrlKey && (e.keyCode==13 || (e.keyCode==9 && !e.shiftKey))) {
						// Enter, Tab
						dojo.stopEvent(e);
						if (this.domNodeInput) this.onG740Change(this.domNodeInput.value);
						if (this.objPanel) this.objPanel.doG740FocusChildNext(this);
					}
					else if (!e.ctrlKey && (e.keyCode==9 && e.shiftKey)) {
						// Shift+Tab
						dojo.stopEvent(e);
						if (this.domNodeInput) this.onG740Change(this.domNodeInput.value);
						if (this.objPanel) this.objPanel.doG740FocusChildPrev(this);
					}
				},
				onG740ButtonClick: function() {
					if (this.getReadOnly()) return false;
					if (this.objRowSet && this.rowId!==null) {
						if (this.objRowSet.getFocusedId()!=this.rowId) {
							if (!this.objRowSet.setFocusedId(this.rowId)) return false;
						}
					}
					// предотвращаем дребезг
					if (this._isWaitClick) return false;
					this._isWaitClick=true;
					this.domNodeInput.focus();
					var objActionGo=this.getActionGo();
					if (objActionGo && objActionGo.getEnabled()) objActionGo.exec();
					g740.execDelay.go({
						delay: 250,
						obj: this,
						func: this._setWaitClickToFalse
					});
				}
			}
		);
		// Виджет для поля многострочного редактора
		dojo.declare(
			'g740.FieldEditor.Memo',
			[g740.Memo, g740.FieldEditor],
			{
				constructor: function(para, domElement) {
					var procedureName='g740.FieldEditor.Memo.constructor';
					try {
						this.inherited(arguments);
					}
					finally {
					}
				},
				postCreate: function() {
					var rows=4;
					if (this.fieldDef.rows) rows=this.fieldDef.rows;
					dojo.style(this.domNodeTextArea, 'height', rows*g740.config.charheight+'px');
					this.on('ButtonClick',this.onG740ButtonClick);
					this.on('Blur',this.onG740Blur);
					this.inherited(arguments);
				},
				onG740Blur: function() {
					if (this.domNodeTextArea) this.onG740Change(this.domNodeTextArea.value);
				},
				onG740ButtonClick: function() {
					if (this.objRowSet && this.rowId!==null) {
						if (this.objRowSet.getFocusedId()!=this.rowId) {
							if (!this.objRowSet.setFocusedId(this.rowId)) return false;
						}
					}
					// предотвращаем дребезг
					if (this._isWaitClick) return false;
					this._isWaitClick=true;
					this.domNodeTextArea.focus();
					var objActionGo=this.getActionGo();
					if (objActionGo) {
						if (!this.getReadOnly() && objActionGo.getEnabled()) objActionGo.exec();
					}
					else {
						var objDialog=new g740.DialogEditorMemo(
							{ 
								objForm: this.objForm,
								rowsetName: this.rowsetName,
								fieldName: this.fieldName,
								nodeType: this.nodeType,
								domNodeOwner: this.domNode,
								readOnly: this.getReadOnly(),
								objOwner: this,
								duration: 0, 
								draggable: false
							}
						);
						objDialog.show();
					}
					g740.execDelay.go({
						delay: 250,
						obj: this,
						func: this._setWaitClickToFalse
					});
				},
				onG740KeyPress: function(e) {
					if (e.keyCode==13 && e.ctrlKey) {
						// Ctrl+Enter
						dojo.stopEvent(e);
						this.onG740ButtonClick();
					}
					else if (!e.ctrlKey && (e.keyCode==13 || (e.keyCode==9 && !e.shiftKey))) {
						// Enter, Tab
						dojo.stopEvent(e);
						if (this.domNodeTextArea) this.onG740Change(this.domNodeTextArea.value);
						if (this.objPanel) this.objPanel.doG740FocusChildNext(this);
					}
					else if (!e.ctrlKey && (e.keyCode==9 && e.shiftKey)) {
						// Shift+Tab
						dojo.stopEvent(e);
						if (this.domNodeTextArea) this.onG740Change(this.domNodeTextArea.value);
						if (this.objPanel) this.objPanel.doG740FocusChildPrev(this);
					}
				}
			}
		);
		// Виджет для поля CheckBox
		dojo.declare(
			'g740.FieldEditor.Icons',
			[dijit._Widget, dijit._TemplatedMixin, g740.FieldEditor],
			{
				value: 0,
				icons: null,
				templateString: '<div class="g740-widget-icons" data-dojo-attach-event="onclick: onBodyClick">'+
					'<input type="checkbox" class="g740-focused" data-dojo-attach-point="focusNode" data-dojo-attach-event="'+
						'onkeypress: onKeyPress, onfocus: _onWidgetFocus, onblur: _onWidgetBlur'+
					'"></input>'+
					'<div class="g740-widget-icons-icon" data-dojo-attach-point="domNodeIcon" data-dojo-attach-event="onclick: doClick"></div>'+
					'<div class="g740-widget-icons-label" data-dojo-attach-point="domNodeLabel"></div>'+
				'</div>',
				constructor: function(para) {
				},
				set: function(name, value) {
					if (name=='value') {
						this.setValue(value);
						return true;
					}
					if (name=='readOnly') {
						if (value) {
							dojo.addClass(this.domNode, 'g740-readonly');
						}
						else {
							dojo.removeClass(this.domNode, 'g740-readonly');
						}
						return true;
					}
					this.inherited(arguments);
				},
				postCreate: function() {
					this.inherited(arguments);
					if (this.fieldDef) {
						var caption=this.fieldDef.name;
						if (this.fieldDef.caption) caption=this.fieldDef.caption;
						this.setLabel(caption);
						if (!this.icons) {
							var list='';
							if (this.fieldDef.list) list=this.fieldDef.list;
							this.icons=list.split(';')
						}
					}
					if (!this.icons) this.icons=[];
				},
				setLabel: function(value) {
					if (this.domNodeLabel) {
						this.domNodeLabel.innerHTML='';
						var domText=document.createTextNode(value);
						this.domNodeLabel.appendChild(domText);
					}
				},
				getBaseType: function() {
					var result='string';
					if (this.fieldDef && this.fieldDef.basetype=='num') result='num';
					return result;
				},
				setValue: function(value) {
					if (!this.icons) return false;
					var baseType=this.getBaseType();
					if (baseType=='num') {
						if (value>=this.icons.length) value=this.icons.length-1;
						if (value<0) value=0;
						this.value=value;
						if (this.domNodeIcon) this.domNodeIcon.className='g740-widget-icons-icon '+this.icons[value];
					}
					if (baseType=='string') {
						this.value=value;
						if (this.domNodeIcon) this.domNodeIcon.className='g740-widget-icons-icon '+value;
					}
				},
				convertFromValueToTextValue: function(value) {
					var baseType=this.getBaseType();
					if (baseType=='num') {
						if (typeof(value)=='boolean') value=value?1:0;
					}
					return value;
				},
				doClick: function() {
					if (!this.icons) return false;
					if (this.getReadOnly()) return false;
					var baseType=this.getBaseType();
					if (baseType=='num') {
						var value=this.value;
						value++;
						if (value>=this.icons.length) value=0;
						this.onG740Change(value);
					}
					if (baseType=='string') {
						var index=-1;
						for(var i=0; i<this.icons.length; i++) {
							if (this.icons[i]==this.value) {
								index=i;
								break;
							}
						}
						index++;
						if (index>=this.icons.length) index=0;
						this.onG740Change(this.icons[index]);
					}
				},
				onBodyClick: function() {
					this.set('focused',true);
				},
				_onWidgetFocus: function() {
					if (!dojo.hasClass(this.domNode, 'g740-widget-focused')) dojo.addClass(this.domNode, 'g740-widget-focused');
				},
				_onWidgetBlur: function() {
					if (dojo.hasClass(this.domNode, 'g740-widget-focused')) dojo.removeClass(this.domNode, 'g740-widget-focused');
				},
				onKeyPress: function(e) {
					if (!e.ctrlKey && (e.keyCode==13 || (e.keyCode==9 && !e.shiftKey))) {
						// Enter, Tab
						dojo.stopEvent(e);
						if (this.objPanel) this.objPanel.doG740FocusChildNext(this);
					}
					else if (!e.ctrlKey && (e.keyCode==9 && e.shiftKey)) {
						// Shift+Tab
						dojo.stopEvent(e);
						if (this.objPanel) this.objPanel.doG740FocusChildPrev(this);
					}
					else if (!e.ctrlKey && !e.shiftKey && e.charCode==32) {
						dojo.stopEvent(e);
						this.doClick();
					}
					else {
						dojo.stopEvent(e);
					}
				}
			}
		);
		dojo.declare(
			'g740.FieldEditor.Check',
			[g740.FieldEditor.Icons],
			{
				constructor: function(para) {
					this.icons=['check-off', 'check-on'];
				},
				getBaseType: function() {
					return 'num';
				}
			}
		);
		
	    // Виджет для поля List
		dojo.declare(
			'g740.FieldEditor.List',
			[g740.ComboBox, g740.FieldEditor],
			{
				postCreate: function() {
					this.inherited(arguments);
				},
				onG740Change: function(newValue) {
					return false;
				},
				_list: null,
				convertFromValueToTextValue: function(value) {
					var baseType='string';
					if (this.fieldDef && this.fieldDef.basetype=='num') baseType='num';
					if (baseType=='num') {
						value=g740.convertor.toJavaScript(value,'num');
						if (value<=0) return '';

						if (!this._list) {
							var list=this.fieldDef.list;
							if (!list) list='';
							this._list=list.split(';')
						}
						if (this._list.length<value) return '';
						return this._list[value-1];
					}
					return value;
				},
				convertFromTextValueToValue: function(text) {
					var baseType='string';
					if (this.fieldDef && this.fieldDef.basetype=='num') baseType='num';
					if (baseType=='num') {
						if (!text) return 0;
						if (!this._list) {
							var list=this.fieldDef.list;
							if (!list) list='';
							this._list=list.split(';')
						}
						for(var i=0; i<this._list.length; i++) {
							if (this._list[i]==text) return i+1;
						}
						return 0;
					}
					return text;
				},
				onButtonClick: function() {
					if (this.getReadOnly()) return false;
					if (this.objRowSet && this.rowId!==null) {
						if (this.objRowSet.getFocusedId()!=this.rowId) {
							if (!this.objRowSet.setFocusedId(this.rowId)) return false;
						}
					}
					// предотвращаем дребезг
					if (this._isWaitClick) return false;
					this._isWaitClick=true;
					this.domNodeInput.focus();

					var objActionGo=this.getActionGo();
					if (objActionGo) {
						if (objActionGo.getEnabled()) objActionGo.exec();
					}
					else {
						var filter='';
						if (this.domNodeInput && this.domNodeInput.value!=this._value) filter=this.domNodeInput.value;
						var objDialog=new g740.DialogEditorList(
							{ 
								objForm: this.objForm,
								rowsetName: this.rowsetName,
								fieldName: this.fieldName,
								fieldDef: this.fieldDef,
								nodeType: this.nodeType,
								domNodeOwner: this.domNode,
								objOwner: this,
								filter: filter,
								duration: 0, 
								draggable: false
							}
						);
						objDialog.show();
					}
					g740.execDelay.go({
						delay: 250,
						obj: this,
						func: this._setWaitClickToFalse
					});
				},
				onKeyDown: function(e) {
					if (e.keyCode==13 && e.ctrlKey) {
						// Ctrl+Enter
						dojo.stopEvent(e);
						this.onButtonClick();
					}
					else if (!e.ctrlKey && (e.keyCode==13 || (e.keyCode==9 && !e.shiftKey))) {
						// Enter, Tab
						dojo.stopEvent(e);
						if (this.domNodeInput && this.domNodeInput.value!=this._value) {
							this.onButtonClick();
						}
						else {
							if (this.objPanel) this.objPanel.doG740FocusChildNext(this);
						}
					}
					else if (!e.ctrlKey && (e.keyCode==9 && e.shiftKey)) {
						// Shift+Tab
						dojo.stopEvent(e);
						if (this.domNodeInput && this.domNodeInput.value!=this._value) {
							this.onButtonClick();
						}
						else {
							if (this.objPanel) this.objPanel.doG740FocusChildPrev(this);
						}
					}
				}
			}
		);
		// Виджет для поля справочника
		dojo.declare(
			'g740.FieldEditor.Ref',
			[g740.ComboBox, g740.FieldEditor],
			{
				postCreate: function() {
					this.inherited(arguments);
				},
				onG740Change: function(newValue) {
					return false;
				},
				isDialogOpened: false,
				onButtonClick: function() {
					if (this.getReadOnly()) return false;
					if (this.objRowSet && this.rowId!==null) {
						if (this.objRowSet.getFocusedId()!=this.rowId) {
							if (!this.objRowSet.setFocusedId(this.rowId)) return false;
						}
					}
					// предотвращаем дребезг
					if (this._isWaitClick) return false;
					this._isWaitClick=true;
					this.domNodeInput.focus();
					
					var objActionGo=this.getActionGo();
					if (objActionGo) {
						this.isDialogOpened=true;
						if (objActionGo.getEnabled()) {
							objActionGo.exec();
						}
					}
					else {
						var filter='';
						if (this.domNodeInput && this.domNodeInput.value!=this._value) filter=this.domNodeInput.value;
						this.isDialogOpened=true;
						var objDialog=new g740.DialogEditorRef(
							{ 
								objForm: this.objForm,
								rowsetName: this.rowsetName,
								fieldName: this.fieldName,
								nodeType: this.nodeType,
								domNodeOwner: this.domNode,
								objOwner: this,
								filter: filter,
								duration: 0,
								draggable: false
							}
						);
						objDialog.show();
					}
					g740.execDelay.go({
						delay: 250,
						obj: this,
						func: this._setWaitClickToFalse
					});
				},
				onKeyDown: function(e) {
					if (e.keyCode==13 && e.ctrlKey) {
						// Ctrl+Enter
						dojo.stopEvent(e);
						this.onButtonClick();
					}
					else if (!e.ctrlKey && (e.keyCode==13 || (e.keyCode==9 && !e.shiftKey))) {
						// Enter, Tab
						dojo.stopEvent(e);
						if (this.domNodeInput && this.domNodeInput.value!=this._value) {
							this.onButtonClick();
						}
						else {
							if (this.objPanel) this.objPanel.doG740FocusChildNext(this);
						}
					}
					else if (!e.ctrlKey && (e.keyCode==9 && e.shiftKey)) {
						// Shift+Tab
						dojo.stopEvent(e);
						if (this.domNodeInput && this.domNodeInput.value!=this._value) {
							this.onButtonClick();
						}
						else {
							if (this.objPanel) this.objPanel.doG740FocusChildPrev(this);
						}
					}
				},
				onBlur: function() {
					if (!this.isDialogOpened && this.domNodeInput && this.domNodeInput.value!=this._value) {
						this.domNodeInput.value=this._value;
					}
					this.inherited(arguments);
				},
				onFocus: function() {
					this.isDialogOpened=false;
					this.inherited(arguments);
				}
			}
		);
		// Виджет RadioGroup
		dojo.declare(
			'g740.FieldEditor.RadioGroupBox',
			[dijit._Widget, dijit._TemplatedMixin, g740.FieldEditor],
			{
				templateString: '<div class="g740-radiogroupbox"></div>',
				list: '',
				baseType: 'string',
				value: '',
				readOnly: false,
				groupname: '',
				_radioItems: null,
				set: function(name, value) {
					if (name=='list') {
						if (this.list!=value) {
							this.list=value;
							if (!this.list) this.list='';
						}
						return true;
					}
					if (name=='baseType') {
						if (this.baseType!=value) {
							if (value!='string' && value!='num') g740.systemError('g740.RadioGroupBox.set(baseType)',errorIncorrectValue, value);
							this.baseType=value;
						}
						return true;
					}
					if (name=='groupname') {
						if (this.groupname!=value) {
							this.groupname=value;
						}
						return true;
					}
					if (name=='value') {
						this.setValue(value);
						return true;
					}
					if (name=='readOnly') {
						this.setReadOnly(value);
						return true;
					}
					this.inherited(arguments);
				},
				destroy: function() {
					this._radioItems=null;
					this.inherited(arguments);
				},
				postCreate: function() {
					if (this.fieldDef) {
						this.list=this.fieldDef.list;
						this.baseType='string';
						if (this.fieldDef.basetype=='num') this.baseType='num';
					}
					this.groupname=this.rowsetName+'.'+this.fieldName;
					this.render();
					this.inherited(arguments);
				},
				setValue: function(value) {
					if (!this._radioItems) return false;
					var newValue='';
					if (this.baseType=='num') {
						value=g740.convertor.toJavaScript(value,'num');
						newValue=0;
					}
					
					var isFound=false;
					for(var i=0; i<this._radioItems.length; i++) {
						var domRadio=this._radioItems[i];
						var isOk=false;
						if (this.baseType=='num' && domRadio.valueIndex==value) isOk=true;
						if (this.baseType=='string' && domRadio.valueText==value) isOk=true;
						if (isOk) {
							domRadio.checked=true;
							newValue=value;
							isFound=true;
							break;
						}
					}
					if (!isFound) {
						for(var i=0; i<this._radioItems.length; i++) {
							var domRadio=this._radioItems[i];
							if (domRadio.checked) domRadio.checked=false;
						}
					}
					
					this.value=newValue;
				},
				setReadOnly: function(value) {
					value=(value)?true:false;
					if (value==this.readOnly) return true;
					if (!this._radioItems) return false;
					for(var i=0; i<this._radioItems.length; i++) {
						var domRadio=this._radioItems[i];
						domRadio.disabled=value;
					}
					this.readOnly=value;
					if (value) {
						if (!dojo.hasClass(this.domNode, 'dijitTextBoxReadOnly')) dojo.addClass(this.domNode, 'dijitTextBoxReadOnly');
					}
					else {
						if (dojo.hasClass(this.domNode, 'dijitTextBoxReadOnly')) dojo.removeClass(this.domNode, 'dijitTextBoxReadOnly');
					}
				},
				_onRadioChanged: function(e) {
					if (!this._radioItems) return false;
					var newValue='';
					for(var i=0; i<this._radioItems.length; i++) {
						var domRadio=this._radioItems[i];
						if (!domRadio.checked) continue;
						if (this.baseType=='num') newValue=domRadio.valueIndex;
						if (this.baseType=='string') newValue=domRadio.valueText;
						break;
					}
					if (this.value!=newValue) {
						this.value=newValue;
						this.onG740Change(newValue);
					}
				},
				render: function() {
					if (!this.domNode) return;
					this._radioItems=[];
					this.domNode.innerHTML='';
					var lst=this.list.split(';');
					if (this.groupname) {
						if (!g740.RadioGroupBoxName) g740.RadioGroupBoxName=0;
						g740.RadioGroupBoxName++;
						this.groupname='RadioGroupBox'+g740.RadioGroupBoxName;
					}
					for (var i=0; i<lst.length; i++) {
						var domDiv=document.createElement('div');
						var domLabel=document.createElement('label');
						var domLabelText=document.createTextNode(' '+lst[i]);
						
						var domRadio=document.createElement('input');
						domRadio.setAttribute('type','radio');
						domRadio.setAttribute('name',this.groupname);
						domRadio.valueIndex=i+1;
						domRadio.valueText=lst[i];
						dojo.on(domRadio, 'change', dojo.hitch(this, this._onRadioChanged));
						dojo.on(domRadio, 'keydown', dojo.hitch(this, this.onKeyDown));
						
						domLabel.appendChild(domRadio);
						domLabel.appendChild(domLabelText);
						domDiv.appendChild(domLabel);
						this.domNode.appendChild(domDiv);
						this._radioItems.push(domRadio);
					}
					var readOnly=this.readOnly;
					this.readOnly='';
					this.setReadOnly(readOnly);
				},
				doG740Focus: function() {
					if (!this._radioItems) return;
					var node=this._radioItems[0];
					if (node && node.focus) node.focus();
				},
				onKeyDown: function(e) {
					if (!e.ctrlKey && (e.keyCode==13 || (e.keyCode==9 && !e.shiftKey))) {
						// Enter, Tab
						dojo.stopEvent(e);
						if (this.objPanel) this.objPanel.doG740FocusChildNext(this);
					}
					else if (!e.ctrlKey && (e.keyCode==9 && e.shiftKey)) {
						// Shift+Tab
						dojo.stopEvent(e);
						if (this.objPanel) this.objPanel.doG740FocusChildPrev(this);
					}
				},
				onG740Focus: function() {
					if (!dojo.hasClass(this.domNode, 'g740-widget-focused')) dojo.addClass(this.domNode, 'g740-widget-focused');
					this.inherited(arguments);
				},
				onG740Blur: function() {
					if (dojo.hasClass(this.domNode, 'g740-widget-focused')) dojo.removeClass(this.domNode, 'g740-widget-focused');
					this.inherited(arguments);
				}
			}
		);
		// Виджет для поля RefList
		dojo.declare(
			'g740.FieldEditor.RefList',
			[dijit._Widget, dijit._TemplatedMixin, g740.FieldEditor],
			{
				templateString: '<div class="g740-widget-reflist">'+
					'<input type="checkbox" class="g740-focused" data-dojo-attach-point="domNodeFocused" data-dojo-attach-event="'+
						'onkeypress: onKeyPress'+
					'"></input>'+
					'<table class="g740-widget-table" cellpadding="0px" cellspacing="0px">'+
					'<tr>'+
						'<td>'+
							'<div class="g740-items" data-dojo-attach-point="domNodeItems" data-dojo-attach-event="'+
								'ondblclick: onButtonClick'+
							'">'+
							'</div>'+
						'</td>'+
						'<td style="width:23px" valign="top" align="center">'+
							'<div class="btnfieldeditor" data-dojo-attach-event="'+
							'onclick: onButtonClick'+
							'"></div>'+
							'<div class="btnfieldclear" data-dojo-attach-event="'+
							'onclick: onClearClick'+
							'"></div>'+
						'</td>'+
					'</tr>'+
					'</table>'+
				'</div>',
				readOnly: false,
				value: '',
				items: null,		// {'id': 'value', 'id[nodeType]': 'value'}
				ordered: null,		// ['id','id[nodeType]',...,'id']
				constructor: function(para) {
					this.items={};
					this.ordered=[];
				},
				destroy: function() {
					this.items={};
					this.ordered=[];
					this.inherited(arguments);
				},
				set: function(name, value) {
					if (name=='value') {
						this.setValue(value);
						return true;
					}
					if (name=='focused') {
						if (value) {
							if (this.domNodeFocused) this.domNodeFocused.focus();
						}
					}
					if (name=='readOnly') {
						this.setReadOnly(value);
						return true;
					}
					this.inherited(arguments);
				},
				postCreate: function() {
					this.render();
					this.focusNode=this.domNodeFocused;
					this.inherited(arguments);
				},
				setValue: function(newValue) {
					if (this.value==newValue) return true;
					this.items={};
					this.ordered=[];
					if (!newValue) newValue='';
					if (!newValue.toString) newValue='';
					newValue=newValue.toString();
					var lst=newValue.split("\n");
					for(var i=0; i<lst.length; i++) {
						var item=lst[i];
						var n=item.indexOf('=');
						if (n<0) continue;
						var name=item.substr(0,n);
						var value=item.substr(n+1,9999);
						this.items[name]=value;
						this.ordered.push(name);
					}
					this.value=this.getValue();
					this.render();
				},
				getValue: function() {
					var result='';
					for(var i=0; i<this.ordered.length; i++) {
						var name=this.ordered[i];
						var value=this.items[name];
						if (result) result+="\n";
						result+=name+'='+value;
					}
					this.value=result;
					return result;
				},
				setReadOnly: function(value) {
					value=(value)?true:false;
					if (value==this.readOnly) return true;
					this.readOnly=value;
					if (value) {
						if (!dojo.hasClass(this.domNodeItems, 'dijitTextBoxReadOnly')) dojo.addClass(this.domNodeItems, 'dijitTextBoxReadOnly');
					}
					else {
						if (dojo.hasClass(this.domNodeItems, 'dijitTextBoxReadOnly')) dojo.removeClass(this.domNodeItems, 'dijitTextBoxReadOnly');
					}
				},
				render: function() {
					if (!this.domNodeItems) return;
					this.domNodeItems.innerHTML='';
					for(var i=0; i<this.ordered.length; i++) {
						var name=this.ordered[i];
						var domDiv=document.createElement('div');
						var domText=document.createTextNode(this.items[name]);
						domDiv.appendChild(domText);
						this.domNodeItems.appendChild(domDiv);
					}
					var readOnly=this.readOnly;
					this.readOnly='';
					this.setReadOnly(readOnly);
				},
				onButtonClick: function() {
					if (this.getReadOnly()) return false;
					if (this.objRowSet && this.rowId!==null) {
						if (this.objRowSet.getFocusedId()!=this.rowId) {
							if (!this.objRowSet.setFocusedId(this.rowId)) return false;
						}
					}
					// предотвращаем дребезг
					if (this._isWaitClick) return false;
					this._isWaitClick=true;
					this.domNodeFocused.focus();
					
					var objActionGo=this.getActionGo();
					if (objActionGo) {
						if (objActionGo.getEnabled()) objActionGo.exec();
					}
					else {
						var objDialog=new g740.DialogEditorRefList(
							{ 
								objForm: this.objForm,
								rowsetName: this.rowsetName,
								fieldName: this.fieldName,
								nodeType: this.nodeType,
								domNodeOwner: this.domNode,
								objOwner: this,
								duration: 0, 
								draggable: false
							}
						);
						objDialog.show();
					}
					g740.execDelay.go({
						delay: 250,
						obj: this,
						func: this._setWaitClickToFalse
					});
				},
				onClearClick: function() {
					if (!this.objRowSet) return false;
					var rowId=this.rowId;
					if (rowId===null) rowId=this.objRowSet.getFocusedId();
					// Если в дереве не то nodeType, то отписывать не надо
					if (this.objRowSet.isTree && this.nodeType) {
						var nodeType='';
						var node=this.objRowSet.objTreeStorage.getNode(rowId,this.objRowSet.getFocusedParentNode());
						if (node) nodeType=node.nodeType;
						if (this.nodeType!=nodeType) return false;
					}
					
					this.objRowSet.setFieldProperty({fieldName: this.fieldName, propertyName: 'value', value: '', id: rowId});
					if (this.isSaveOnChange && this.objRowSet.getExistUnsavedChanges()) {
						this.objRowSet.exec({requestName: 'save'});
					}
				},
				onG740Change: function(newValue) {
					return false;
				},
				onBlur: function() {
					if (dojo.hasClass(this.domNode,'g740-widget-focused')) dojo.removeClass(this.domNode,'g740-widget-focused');
				},
				onFocus: function() {
					if (!dojo.hasClass(this.domNode,'g740-widget-focused')) dojo.addClass(this.domNode,'g740-widget-focused');
				},
				onKeyPress : function(e) {
					if (e.keyCode==13 && e.ctrlKey) {
						// Ctrl+Enter
						dojo.stopEvent(e);
						this.onButtonClick();
					}
					else if (!e.ctrlKey && (e.keyCode==13 || (e.keyCode==9 && !e.shiftKey))) {
						// Enter, Tab
						dojo.stopEvent(e);
						if (this.objPanel) this.objPanel.doG740FocusChildNext(this);
					}
					else if (!e.ctrlKey && (e.keyCode==9 && e.shiftKey)) {
						// Shift+Tab
						dojo.stopEvent(e);
						if (this.objPanel) this.objPanel.doG740FocusChildPrev(this);
					}
					else {
						dojo.stopEvent(e);
					}
				}
			}
		);
		// Виджет для поля RefTree
		dojo.declare(
			'g740.FieldEditor.RefTree',
			[g740.FieldEditor.RefList],
			{
				onButtonClick: function() {
					if (this.getReadOnly()) return false;
					if (this.objRowSet && this.rowId!==null) {
						if (this.objRowSet.getFocusedId()!=this.rowId) {
							if (!this.objRowSet.setFocusedId(this.rowId)) return false;
						}
					}
					// предотвращаем дребезг
					if (this._isWaitClick) return false;
					this._isWaitClick=true;
					this.domNodeFocused.focus();
					
					var objActionGo=this.getActionGo();
					if (objActionGo) {
						if (objActionGo.getEnabled()) objActionGo.exec();
					}
					else {
						var objDialog=new g740.DialogEditorRefTree(
							{ 
								objForm: this.objForm,
								rowsetName: this.rowsetName,
								fieldName: this.fieldName,
								nodeType: this.nodeType,
								domNodeOwner: this.domNode,
								objOwner: this,
								duration: 0, 
								draggable: false
							}
						);
						objDialog.show();
					}
					g740.execDelay.go({
						delay: 250,
						obj: this,
						func: this._setWaitClickToFalse
					});
				}
			}
		);
		

	    // Виджет кнопки
		dojo.declare(
			'g740.FieldEditor.Button',
			[dijit.form.Button, g740.FieldEditor],
			{
			    constructor: function (para, domElement) {
			        var procedureName = 'g740.FieldEditor.Button.constructor';
			        try {
			            this.inherited(arguments);
			        }
			        finally {
			        }
			    },
			    postCreate: function () {
			        if (this.fieldDef) {
			            if (this.fieldDef.request) this.set('buttonVisible', true);
			            if (this.fieldDef.caption) this.set('label', this.fieldDef.caption);
			            else if (this.fieldDef.request) this.set('label', this.fieldDef.request.caption);
			        }
			        this.on('Click', this.onG740ButtonClick);
			        this.inherited(arguments);
			    },
			    onG740ButtonClick: function () {
			        //if (this.getReadOnly()) return false;
			        if (this.objRowSet && this.rowId !== null) {
			            if (this.objRowSet.getFocusedId() != this.rowId) {
			                if (!this.objRowSet.setFocusedId(this.rowId)) return false;
			            }
			        }
			        //this.domNodeInput.focus();
			        var objActionGo = this.getActionGo();
			        if (objActionGo) {
						// предотвращаем дребезг
						if (this._isWaitClick) return false;
						this._isWaitClick=true;
						if (objActionGo && objActionGo.getEnabled()) objActionGo.exec();
						g740.execDelay.go({
							delay: 250,
							obj: this,
							func: this._setWaitClickToFalse
						});
			        }
			    }
			}
		);

		return g740;
	}
);