
require(["text!../music/music-list.json","jquery.min"],function(listData){
	//console.log(listData);//字符串
	var obj = JSON.parse(listData);
	//播放的音乐列表
	var musicList = obj.list;
	
	musicList.forEach(function(song){
		$("<li></li>")
		.text(song)
		.click(function (e) {
			var index = $("#list-box li").index(e.target);
			$("#list-box li")[musicIndex<0?0:musicIndex].innerHTML = musicList[musicIndex];
			musicIndex = index;
			loadMusic();
		})
		.appendTo($("#list-box"));
	});
	
	
	//当前播放到哪首歌
	var musicIndex = -1;
	nextMusic();
	//当音乐数据加载完毕时自动播放
	$('#player')[0].oncanplay = function(){
		$("#player")[0].play();
		
		//点哪句歌词播放哪句
		$('#lyric-box p').click(function(e){
			//目标行的index
			var time = lyricArray[targetLine].time;
			$('#player')[0].currentTime = time;
		});
	}
	
	//播放下一首
	function nextMusic(){
		musicIndex++;
		if(musicIndex>musicList.length-1){
			musicIndex = 0;
		}		
		loadMusic();
	}
	//播放上一首
	function preMusic(){
		musicIndex--;
		if(musicIndex<0){
			musicIndex = musicList.length-1;
		}		
		loadMusic();
	}
	
	//存放歌词数据的数组
	var lyricArray;
	
	//开始加载歌词和歌曲
	function loadMusic(){		
		var musicName = musicList[musicIndex];//歌名		
		
		$('#cd').css('background-image','url(music/'+musicName+'.jpg)');
		
		var lfn = "music/"+musicName+".lrc";
		
		//下载歌词
		require(['text!../'+lfn],function(lyric){
						
			var reg = /\[(\d\d:\d\d\.\d\d)\](.*)/g;
			var arr;
			lyricArray=[];
			//把歌词整理成一个数组
			while(arr = reg.exec(lyric)){								
				var line = {
					time:minuteToSecond(arr[1]),
					content:arr[2]
				};
				lyricArray.push(line);
			}			
			
			//把歌词显示在lyric-box中
			var boxLyric = lyricArray.reduce(function(pre,obj){				
				return pre+"<p>"+obj.content+"</p>";			
			},"");
			$("#lyric-box").html(boxLyric);
						
			
			//歌词下载完毕后下载歌曲			
			$('#player')[0].src = "music/"+musicName+".mp3";
			currentLine = 0;
		});
	}
		
	
	//播放按钮
	var isPlaying = false;	
	$('#playBtn').click(function(){		
		if(isPlaying){			
			$('#player')[0].pause();						
		}else{
			//audio元素对象的play函数：开始播放。
			$('#player')[0].play();					
		}		
	});
	
	//下一首按钮
	$('#nextBtn').click(function(){
		$('#player')[0].pause();
		nextMusic();
	});
	//上一首按钮
	$('#preBtn').click(function(){
		$('#player')[0].pause();
		preMusic();
	});
	
	//初始化进度条
	function changeProgress(e){
		var prog = e.offsetX/e.target.offsetWidth;//百分比
		//把点击进度条计算之后的进度显示在进度条上
		$('#progress-bar').val(prog);
		//根据点击的进度设置播放器的当前播放进度
		$('#player')[0].currentTime = $('#player')[0].duration*prog;
	}
	
	$('#progress-bar').mousedown(function(e){
		changeProgress(e);	
		
		$('#progress-bar')[0].onmousemove= function(e){
			changeProgress(e);
		}
	});
	
	$('#progress-bar').mouseup(function(e){
		$('#progress-bar')[0].onmousemove = null;
	});
	$('#progress-bar').mouseleave(function(e){
		$('#progress-bar')[0].onmousemove = null;
	});
	
	//转换秒数为分钟的方法
	function secondToMinute(s){
		var minute = Math.floor(s/60);
		var second = Math.floor(s%60);
		minute = minute<10?"0"+minute:minute;
		second = second<10?"0"+second:second;
		return minute+":"+second;
	}
	//转换分钟为秒数的方法
	function minuteToSecond(m){
		//字符串转成数字
		var arr = m.split(":");
		return arr[0]*60 + arr[1]*1;
	}
	
	//定义一个变量，记录当前播放到哪一行
	var currentLine;
	
	//播放进度改变的回调函数
	$('#player')[0].ontimeupdate = function(e){
		//计算时间进度，并显示在label上
		var crt = secondToMinute(e.target.currentTime);
		var dut = secondToMinute(e.target.duration);
//		if(!e.target.duration){
//			dut = "00:00";
//		}
		$("#progress-label").text(crt+"/"+dut);
		
		//计算百分比进度显示在进度条上
		//切换的瞬间e.target.currentTime/e.target.duration为空
		if(e.target.currentTime/e.target.duration){
			$("#progress-bar").val(e.target.currentTime/e.target.duration);
		}

		//找出当前时间点对应的歌词
		var line = findLineOfTime(e.target.currentTime);//对应歌词所在的行数
		
		if(line!=currentLine||line==0){
			$("#lyric-box p")[currentLine].classList.remove('higtlight-line');
			$("#lyric-box p")[line].classList.add('higtlight-line');
			currentLine = line;
			
			
			var p = $("#lyric-box p")[currentLine];
			console.log(p.offsetTop);
			
			$('#lyric-box')[0].scrollTop = p.offsetTop-180;
			
			$('#lyric-box').animate({
				scollTop:p.offsetTop-180
			},300,"linear");
		}
		
	}
	
	//找到某个时间点对应歌词的行数
	function findLineOfTime(t){
		var i = 0;
		while(i<lyricArray.length){
			if(lyricArray[i].time>t){
				return i-1<0?0:i-1;//返回上一行歌词
			}
			i++;
		}
		
		return lyricArray.length-1;
	}
	
	
	//开始播放时的回调函数
	$("#player")[0].onplaying = function(){
		$("#list-box li")[musicIndex].innerHTML = "<i class='icon-spinner icon-spin'></i>"+musicList[musicIndex];
		$("#playBtn").removeClass('icon-play').addClass("icon-pause");
		isPlaying = true;
		
		$('#cd').css("animation-play-state","running");		
	}
	//暂停播放时的回调函数
	$("#player")[0].onpause = function(){
		$("#list-box li")[musicIndex].innerHTML = musicList[musicIndex];
		$("#playBtn").removeClass('icon-pause').addClass("icon-play");
		isPlaying = false;
		
		$('#cd').css("animation-play-state","paused");
	}
	//播放结束的回调函数
	$("#player")[0].onended = function(){
		$("#list-box li")[musicIndex].innerHTML = musicList[musicIndex];
		$("#playBtn").removeClass('icon-pause').addClass("icon-play");
		isPlaying = false;
		nextMusic();
	}
	
	
	
});
