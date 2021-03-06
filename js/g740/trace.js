/**
 * G740Viewer
 * Copyright 2017-2019 Galinsky Leonid lenq740@yandex.ru
 * Licensed under the BSD license
 */

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
			throw (new Error(msg));
		};
// Информационные сообщения
		g740.showMessage=function(message, objOwner) {
			var objForm=null;
			var objFocusedPanel=null
			if (objOwner) {
				if (objOwner.g740className=='g740.RowSet' && !objOwner.isObjectDestroed) objForm=objOwner.objForm;
				if (objOwner.g740className=='g740.Form' && !objOwner.isObjectDestroed) objForm=objOwner;
			}
			if (objForm && !objForm.isObjectDestroed && objForm.objFocusedPanel) objFocusedPanel=objForm.objFocusedPanel;
			var objDialog=new g740.DialogConfirm(
				{ 
					duration: 0, 
					draggable: false,
					mode: 'message',
					messageText: message,
					objOwner: objFocusedPanel
				}
			);
			objDialog.show();
			return objDialog;
		};
		g740.showError=function(message, objOwner, requestName) {
			var objForm=null;
			var objFocusedPanel=null
			var isSaveMode=false;
			if (objOwner) {
				if (objOwner.g740className=='g740.RowSet' && !objOwner.isObjectDestroed) {
					objForm=objOwner.objForm;
					if (requestName=='save') isSaveMode=true;
				}
				if (objOwner.g740className=='g740.Form' && !objOwner.isObjectDestroed) objForm=objOwner;
			}
			if (objForm && !objForm.isObjectDestroed && objForm.objFocusedPanel) objFocusedPanel=objForm.objFocusedPanel;
			var p={
					duration: 0, 
					draggable: false,
					mode: 'error',
					messageText: message,
					objOwner: objFocusedPanel
			};
			if (isSaveMode) {
				p.closePara=objOwner;
				p.btnOkMessageId='messageBtnErrorOnSaveOk';
				p.btnGoIcon='undo';
				p.btnGoMessageId='messageBtnErrorOnSaveUndo';
				p.height='280px';
				p.onClolseGo=function(objRowSet) {
					if (objRowSet && objRowSet.g740className=='g740.RowSet' && !objRowSet.isObjectDestroed) {
						objRowSet.undoUnsavedChanges();
					}
				}
			}
			var objDialog=new g740.DialogConfirm(p);
			objDialog.show();
			return objDialog;
		};

// Диалог подтверждения, c ассинхронным выполнением операции по закрытии
// 	para.messageId - код вопроса
//	para.messageText - текст вопроса
// 	para.onCloseOk - процедура, выполняемая по Ok
// 	para.onCloseCancel - процедура, выполняемая по Cancel
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
			_builderErrors: [],
			goBuilderStart: function() {
				this._builderErrors=[];
			},
			goBuilderEnd: function() {
				if (this._builderErrors.length>0) {
					var xmlErrorDoc=dojox.xml.parser.parse('<?xml version="1.0" encoding="UTF-8"?><error></error>', 'text/xml');
					for(var i=0; i<this._builderErrors.length; i++) {
						var obj=this._builderErrors[i];
						var xmlItem=xmlErrorDoc.createElement('item');
						for(var name in obj) {
							try {
								xmlItem.setAttribute(name, obj[name]);
							}
							catch(e) {
							}
						}
						xmlErrorDoc.documentElement.appendChild(xmlItem);
					}
					try {
						console.log('');
						console.log(xmlErrorDoc.documentElement);
						console.log('');
					}
					catch(e) {
					}
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
			},
			goTraceMessage: function(message) {
				if (!g740.config.isTraceEnabled) return;
				var xmlErrorDoc=dojox.xml.parser.parse('<?xml version="1.0" encoding="UTF-8"?><message></message>', 'text/xml');
				var xmlItem=xmlErrorDoc.createElement('item');
				if (typeof(message)=='object') {
					for(var name in message) {
						try {
							xmlItem.setAttribute(name, message[name]);
						}
						catch(e) {
						}
					}
				}
				else {
					try {
						xmlItem.setAttribute('message', message.toString());
					}
					catch(e) {
					}
				}
				xmlErrorDoc.documentElement.appendChild(xmlItem);
				try {
					console.log('');
					console.log(xmlErrorDoc.documentElement);
					console.log('');
				}
				catch(e) {
				}
			},
			goTraceError: function(message) {
				var xmlErrorDoc=dojox.xml.parser.parse('<?xml version="1.0" encoding="UTF-8"?><error></error>', 'text/xml');
				var xmlItem=xmlErrorDoc.createElement('item');
				if (typeof(message)=='object') {
					for(var name in message) {
						try {
							xmlItem.setAttribute(name, message[name]);
						}
						catch(e) {
						}
					}
				}
				else {
					try {
						xmlItem.setAttribute('message', message.toString());
					}
					catch(e) {
					}
				}
				xmlErrorDoc.documentElement.appendChild(xmlItem);
				try {
					console.log('');
					console.log(xmlErrorDoc.documentElement);
					console.log('');
				}
				catch(e) {
				}
			}
		};
		return g740;
	}
);
