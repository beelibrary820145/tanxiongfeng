function isString(s)
{
  return typeof s==='string';
}
function isObject(obj)
{
  return typeof obj==='object';
}
function isNumber(num)
{
  return typeof num==='number';
}

function isArray(val)
{
  if(!val) return false;
  return Object.prototype.toString.call(val)==='[object Array]';
}
function isFunction(val)
{
  if(!val) return false;
  return Object.prototype.toString.call(val)==='[object Function]';
}
function inArray(elem,data)
{
    for(var i=0,len=data.length;i<len;i++)
    {
        if(elem==data[i])
        {
            return i;
        }
    }
    return -1;
}
function ready(obj,addr,fend)
{
  if(window.ActiveXObject){
    obj.onreadystatechange=function (){
      if(obj.readyState=='complete' || obj.readyState=='loaded'){
        if(fend) fend(obj);
        obj.onreadystatechange=null;  
      }
      if(obj.readyState==0){
        obj.onreadystatechange=null;
      }
    }
    obj.src=addr;
  }else
  {
    obj.onload=function (){
      if(fend) fend(obj);
    }
    obj.src=addr;
  }
}
function extend(a,b)
{
  var n;
  if(!a)
  {
    a={};
  }
  for(n in b)
  {
    a[n]=b[n];
  }
  return a;
}
/* js延迟加载 */
function load(d,src,fend){
  var oS=d.createElement('script'),
      oH=d.getElementsByTagName('head')[0];
  oS.type='text/javascript';
  ready(oS,src,fend);
  oH?oH.parentNode.insertBefore(oS,oH):d.body.appendChild(oS);
}
/*
d  = document
src = 图片地址
fend = 回调函数   -- 如果需要获取图片信息
需在匿名函数中定义一个形参
eg:
var rs=loadImg(document,'./images/img/bg_1.jpg',function (obj){
  alert(obj.w+' '+obj.h);
});
return: 图片对象,图片w,h
*/
function loadImg(d,src,fend){
  var oImg=d.createElement('img');
  ready(oImg,src,fend);
}
/* 模拟点击 */
function imitation(d,obj)
{
	if(d.all)
	{
		obj.click();
	}else if(obj.fireEvent)
  {
    obj.fireEvent('onclick');
  }
	else
	{
	   var evt=d.createEvent('MouseEvents');
     evt.initEvent('click',false,false);
     obj.dispatchEvent(evt);
	}
};
/*设置cssText*/
function setStyle(obj,cls)
{
  /*获取当前cssText*/
  var sCss=obj.style.cssText;
  obj.style.cssText+=((sCss && sCss.substr(-1)!=';')?';':'')+cls;
};
/* 获取指定对象样式 */
function getAttr(obj,attr)
{
  if(obj.currentStyle)
  {
    getAttr=function (obj,attr)
    {
      return attr!='opacity'?parseInt(obj.currentStyle[attr]):Math.round(parseFloat(obj.currentStyle[attr])*100);  
    };
  }
  else
  {
    getAttr=function (obj,attr)
    {
      return attr!='opacity'?parseInt(getComputedStyle(obj,false)[attr]):Math.round(parseFloat(getComputedStyle(obj,false)[attr])*100);  
    };
  }
  return getAttr(obj,attr);
};
/*Tween 算法管理*/
var Tween = {
    Linear: function(t,b,c,d){ return c*t/d + b; },
    Quad: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t + b;
        },
        easeOut: function(t,b,c,d){
            return -c *(t/=d)*(t-2) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        }
    },
    Cubic: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return c*((t=t/d-1)*t*t + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        }
    },
    Quart: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return -c * ((t=t/d-1)*t*t*t - 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
            return -c/2 * ((t-=2)*t*t*t - 2) + b;
        }
    },
    Quint: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
            return c/2*((t-=2)*t*t*t*t + 2) + b;
        }
    },
    Sine: {
        easeIn: function(t,b,c,d){
            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
        },
        easeOut: function(t,b,c,d){
            return c * Math.sin(t/d * (Math.PI/2)) + b;
        },
        easeInOut: function(t,b,c,d){
            return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
        }
    },
    Expo: {
        easeIn: function(t,b,c,d){
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },
        easeOut: function(t,b,c,d){
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
        }
    },
    Circ: {
        easeIn: function(t,b,c,d){
            return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
        },
        easeOut: function(t,b,c,d){
            return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
            return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
        }
    },
    Elastic: {
        easeIn: function(t,b,c,d,a,p){
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        },
        easeOut: function(t,b,c,d,a,p){
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
        },
        easeInOut: function(t,b,c,d,a,p){
            if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
            if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
        }
    },
    Back: {
        easeIn: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158;
            return c*(t/=d)*t*((s+1)*t - s) + b;
        },
        easeOut: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        },
        easeInOut: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158;
            if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
        }
    },
    Bounce: {
        easeIn: function(t,b,c,d){
            return c - Tween.Bounce.easeOut(d-t, 0, c, d) + b;
        },
        easeOut: function(t,b,c,d){
            if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
            }
        },
        easeInOut: function(t,b,c,d){
            if (t < d/2) return Tween.Bounce.easeIn(t*2, 0, c, d) * .5 + b;
            else return Tween.Bounce.easeOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
        }
    }
}
function animate(obj,attr,dur,fend,aType)
{
  var fn=null,oData={};
  (dur<45)&&(dur=100);
  //choose Tween
  if(aType instanceof Array && typeof Tween[aType[0]][aType[1]]!='undefined'){
  
   fn=Tween[aType[0]][aType[1]]; 
  }
  else{
    fn=Tween.Cubic.easeInOut;
  }
  var i=0,data=[];
  //1秒 50帧   每 20ms 一个周期
  for(var k in attr)
  {
    oData={};
    oData.attr=k;
    oData.cur=getAttr(obj,k);
    oData.range=attr[k]-oData.cur;
    
    data.push(oData);
  }
  action(obj,data,fn,dur,fend);
}
function action(obj,data,fn,dur,fend)
{
  var sep=10,iTimes=1;
  if(obj.timer) clearInterval(obj.timer);
  obj.timer=setInterval(function (){
    var t=sep*iTimes++,i=0,len=data.length,iCur=0;
    if(t>dur)
    {
      clearInterval(obj.timer);
      if(fend) fend();
      return ;
    }
    for(i;i<len;i++)
    {
      iCur=fn(t,data[i].cur,data[i].range,dur);
      iCur=iCur>>0;
      if(data[i].attr!='opacity')
      {
        obj.style[data[i].attr]=iCur+'px';
      }
      else
      {
        obj.style.opacity=iCur/100;
        obj.style.filter='alpha(opacity='+iCur+')';
      }
    }
  },sep);
}
/*根据类名获取对象*/
function getElementsByClassName(oElem,strTagName,strClassName)
{
    var arrElements = (strTagName == "*" && oElem.all)? oElem.all:oElem.getElementsByTagName(strTagName);
    var arrReturnElements =[];
    var oRegExp=new RegExp("(^|\\s)" + strClassName.replace(/\-/g,"\\-") + "(\\s|$)");;
    var oElement={},clsName='';
    for(var i=0; arrElements[i]; i++){
      clsName = arrElements[i].className;
      if(clsName && oRegExp.test(clsName))
      { 
        arrReturnElements.push(arrElements[i]);
      }
    }
    return arrReturnElements;
}
/*按id 和 tag 获取 */
function $(attr,oP,nodeType)
{
  
    (typeof oP=='undefined')&&(oP=document);
    var target=attr.substr(1);
    switch(attr.substr(0,1))
    {
        case '#':return oP.getElementById(target);
        case '.':
            if(typeof nodeType=='undefined') nodeType='*';
            return getElementsByClassName(oP,nodeType,target);
        default:return oP.getElementsByTagName(attr);
    }
};
/* xmlhttp object */
function xmlhttpobject()
{
  return window.ActiveXObject?new ActiveXObject("Microsoft.XMLHTTP"):new XMLHttpRequest();
}
/*事件绑定*/
function bind(obj,type,fun)
{
  if(obj.attachEvent)
  {
    obj.attachEvent('on'+type,fun);
  }else if(obj.addEventListener)
  {
    obj.addEventListener(type,fun,false);
  }else
  {
    obj['on'+type]=fun;
  }
}
/*取消绑定*/
function detach(obj,type,fun)
{
  if(!fun) fun='function (){}';
  if(window.ActiveXObject)   //IE
  {
    obj.detachEvent('on'+type,fun);            
  }
  else      //标准
  {
    obj.removeEventListener(type,fun,false);
  }
  if(obj.detachEvent)
  {
    obj.detachEvent('on'+type,fun);
  }else if(obj.removeEventListener)
  {
    obj.removeEventListener(type,fun,false)
  }else 
  {
    obj['on'+type]=null;
  } 
}
/*防止XSS注入

function _escape(val)
{
  return val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function _unescape(val) {
	return val.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}
*/
//阻止浏览器的默认行为
function preventDefaultAction(e)
{
  if(e && e.preventDefault)
  {
    e.preventDefault();
  }else 
  {
    e.returnValue=false;
  }
}
//阻止冒泡
function preventBubble(e)
{
  e=e || event;
  if(document.all)
  {
    window.event.cancelBubble=true;
  }
  if(e && e.stopPropagation)
  {
    e.stopPropagation();
  }
}
/*阻止冒泡*/
function prevent(e)
{
  preventDefaultAction(e);
  preventBubble(e);
}
/*trim*/
function trim(str)
{
  return str.replace(/(^\s*)|(\s*$)/g, ""); 
}
/**
 * 防止快速重复提交处理
 */
