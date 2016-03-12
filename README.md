# loading
移动端的向下向上滚动加载更多
只支持移动端查看效果

参数
options = {
		hasPullDown: false,     			//是否下拉功能
		hasPullUp: false,			  		   //是否上拉功能
		targetClass: "wrapper",     	  //执行目标
		pullDownClass: "pullDown", 			//下拉目标
		pullUpClass: "pullUp", 					//上拉目标
		contentClass: "content", 				//内容目标
		resistance: 2, 									//拖动阻力系数
		transitionTimingFunction: "linear", //默认还原动画曲线
		refreshToEndTime: 300, 					//默认还原动画时间
		stopPropagation: true,					//默认阻止事件的传播
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

方法 
translate (控制目标css3 translateY)
refreshToStart(还原到初始状态)
resizeheight(重新获取目标高度)