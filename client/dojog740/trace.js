//-----------------------------------------------------------------------------
// Трассировка
//	включение: g740.config.isTraceEnabled
//-----------------------------------------------------------------------------
define(
	[],
	function() {
		if (typeof(g740)=='undefined') g740={};

// Ошибка
		g740.error=function(messageId, message) {
			var msg='';
			if (messageId) {
				msg+='. '+g740.getMessage(messageId);
			}
			if (message) {
				msg+='. '+message;
			}
			g740.trace.goError(msg);
			throw (new Error(msg));
		};
// Системные ошибки
		g740.systemError=function(procedureName, messageId, message) {
			var msg=g740.getMessage('errorSystemInProcedure')+' '+ procedureName;
			if (messageId) {
				msg+='. '+g740.getMessage(messageId);
			}
			if (message) {
				msg+='. '+message;
			}
			g740.trace.goError(msg);
			throw (new Error(msg));
		};
// Ошибки в серверных ответах
		g740.responseError=function(messageId, message) {
			var msg=g740.getMessage('errorInResponse');
			if (messageId) {
				msg+='. '+g740.getMessage(messageId);
			}
			if (message) {
				msg+='. '+message;
			}
			g740.trace.goError(msg);
			throw (new Error(msg));
		};
// Информационные сообщения
		g740.showMessage=function(message) {
			alert(message);
		};
		g740.showError=function(message) {
			var objDialog=new g740.DialogConfirm(
				{ 
					duration: 0, 
					draggable: false,
					mode: 'error',
					messageText: message
				}
			);
			objDialog.show();
			return objDialog;
		};

// Диалог подтверждения, c ассинхронным выполнением операции по закрытии
// 	para.messageId - код вопроса
//	para.messageText - текст вопроса
// 	para.onCloseOk - процедура, выполняемая по Ok
// 	para.onClolseCancel - процедура, выполняемая по Ok
//	para.closePara
// 	para.closeObj - контекст выпонения
//	para.objOwner - куда возвращать фокус ввода по закрытии
		g740.showConfirm=function(para) {
			var objDialog=new g740.DialogConfirm(
				{ 
					duration: 0, 
					draggable: false,
					mode: 'confirm',
					messageId: para.messageId,
					messageText: para.messageText,
					onCloseOk: para.onCloseOk,
					onCloseCancel: para.onCloseCancel,
					closePara: para.closePara,
					closeObj: para.closeObj,
					objOwner: para.objOwner
				}
			);
			objDialog.show();
		};
		
		g740.trace={
			_stack: [],
			_root: {
			},
// Проверка, включен ли режим трассировки			
			_isTraceEnabled: function() {
				if (typeof(g740.config.isTraceEnabled)!='boolean') return false;
				return g740.config.isTraceEnabled;
			},
// Возвращает родительский узел дерева трассировки
			_getParent: function() {
				if (this._stack.length==0) {
					this._stack.push(this._root);
				}
				return this._stack[this._stack.length-1];
			},
// Создает узел дерева трассировки, регистрирует в родительском узле и возвращает его в качестве результата
			_go: function(name, message, obj) {
				var item={};
				if (obj!=null) {
					item._info={
						childCount: 0,
						obj: obj
					}
				}
				var parent=this._getParent();
				if (!parent._info) {
					parent._info={
						childCount: 0
					};
				}
				var s=(parent._info.childCount++).toString();
				while (s.length<6) s=' '+s;
				parent['▪'+s+'. '+name+' '+message]=item;
				
				return item;
			},
// Трассировка точки входа в процедуру.	name - имя процедуры, obj - дополнительная информация, если есть
			goStart: function(name, obj) {
				if (!this._isTraceEnabled()) return;
				var message=g740.getMessage('traceStart');
				var item=this._go(name, message, obj);
				this._stack.push(item);
			},
// Трассировка точки выхода из процедуры.	message - текст, если не задан, то end, obj - дополнительная информация, если есть
			goEnd: function(message, obj) {
				if (!this._isTraceEnabled()) return;
				if (!message) message=g740.getMessage('traceEnd');
				var item=this._go('', message, obj);
				this._stack.pop();
			},
// Трассировка промежуточной точки
			go: function(message, obj) {
				if (!this._isTraceEnabled()) return;
				var item=this._go('', message, obj);
			},
// Трассировка ошибки
			goError: function(message) {
				if (!this._isTraceEnabled()) return;
				var item=this._go('', g740.getMessage('error'), message);
			},
			_builderErrors: [],
			goBuilderStart: function() {
				this._builderErrors=[];
			},
			goBuilderEnd: function() {
				if (this._builderErrors.length>0) {
					//if (this._isTraceEnabled()) 
					console.log({errors:this._builderErrors});
					g740.error('errorBuilderForm');
				}
				this._builderErrors=[];
			},
			goBuilder: function(para) {
				if (para.messageId) {
					para.message=g740.getMessage(para.messageId);
					delete para.messageId;
				}
				this._builderErrors.push(para);
			}
		};
		

		return g740;
	}
);