function ajax(param){
  if(ajax.status){return}
  var method=param.method?param.method.toUpperCase():'POST',
      dataType=param.dataType.toLowerCase() || 'json',
      xml=xmlhttpobject();
  /**
   * 当前提交状态,如果当前请求未完成,则忽略该请求
   */
  ajax.status=true; 
  xml.open(method,param.url,true);
  xml.setRequestHeader('X_REQUEST_WITH','xmlhttprequest');
  xml.onreadystatechange=function (){
    if(xml.readyState==4 && xml.status==200)
    {
      ajax.status=false;
      var data=xml.responseText;
      if(param.success)
      {
        try
        {
          if(dataType=='json')
          {
            data=eval('('+data+')');
          }  
        }catch(e)
        {
          if(param.error)
          {
            param.error(data);
          }
          return;
        }
        param.success(data);
        ajax.status=false;
      }
    }
  }
  if(method=='POST')
  {
    var str=param.data?param.data:'';
    try
    {
      xml.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');  
    }
    catch (e){}
    xml.send(str);
  }else
  {
    xml.send(null);
  }
}
/*拖拽*/
function drag(obj,pNode,hideObj)
{
  if(!pNode) pNode=obj;
  /*获取数遍点击对象的当前位置*/
  obj.onmousedown=function (e)
  {
    var mXY=mouseXY(e),
        nX=getAttr(pNode,'left'),
        nY=getAttr(pNode,'top'), 
        startX=mXY.x,
        startY=mXY.y,
        lenX=0,
        lenY=0,
        d=window.document;
    drag.setPos=function (e)
    {
      var mXY=mouseXY(e),
          lenX=mXY.x-startX,
          lenY=mXY.y-startY;
      
      pNode.style.left=(lenX+nX)+'px';
      pNode.style.top=(lenY+nY)+'px';
    };
    /*只允许鼠标左键*/
    if((d.all && event.button!=1) || (e.pageX && e.button!=0)) return ;
    /*阻止默认事件*/
    prevent(e);
    if(hideObj) hideObj.style.display='none';
    obj.style.cursor='move';
    d.onmousemove=function (e)
    {
      drag.setPos(e);
    };
    d.onmouseup=function (e)
    {
      drag.setPos(e);
      if(hideObj) hideObj.style.display='block';
      d.onmousemove=null;
      d.onmouseup=null;
    };
  }; 
}
function inArray(elem,data)
{
  for(var i=0,len=data.length;i<len;i++)
  {
    if(data[i]==elem) return i;
  }
  return -1;
}
/*get the position of mouse*/
function mouseXY(e)
{
    var e=e||event;
    if(e.pageX)
    {
      mouseXY=function (e)
      {
        return {'x':e.pageX,'y':e.pageY};  
      };
    }else
    {
      mouseXY=function (e)
      {
        e=event;
        var d=document;
        return {'x':e.clientX+d.documentElement.scrollLeft+d.body.scrollLeft,'y':e.clientY+d.documentElement.scrollTop+d.body.scrollTop};
      };
    }
    return mouseXY(e);    
}
/*set css style*/
function css(obj,attr)
{
  if(attr.hasOwnProperty('opacity'))
  {
    if(document.all)
    {
      attr.filter='alpha(opacity='+attr.opacity+')';
    }
    attr.opacity=attr.opacity/100;
  }
  
  extend(obj.style,attr);
}
/* 获取窗口滚动位置 */
function getScroll(){
  /* 除IE8及更早版本 */
  var d=document;
  if(window.pageXOffset != null ){
      return {x : window.pageXOffset,y : window.pageYOffset}
  }
  /* 标准模式下的IE */
  if(d.compatMode == "CSS1Compat" ){
      return {x : d.documentElement.scrollLeft,y : d.documentElement.scrollTop}
  }
  /* 怪异模式下的浏览器  */
  return {x : d.body.scrollLeft,y : d.body.scrollTop}
}
/* 获取窗口可视区域大小*/
function winSize()
{
  var d=document;
  if(d.compatMode=='CSS1Compat')
  {
    return {'w':d.documentElement.clientWidth,'h':d.documentElement.clientHeight};
  }
  return {'w':d.body.clientWidth,'h':d.body.clientHeight};      
}
function Class(aBaseClass,aDefineClass)
{
  function class_()
  {
    this.Type=aBaseClass;
    for(var k in aDefineClass)
    {
      this[k]=aDefineClass[k];
    }
  };
  class_.prototype=aBaseClass;
  return new class_();
}
function New(aClass,aParams)
{
  function new_()
  {
    this.Type=aClass;
    if(aClass.Create)
    {
      aClass.Create.apply(this,aParams); 
    }
  };
  new_.prototype=aClass;
  return new new_();
}
function setCookie(name,val,expireHours)
{ 
  var oD=new Date();
  oD.setTime(oD.getTime()+expireHours*3600*1000);
  document.cookie=name+'='+encodeURIComponent(val)+'; expires='+oD.toGMTString();
}
function getCookie(name)
{
  var oCookie=document.cookie.split('; '),
      len=oCookie.length,
      i=0,tmpData=[];
  for(i;i<len;i++)
  {
    tmpData=oCookie[i].split('=');
    if(tmpData[0]==name)
    {
      return decodeURI(tmpData[1]);
    }
  }
  return false;
}
function delCookie(name)
{
  setCookie(name,'',-100);
}
/*迭代器*/
function each(obj,iterator)
{
  if(obj===null) return;
  if(obj.length===+obj.length)
  {
    for(var i=0,l=obj.length;i<l;i++)
    {
      if(iterator.call(obj[i],i,obj[i])===false)
      {
        return false;
      }
    }
  } else {
    for(var k in obj)
    {
      if(obj.hasOwnProperty(k)){
        if(iterator.call(obj[k],k,obj[k])===false)
        {
          return false;
        }
      }
    }
  }
}
/*获取对象相对viewport的位置*/
function getXY(elem)
{
  var x=0,y=0;
  while(elem.offsetParent)
  {
    y+=elem.offsetTop;
    x+=elem.offsetLeft;
    elem=elem.offsetParent;
  }
  return {'x':x,'y':y};
}
/**
 * 添加类
 */
function addClass(obj,cls)
{
  var clsName=obj.className; 
  //obj.className=clsName?clsName+' '+cls:cls;
  //判断当前类是否已经存在该类
  if(clsName)
  {
    if(clsName.indexOf(cls)==-1)
    {
      obj.className+=' '+cls;
    }
  }
  else
  {
    obj.className=cls;
  }
}
/**
 * 删除类
 */
function removeClass(obj,cls)
{
  var clsName=obj.className;
  if(clsName)
  {
    var clsArr=clsName.split(' '),
        avaiArr=[];
    for(var i=0,len=clsArr.length;i<len;i++)
    {
      if(clsArr[i]!=cls)
      {
        avaiArr.push(clsArr[i]);
      }  
    }
    obj.className=avaiArr.join(' ');  
  }
}