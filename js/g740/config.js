/**
 * G740Viewer
 * Copyright 2017-2019 Galinsky Leonid lenq740@yandex.ru
 * Licensed under the BSD license
 */

define(
	[],
	function() {
		if (typeof(g740)=='undefined') g740={};

// Общие настройки проекта
		g740.config={
			urlServer: 'server/',				// Точка входа для управляющих серверных скриптов
			urlPhpInfo: 'server/phpinfo.php',	// Путь до утилиты phpinfo
			mainFormName: 'formMain',			// Имя главной формы приложения
			mainFormDomNode: 'FormPanelMain',	// Узел DOM, в ктором размещается главная форма приложения
			timeoutRefreshChilds: 300,			// Время ожидания перед перечиткой дочерних наборов строк
			timeoutMaxRequest: 10000,			// Максимальное время ожидания ответа
			isTraceEnabled: false,				// Режим трассировки запросов
			charwidth: 9,						// усредненная ширина символа в пикселях
			charlabelwidth: 7,					// усредненная ширина символа в пикселях для метки
			charheight: 14,						// высота символа в пикселях
			iconSizeDefault: 'small',			// размер иконок по умолчанию - small, medium, large
			appColorScheme: 'black',			// цветовая схема приложения - black, red, cti
			session: '',						// параметр session запроса
			csrfToken: '',						// параметр csrftoken запроса

			mainFormLoginUrl: '',				// Путь до HTML страницы аутетификации, если не задана, то стандартная аутетификации
			dialogLogin: {
				loginUrl: '',
				iconUrl: '',
				loginOpacity: '0.7',							// прозрачность слоя, перекрывающего фон в диалоге логина
				isReloadBeforeLogin: false,						// Перед отображением диалога логина вызывать перечитку
				isEnabled: true,								// Показывать стандартный диалог авторизации
				width: '350px',									// ширина диалога
				height: '180px',								// высота диалога
				iconWidth: '128px',								// ширина иконки
				title: ''
			}
		};
// Поддержка иконок для дерева, кнопочек и меню, нужна таблица стилей icons.css
		g740.icons={
			_items: {
			},
			getIconClassName : function(icon, size) {
				if (size!='large' && size!='medium' && size!='small') size=g740.config.iconSizeDefault;
				
				var result='';
				if (this._items[icon]) result=this._items[icon];
				
				if (result && typeof(result)=='object' && result[size]) {
					result=result[size];
				}
				if (typeof(result)!='string') result='';
				if (result) result+=' g740-iconsize-'+size;
				return result;
			},
			registerIconSvg: function(icon, svg, width, height) {
				var domIconStyle=document.getElementById('g740iconstyle');
				if (!domIconStyle) {
					domIconStyle=document.createElement('style');
					domIconStyle.setAttribute('type','text/css');
					domIconStyle.setAttribute('id','g740iconstyle');
					document.getElementsByTagName('head')[0].appendChild(domIconStyle);
				}
				var objSheet=(domIconStyle.styleSheet || domIconStyle.sheet)
				if (objSheet && (objSheet.addRule || objSheet.insertRule)) {
					var iconClassName='g740-icons-'+icon.replaceAll('.','-');
					
					var svgDark=svg;
					var items=g740.appColorScheme.getItem().darkIconReplace;
					if (items) for(var colorFrom in items) {
						var colorTo=items[colorFrom];
						svgDark=svgDark.replaceAll(colorFrom,colorTo);
					}
					var css="background-image: url('data:image/svg+xml;utf8,"+encodeURIComponent(svgDark)+"')";
					if (width) css+=';width:'+width+'px';
					if (height) css+=';height:'+height+'px';
					if (objSheet.addRule) {
						objSheet.addRule('.'+iconClassName, css);
					}
					else  {
						objSheet.insertRule('.'+iconClassName+'{'+css+'}', 0);
					}

					if (svg.indexOf('"darkonly"')<0) {
						var svgWhite=svg;
						var items=g740.appColorScheme.getItem().whiteIconReplace;
						if (items) for(var colorFrom in items) {
							var colorTo=items[colorFrom];
							svgWhite=svgWhite.replaceAll(colorFrom,colorTo);
						}
						var css="background-image: url('data:image/svg+xml;utf8,"+encodeURIComponent(svgWhite)+"')";
						if (width) css+=';width:'+width+'px';
						if (height) css+=';height:'+height+'px';
						if (objSheet.addRule) {
							objSheet.addRule('.icons-white .'+iconClassName, css);
						}
						else  {
							objSheet.insertRule('.icons-white .'+iconClassName+'{'+css+'}', 0);
						}
					}
					g740.icons._items[icon]=iconClassName;
				}
			},
			registerIconImg: function(icon, pathImg, pathImgWhite, width, height) {
				var domIconStyle=document.getElementById('g740iconstyle');
				if (!domIconStyle) {
					domIconStyle=document.createElement('style');
					domIconStyle.setAttribute('type','text/css');
					domIconStyle.setAttribute('id','g740iconstyle');
					document.getElementsByTagName('head')[0].appendChild(domIconStyle);
				}
				var objSheet=(domIconStyle.styleSheet || domIconStyle.sheet)
				if (objSheet && (objSheet.addRule || objSheet.insertRule)) {
					var iconClassName='g740-icons-'+icon.replaceAll('.','-');
					
					var css="background-image: url('"+pathImg+"')";
					if (width) css+=';width:'+width+'px';
					if (height) css+=';height:'+height+'px';
					if (objSheet.addRule) {
						objSheet.addRule('.'+iconClassName, css);
					}
					else  {
						objSheet.insertRule('.'+iconClassName+'{'+css+'}', 0);
					}

					if (pathImgWhite) {
						var css="background-image: url('"+pathImgWhite+"')";
						if (width) css+=';width:'+width+'px';
						if (height) css+=';height:'+height+'px';
						if (objSheet.addRule) {
							objSheet.addRule('.icons-white .'+iconClassName, css);
						}
						else  {
							objSheet.insertRule('.icons-white .'+iconClassName+'{'+css+'}', 0);
						}
					}
					g740.icons._items[icon]=iconClassName;
				}
			}
		};
// Поддержка цветовых схем, нужна таблица стилей color.css
		g740.colorScheme={
			// Зарегистрированные цветовые схемы
			_items: {
				white: {
					className: 'g740-color-white',
					classNameReadOnly: 'g740-color-white-readOnly'
				},
				gray: {
					className: 'g740-color-gray',
					classNameReadOnly: 'g740-color-gray-readOnly'
				},
				green: {
					className: 'g740-color-green',
					classNameReadOnly: 'g740-color-green-readOnly'
				},
				red: {
					className: 'g740-color-red',
					classNameReadOnly: 'g740-color-red-readOnly'
				},
				blue: {
					className: 'g740-color-blue',
					classNameReadOnly: 'g740-color-blue-readOnly'
				},
				yellow: {
					className: 'g740-color-yellow',
					classNameReadOnly: 'g740-color-yellow-readOnly'
				},
				cyan: {
					className: 'g740-color-cyan',
					classNameReadOnly: 'g740-color-cyan-readOnly'
				},
				scheme1: {
					className: 'g740-color-scheme1',
					classNameReadOnly: 'g740-color-scheme1-readOnly'
				},
				scheme2: {
					className: 'g740-color-scheme2',
					classNameReadOnly: 'g740-color-scheme2-readOnly'
				},
				scheme3: {
					className: 'g740-color-scheme3',
					classNameReadOnly: 'g740-color-scheme3-readOnly'
				}
			},
			// Вернуть описание цветовой схемы по названию цвета
			getColorItem: function(color) {
				var objItem=this._items[color];
				if (!objItem) objItem=this._items['white'];
				return objItem;
			}
		};
		
		g740.appColorScheme={
			_items: {
				black: {
					className: 'app-color-black',
					panelExpanderLookOpacityMax: 0.55,
					darkIconReplace: {
					},
					whiteIconReplace: {
						'#000000': '#FFFFFF',
						'red': '#FFFFFF',
						'green': '#FFFFFF',
						'blue': '#FFFFFF',
						'yellow': '#FFFFFF'
					}
				},
				red: {
					className: 'app-color-red',
					panelExpanderLookOpacityMax: 0.55,
					darkIconReplace: {
						'#000000': '#e5525b',
						'red': '#E74C3C',
						'green': '#1ABC9C',
						'blue': '#3498DB',
						'yellow': '#F1C40F'
					},
					whiteIconReplace: {
						'#000000': '#FFFFFF',
						'red': '#FFFFFF',
						'green': '#FFFFFF',
						'blue': '#FFFFFF',
						'yellow': '#FFFFFF'
					}
				},
				m: {
					className: 'app-color-m',
					panelExpanderLookOpacityMax: 0.55,
					panelTreeMenuWhiteIcons: true,
					panelGridWhiteIcons: true,
					darkIconReplace: {
						'#000000': '#2980b9',
						'red': '#E74C3C',
						'green': '#1ABC9C',
						'blue': '#3498DB',
						'yellow': '#F1C40F'
					},
					whiteIconReplace: {
						'#000000': '#FFFFFF',
						'red': '#FFFFFF',
						'green': '#FFFFFF',
						'blue': '#FFFFFF',
						'yellow': '#FFFFFF'
					}
				}
			},
			getItem: function() {
				var objItem=this._items[g740.config.appColorScheme];
				if (!objItem) objItem=this._items['black'];
				return objItem;
			}
		};
		
		return g740;
	}
);
