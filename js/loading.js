//Loading
//wyc
//time:2016.1.25

(function(win) {
	'use strict'
	var options = {
		hasPullDown: false, //是否下拉功能
		hasPullUp: false, //是否上拉功能
		targetClass: "wrapper", //执行目标
		pullDownClass: "pullDown", //下拉目标
		pullUpClass: "pullUp", //上拉目标
		contentClass: "content", //内容目标
		resistance: 2, //拖动阻力系数
		transitionTimingFunction: "linear", //默认还原动画曲线
		refreshToEndTime: 300, //默认还原动画时间
		stopPropagation: true,
		onPullDownStart: null,
		onPullDownReach: null,
		onPullDownUnReach: null,
		onPullDownRefresh: null,
		onPullDownEnd: null,
		onPullUpStart: null,
		onPullUpReach: null,
		onPullUpUnReach: null,
		onPullUpRefresh: null,
		onPullUpEnd: null
	}

	//支持
	var transitionPrefix = (function(temp) {
		var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
			i = 0,
			l = vendors.length;
		for (; i < l; i++) {
			if ((vendors[i] + 'ransform') in temp.style) {
				return vendors[i]
			};
		}
		return null;
	})(document.createElement('div'));
	//y轴动画
	var translate = (function(transition) {
		if (!transition) {
			throw new Error("transition is not support");
		}
		return function(ele, dist, speed) {
			var style = ele && ele.style;
			if (!style) return;
			style[transition + 'ransitionDuration'] = speed + 'ms';
			style[transition + 'ransform'] = 'translate(0,' + dist + 'px)' + ' translateZ(0)';
		}

	})(transitionPrefix);


	//复制obj对象属性到target,直接引用类型的复制会导致对象相等
	var extend = function(target, obj) {
		for (var i in obj) {
			target[i] = obj[i];
		}
	};

	var noop = function() {};
	var offloadFn = function(fn) {
		setTimeout(fn || noop, 0)
	};

	function Load(option) {
		var translateY,
			transforming = false, //处于滑动状态
			targetEleParentEle,
			targetEle,
			pullDownEle,
			pullUpEle,
			pullDownHeight = 0,
			pullUpHeight = 0;

		extend(options, option);

		targetEle = document.querySelector("." + options.targetClass);
		targetEleParentEle = targetEle.parentNode;
		if (!targetEle) {
			throw new Error("Target DOM is not exist");
		}

		//css3动画函数
		var tran = function(dist, speed) {
			speed=speed==undefined?options.refreshToEndTime:speed
			translate(targetEle, dist, speed);
			translateY = dist;
			if (speed == 0) {
				transforming = false;
			} else {
				transforming = true;
				setTimeout(function() {
					transforming = false;
				}, speed)
			}
		}

		var callback=function(fun){
			var flag=true;
			if(fun){
				flag = fun(translateY)===false?false:true;
			}
			return flag;
		}

		pullDownEle = targetEle.querySelector("." + options.pullDownClass);
		if (options.hasPullDown) {
			pullDownEle&&(pullDownEle.style.display = "block");
			pullDownHeight = !!pullDownEle ? pullDownEle.offsetHeight : 0;
		} else {
			pullDownEle&&(pullDownEle.style.display = "none");
		}
		pullUpEle = targetEle.querySelector("." + options.pullUpClass);
		if (options.hasPullUp) {
			pullUpEle&&(pullUpEle.style.display = "block");
			pullUpHeight = !!pullUpEle ? pullUpEle.offsetHeight : 0;
		} else {
			pullUpEle&&(pullUpEle.style.display = "none");
		}
		var resizeheight = function() {
			var contentEle = targetEle.querySelector("." + options.contentClass);
			if (contentEle) {
				var style = getComputedStyle(targetEleParentEle);
				var styleGetNum = function(str) {
					str = style[str] || "0";
					return +str.replace("px", "");
				}
				var h = window.innerHeight - (targetEleParentEle.getBoundingClientRect().top + window.pageYOffset + styleGetNum("padding-top") + styleGetNum("padding-bottom") + styleGetNum("margin-bottom"));
				contentEle.style.height = targetEleParentEle.offsetHeight < h ? h + "px" : "auto";
			}
			targetEleParentEle.style.height = "auto";
			//初始化设置targetEleParentEle高度
			targetEleParentEle.style.height = targetEleParentEle.offsetHeight - pullUpHeight - pullDownHeight + "px";
		}
		resizeheight();
		//初始化设置transitionTimingFunction
		targetEle.style[transitionPrefix + "ransitionTimingFunction"] = options.transitionTimingFunction;
		//初始化设置translateY
		tran(-pullDownHeight, 0);

		if (!options.hasPullDown && !options.hasPullUp) {
			return;
		}

		var ispullLoad = undefined, //是否触摸滑动
			start = {},
			delta = {},
			down={
				reachRefresh:false,
				isDown:false
			},
			up={
				reachRefresh:false,
				isUp:false
			};

		var events = { //event事件对象
			handleEvent: function(event) {
				switch (event.type) {
					case 'touchstart':
						this.start(event);
						break;
					case 'touchmove':
						this.move(event);
						break;
					case 'touchend':
					case 'touchcancel':
						this.end(event);
						break;
					case 'webkitTransitionEnd':
					case 'msTransitionEnd':
					case 'oTransitionEnd':
					case 'otransitionend':
					case 'transitionend':
						offloadFn(this.transitionEnd(event));
						break;
					case 'resize':
						offloadFn(setup);
						break;
				}
				if (options.stopPropagation) event.stopPropagation();
			},
			start: function(event) {
				var touches = event.touches[0];
				start = {
					x: touches.pageX,
					y: touches.pageY,
				};
				ispullLoad = undefined;
				down.reachRefresh = false;
				up.reachRefresh=false;
				delta = {};
				if (!transforming) {
					if (options.hasPullDown && window.pageYOffset === 0&&callback(options.onPullDownStart)) {
						targetEle.addEventListener('touchmove', this, false);
						targetEle.addEventListener('touchend', this, false);
						targetEle.addEventListener('touchcancel', this, false);
						down.isDown = true;
					} else {
						down.isDown = false;
					}
					if (options.hasPullUp && targetEleParentEle.offsetHeight + targetEleParentEle.getBoundingClientRect().top === window.innerHeight&&callback(options.onPullUpStart)) {
						targetEle.addEventListener('touchmove', this, false);
						targetEle.addEventListener('touchend', this, false);
						targetEle.addEventListener('touchcancel', this, false);
						up.isUp = true;
					} else {
						up.isUp = false;
					}
				}
			},
			move: function(event) {
				var touches = event.touches[0];
				delta = {
					x: touches.pageX - start.x,
					y: touches.pageY - start.y
				}
				start = {
					x: touches.pageX,
					y: touches.pageY,
				};
				if (!ispullLoad) {
					ispullLoad = (Math.abs(delta.y) > Math.abs(delta.x)) && (down.isDown && delta.y > 0 || up.isUp && delta.y < 0);
				};
				if (ispullLoad) {
					event.cancelable && event.preventDefault();
					var nowtranslateY = translateY;
					nowtranslateY += delta.y / options.resistance;
					tran(nowtranslateY, 0);
					if (down.isDown && pullDownHeight !== 0) {
						var bo = nowtranslateY > 0,
							bo2 = down.reachRefresh === false;
						if (bo && bo2) {
							callback(options.onPullDownReach);
							down.reachRefresh = true;
						}
						if (!bo && !bo2) {
							callback(options.onPullDownUnReach);
							down.reachRefresh = false;
						}
					}
					if (up.isUp && pullUpHeight !== 0) {
						var bo1 = nowtranslateY < -pullDownHeight - pullUpHeight,
							bo2 = down.reachRefresh === false;
						if (bo1 && bo2) {
							callback(options.onPullUpReach);
							up.reachRefresh = true;
						}
						if (!bo1 && !bo2) {
							callback(options.onPullUpUnReach);
							up.reachRefresh = false;
						}
					}
				}
			},
			end: function(event) {
				if(down.isDown&&up.isUp){
					translateY>=-pullDownHeight?(up.isUp=false):(down.isDown=false);//页面同时触发的根据偏移相对初始位置判断上拉下拉结果
				}
				if (down.isDown) {
					if (down.reachRefresh === true) {
						callback(options.onPullDownRefresh)&&tran(0, options.refreshToEndTime);
					} else {
						callback(options.onPullDownEnd)&&tran(-pullDownHeight, options.refreshToEndTime);
					}
				}
				if (up.isUp) {
					if (up.reachRefresh === true) {
						callback(options.onPullUpRefresh)&&tran(-pullDownHeight - pullUpHeight, options.refreshToEndTime);
					} else {
						callback(options.onPullUpEnd)&&tran(-pullDownHeight, options.refreshToEndTime);
					}
				}
				targetEle.removeEventListener('touchmove', events, false);
				targetEle.removeEventListener('touchend', events, false);
				targetEle.removeEventListener('touchcancel', events, false);
			},
			transitionEnd: function(event) {
				options.transitionEnd && options.transitionEnd.call(event, +index, pages[index]);
			}
		};
		targetEle.addEventListener('touchstart', events, false);
		if (!transitionPrefix) {
			targetEle.addEventListener('webkitTransitionEnd', events, false);
			targetEle.addEventListener('msTransitionEnd', events, false);
			targetEle.addEventListener('oTransitionEnd', events, false);
			targetEle.addEventListener('otransitionend', events, false);
			targetEle.addEventListener('transitionend', events, false);
		}
		return {
			translate: tran,
			refreshToStart: function() {
				tran(-pullDownHeight, options.refreshToEndTime);
			},
			resizeheight: function(h) {
				if (h) {
					targetEleParentEle.style.height = h + "px";
				} else {
					resizeheight();
				}
			}
		}

	}

	win.Load = Load;
})(window)