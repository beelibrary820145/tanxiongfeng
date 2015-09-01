<?php class DbMysqli { protected $connected=false, $_linkID=array(), $linkID, $queryStr, $queryID, $lastInsID, $affected_rows, $numRows, $numFields; private $config=array(); public function __construct($config='') { if(!empty($config)) { $this->config=$config; } } public function connect($config=array(),$linkNum=0) { if($this->linkID) { return $this->linkID; } if($config) { $this->config=$config; } else { $config=$this->config; } $this->linkID= mysqli_connect($config['host'].':'.$config['port'],$config['uname'],$config['psd']); if($this->linkID) { mysqli_query($this->linkID,'SET NAMES '.$config['charset']); $this->linkID->select_db($config['dbname']) or Error::halt(603,'连接数据库:'.$config['dbname'].'失败');; $this->connected=true; return true; } else { Error::halt(CONNECT_FAIL,$config); } } public function initConnect() { if(!$this->connected){ $this->connect(); } } public function query($str) { $rs=array(); $this->initConnect(); $this->queryID=$this->linkID->query($str); if(!$this->queryID) { Error::halt(501,'执行sql语句出错:'.$str); } else if(is_bool($this->queryID)) { $this->numRows=mysqli_affected_rows($this->linkID); } else { $this->numRows=mysqli_affected_rows($this->linkID); $this->numFields=$this->queryID->field_count; for($i=0;$i<$this->numRows;$i++) { $rs[]=$this->queryID->fetch_assoc(); } $this->free(); return $rs; } } private function free() { mysqli_free_result($this->queryID); $this->queryID=null; } private function parseKey($key) { $key = trim($key); if(!preg_match('/[,\'\"\*\(\)`.\s]/',$key)) { $key = '`'.$key.'`'; } return $key; } public function getFields($tableName) { $this->initConnect(); $result = $this->query('SHOW COLUMNS FROM '.$this->parseKey($tableName)); $info=array(); if(!$result){return $info;} foreach($result as $v) { $info[] = $v['Field']; } return $info; } public function execute($str) { $this->initConnect(); $this->queryStr=$str; $result=$this->linkID->query($str); if($result) { $this->affected_rows=mysqli_affected_rows($this->linkID); $this->lastInsID=mysqli_insert_id($this->linkID); } return $this->affected_rows; } public function close() { if($this->linkID){mysqli_close($this->linkID);} $this->linkID=null; } public function __get($key) { return isset($this->$key)?$this->$key:null; } } class App { public static function _init() { date_default_timezone_set(Conf::param('timezone')); Rewrite::init(); } } class Model { protected $trueTableName='', $conn=null; public function __construct($trueTableName='') { $this->trueTableName=empty($trueTableName)?$this->getModelName():$trueTableName; $this->db(0); } public function db($linkNum,$config=array()) { static $_db=array(); if(isset($_db[$linkNum])) { return $this->conn=$_db[$linkNum]; } (empty($config))&&($config=Conf::param('db')); $dbType=ucfirst($config['dbtype']); return $this->conn=$_db[$linkNum]=new $dbType($config); } public function getModelName() { return substr(get_class($this),0,-5); } public function insert($data='') { if(empty($data) && !is_array($data)){return false;} $this->execute('INSERT INTO '.$this->trueTableName.$this->_parseData($data)); return $this->getLastInsId(); } public function getLastInsId() { return $this->conn->lastInsID; } public function getFields() { return $this->conn->getFields($this->trueTableName); } public function execute($sql) { return $this->conn->execute($sql); } public function getNumRows() { return $this->conn ->numRows; } public function _parseOptions($options='') { $options=trim($options); return empty($options)?'':' WHERE '.$options; } public function parseValue($value) { return '\''.$this->escapeString($value).'\''; } public function _parseData($data=array()) { $field=array_map(array($this,'parseKey'),array_keys($data)); $value=array_map(array($this,'parseDataByType'),$data); return '('.implode(',',$field).') VALUES('.implode(',',$value).')'; } public function parseKey($key) { $key = trim($key); if(!preg_match('/[,\'\"\*\(\)`.\s]/',$key)) { $key = '`'.$key.'`'; } return $key; } public function escapeString($str) { return addslashes($str); } public function update($data=array(),$options='') { return $this->execute('UPDATE '.$this->trueTableName.$this->_before_update($data).$this->_parseOptions($options)); } public function _before_update($data=array()) { $rs=array(); foreach($data as $k=>$v) { $rs[]=$this->parseKey($k).'='.$this->parseDataByType($v); } return ' SET '.implode(',',$rs); } public function parseDataByType($data) { if(is_array($data) && isset($data[1])) { switch($data[1]) { case 'int':return (int)$data[0]; case 'float':return (float)$data[0]; case 'double':return (double)$data[0]; case 'ignore':return $data[0]; case 'string':; default:return $this->parseValue($data[0]); } } else { return $this->parseValue($data); } } public function delete($options='') { return $this->conn->execute('DELETE FROM '.$this->trueTableName.$this->_parseOptions($options)); } public function select($field='*',$options='',$limit='') { (empty($field))&&($field='*'); $rs=$this->conn->query('SELECT '.$field.' FROM '.$this->trueTableName.$this->_parseOptions($options).($limit?' LIMIT '.$limit:'')); return $limit==1?($rs?$rs[0]:array()):$rs; } public function query($sql) { return $this->conn->query($sql); } public function get($k) { return $this->conn->$k; } } class Error { CONST REDIRECT=800; static function halt($msg_code,$msg,$url='',$t=5) { if(defined('AJAX_REQUEST') && AJAX_REQUEST==1) { self::jsonReturn($msg_code,$msg,$url); } else { self::showInPage($msg_code,$msg,$url,$t); } } private static function jsonReturn($msgCode,$msg,$url='') { Sys::S('core.Return.JsonReturn'); JsonReturn::output($msgCode,$msg,$url); } private static function showInPage($msgCode,$msg='',$url='',$t=5) { switch($msgCode) { case QUERY_ERROR: $msg='数据库命令执行失败:<br />'.$msg; exit($msg); case CONNECT_FAIL: $errArr=''; foreach($msg as $k=>$v) { $errArr[]=$k.'=>'.$v; } $msg='Fail To Connect Database:'.implode('<br />',$errArr); exit($msg); case SUCCESS: self::redirect($url,$msg,$t,SUCCESS); break; case FAIL: self::redirect($url,$msg,$t,FAIL); break; default: self::redirect($url,$msg,$t,SUCCESS); break; } } public static function redirect($redirectUrl,$msg,$t,$type=SUCCESS) { $type=$type==SUCCESS?'操作成功!':'操作失败!'; header('Location:'.DOMAIN.'index.php?M=Exception&A=index&t='.$t.'&msg='.$msg.'&msg_type='.$type.'&url='.urlencode($redirectUrl)); } } class View { protected static $tVar=array(), $lVar=array(), $tplFile='', $runTimeFile='', $tpl_l_delim='{{', $tpl_r_delim='}}', $spc_param=array('styles','scripts','livescripts'), $suffix=''; static function init() { self::$suffix=Conf::param('tpl_template_suffix'); self::$runTimeFile=RUNTIME_PATH.''.md5(MODULE.'Action'.ACTION).''.self::$suffix; } static function getHeader($data) { (isset($data['title']))||($data['title']='BEETHINK'); (isset($data['other']))||($data['other']=''); (isset($data['charset']))||($data['charset']=Conf::param('tpl_charset')); $str='<!DOCTYPE html>
<html>
<head>
<meta charset="%s">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<meta name="description" content="">
<meta name="author" content="">%s
<link rel="shortcut icon" href="../Common/images/favicon.png" type="image/png">
<title>%s</title>'; $str=sprintf($str,$data['charset'],$data['other'],$data['title']); if(isset(self::$tVar['styles'])) { $str.=self::getFile(self::$tVar['styles'],'css'); } return $str; } static function assign($k,$v,$order=0) { if(in_array($k,self::$spc_param)) { if($k=='livescripts') { self::$tVar[$k]=isset(self::$tVar[$k])?self::$tVar[$k].$v:$v; } else if(is_array($v)) { if(isset(self::$tVar[$k])) { self::$tVar[$k]=$order?array_merge($v,self::$tVar[$k]):array_merge(self::$tVar[$k],$v); } else { self::$tVar[$k]=$v; } } } else { self::$tVar[$k]=$v; } } static function l_assign($k,$v,$order='') { if(in_array($k,self::$spc_param) && is_array($v)) { if($k=='livescripts') { self::$lVar[$k]=isset(self::$lVar['livescripts'])?self::$lVar[$k].'<br/>'.$v:$v; }else if($k=='styles') { self::assign($k,$v,$order); } else if(is_array($v)) { if(isset(self::$tVar[$k])) { self::$lVar[$k]=$order?array_merge($v,self::$lVar[$k]):array_merge(self::$lVar[$k],$v); } else { self::$lVar[$k]=$v; } } } else { self::$lVar[$k]=$v; } } static function get($k='') { return $k==''?self::$tVar:(isset(self::$tVar[$k])?self::$tVar[$k]:null); } static function getTplFile($file) { $file=strtr($file,'.#','/.'); if(!$file) { $fpath=TPL_PATH.''.MODULE.'/'.ACTION.''.self::$suffix; } else if(strpos($file,'core')===0) { $fpath=THINK_PATH.'Common/Tpl/'.substr($file,5).self::$suffix; } else { $fpath=TPL_PATH.$file.self::$suffix; } if(is_file($fpath)) { return $fpath; } else { Error::halt(FILE_NOTFOUND,'模板文件:'.$file.'未找到'); } } static function display($tpl='',$data=array()) { self::init(); $tplFile=self::getTplFile($tpl); $con= self::compiler($tplFile,self::$tVar); $header=self::getHeader($data); exit($header.$con); } static function layout($tpl='') { $tplFile=self::getTplFile($tpl); $con=self::compiler($tplFile,self::$lVar); self::$lVar=null; return $con; } static function compiler($tplFile,&$param) { $content=file_get_contents($tplFile); $matches=self::getMatchRs($content); $tmp_arr=array(); foreach($matches[0] as $k=>$v) { if(strpos($v,':')) { $tmp_arr=explode(':',$matches[1][$k]); $d=$tmp_arr[0]=='Layout'?self::layoutHandle($tmp_arr[1],self::$lVar):self::commonTplHandle($matches[1][$k],$param); } elseif(strpos($v,'.')) { $d=self::arrayHandle($matches[1][$k],$param); } else { $tmp=substr($matches[1][$k],1); if($tmp=='scripts' && isset($param['scripts'])) { $param['scripts']=self::getFile($param['scripts'],'js'); }else if($tmp=='livescripts' && isset($param['livescripts'])) { $param['livescripts']=sprintf(self::getScriptTpl($param),$param['livescripts']); } $d=isset($param[$tmp])?$param[$tmp]:''; } $content=str_replace($v,$d,$content); } file_put_contents(self::$runTimeFile,$content); return $content; } static function getScriptTpl(&$param) { return isset($param['scriptTml'])?$param['scriptTml']:'<script>%s</script>'; } static function arrayHandle($data,&$param) { $tmp_arr=explode('.',substr($data,1)); $len=count($tmp_arr); $d=''; $i=1; if(isset($param[$tmp_arr[0]])) { $d=$param[$tmp_arr[0]]; while($i<$len) { if(isset($d[$tmp_arr[$i]])) { $d=$d[$tmp_arr[$i]]; } else { return ''; } ++$i; } return $d; } return ''; } static function layoutHandle($data,&$param) { $index=strrpos($data,'.'); $a=substr($data,0,$index); $m=substr($data,$index+1); $oA=Sys::A($a); return $oA::$m(); } static function getMatchRs($content) { $matches=array(); $B=str_replace('{','\\{',self::$tpl_l_delim); $E=str_replace('}','\\}',self::$tpl_r_delim); preg_match_all('/'.$B.'(\S+?)'.$E.'/',$content,$matches); return $matches; } static function getCommonTplPath($path) { $path=strtr($path,'.#','/.'); $fPath=''; if(strpos($path,'core')===0) { $fPath=THINK_PATH.'Common/Tpl/'.substr($path,5).self::$suffix; } else { $fPath=TPL_PATH.$path.self::$suffix; } if(!is_file($fPath)) { Error::halt(FILE_NOTFOUND,'模板文件不存在:'.$path); } return $fPath; } static function commonTplHandle($v,&$param) { $fPath=self::getCommonTplPath($v); $con=file_get_contents($fPath); $matches=self::getMatchRs($con); foreach($matches[0] as $k=>$v) { $tmp=substr($matches[1][$k],1); $d=isset($param[$tmp])?$param[$tmp]:''; $con=str_replace($v,$d,$con); } return $con; } static function getFile($path,$type) { $htmlArr=array(); if(is_array($path)) { return self::getPackFile($path,$type); } else { return self::getSingleFile($path,$type); } } static function getPackFile($data,$type) { $packArr=array(); $runtimeDir='./Runtime/'; $suffix=$type=='css'?'.css':'.js'; $runtimeName=''; foreach($data as $k=>$v) { if(is_array($v)) { $runtimeName=$k.$suffix; $runtimePath=RUNTIME_PATH.$k.$suffix; if(Rewrite::checkCache($runtimePath)) { $packArr[]=self::getLink($type,$runtimeName); continue; } $conData=array(); foreach($v as $v1) { $tmpPath=self::parsePath($v1,$type); $conData[]=file_get_contents($tmpPath); } $packContent=implode('',$conData); file_put_contents($runtimePath,$packContent); $packArr[]=self::getLink($type,$runtimeName); } else { $packArr[]=self::getSingleFile($v,$type); } } return implode('',$packArr); } static function getSingleFile($path,$type) { $tmpPath=self::parsePath($path,$type); $runtimeName=basename($tmpPath); $runtimePath=RUNTIME_PATH.$runtimeName; if(Rewrite::checkCache($runtimePath)) { return self::getLink($type,$runtimeName); } file_put_contents($runtimePath,file_get_contents($tmpPath)); return self::getLink($type,$runtimeName); } static function parsePath($data,$type) { $basePath=''; $type=ucfirst($type); $data=strtr($data,'.#','/.'); $suffix=$type=='Css'?'.css':'.js'; $fpath=substr($data,0,4)=='core'?THINK_PATH.'Common/'.$type.'/'.substr($data,5).$suffix:COMMON_PATH.$type.'/'.$data.$suffix; if(!is_file($fpath)) { Error::halt(FILE_NOTFOUND,'需要包含的文件不存在:'.$fpath); } return $fpath; } static function getLink($type,$path) { if($type=='css') { return '<link href="./Runtime/'.$path.'" rel="stylesheet" />'; } elseif($type=='js') { return '<script src="./Runtime/'.$path.'"></script>'; } } } class Sys { static $_class=array(); static function init($className) { return ucfirst(strtr($className,'.#','/.')); } static function D($modelName) { $modelName=self::init($modelName); $modelName.='Model'; $baseName=basename($modelName); if(!isset(self::$_class[$modelName])) { Loadfile::import($modelName,'model'); self::$_class[$modelName]=$baseName; } return $baseName; } static function A($actionName) { $className=self::init($actionName); $className.='Action'; $baseName=basename($className); if(!isset(self::$_class[$className])) { Loadfile::import($className,'action'); self::$_class[$className]=$baseName; } return $baseName; } static function M($tableName) { static $tableHandle=array(); if(isset($tableHandle[$tableName])) { return $tableHandle[$tableName]; } else { return $tableHandle[$tableName]=new Model($tableName); } } static function S($className) { static $cls_name=array(); $className=self::init($className); $baseName=basename($className); if(!isset($cls_name[$className])) { Loadfile::import($className,'static'); $cls_name[$className]=$baseName; } return $baseName; } static function I($class_name,$config=null) { static $cls_name=array(); $class_name=self::init($class_name); if(isset($cls_name[$class_name])) { return $cls_name[$class_name]; } Loadfile::import($class_name,'class'); return new $class_name($config); } } class Loadfile { public static function require_cache($fname) { static $_importFiles=array(); if(isset($_importFiles[$fname])) { return true; } if(is_file($fname) && require($fname)) { return $_importFiles[$fname]=true; } return false; } public static function import($className,$type) { static $_file=array(); $method=''; $flag=false; $type=strtolower($type); $type_refer=array( 'action'=>'importAction', 'model'=>'importModel', 'class'=>'importClass', 'static'=>'importStatic' ); if(isset($_file[$className])) { return true; } $method=$type_refer[$type]; $flag=self::$method($className); if(!$flag) { Error::halt(FILE_NOTFOUND,'文件:'.$className.'未找到'); } } public static function importAction($actionName) { $actionName.='.class.php'; $fpathArr=array(); $fpathArr=(strpos($actionName,'Core')===0)?array(THINK_PATH.'Common/Action/'.substr($actionName,5)): array(ACTION_PATH.$actionName,THINK_PATH.'Common/Action/'.$actionName); $flag=false; foreach($fpathArr as $v) { if(is_file($v) && require($v)) { $flag=true; break; } } return $flag; } public static function importModel($modelName) { $modelName.='.class.php'; $fpathArr=array(); $fpathArr=strpos($modelName,'Core')===0?array(THINK_PATH.'Common/Model/'.substr($modelName,5)):array( MODULE_PATH.$modelName, THINK_PATH.'Common/Model/'.$modelName ); $flag=false; foreach($fpathArr as $v) { if(is_file($v) && require($v)) { $flag=true; break; } } return $flag; } static function importClass($className) { $className.='.class.php'; $fpathArr=array(); $flag=false; $fpathArr=strpos($className,'Core')===0?array(THINK_PATH.'Common/Class/'.substr($className,5)):array( MODULE_PATH.$className, THINK_PATH.'Common/Class/'.$className ); foreach($fpathArr as $v) { if(is_file($v) && require($v)) { $flag=true; break; } } return $flag; } static function importStatic($className) { $className.='.class.php'; $fpathArr=array(); $flag=false; $fpathArr=strpos($className,'Core')===0?array(THINK_PATH.'Common/Class/'.substr($className,5)):array( MODULE_PATH.$className, THINK_PATH.'Common/Class/'.$className ); foreach($fpathArr as $v) { if(is_file($v) && require($v)) { $flag=true; break; } } return $flag; } }  class Rewrite { static function init() { define('MODULE', isset($_GET['M']) ? ucfirst($_GET['M']) : 'Index'); define('ACTION', isset($_GET['A']) ? strtolower($_GET['A']) : 'index'); self::isAjax() ? self::ajaxModule() : self::normalModule(); } static function ajaxModule() { $m = MODULE . 'Ajax'; $fpath = AJAX_PATH . $m . '.class.php'; self::call($m, ACTION, $fpath); } static function normalModule() { $m = MODULE . 'Action'; $fpath = ACTION_PATH . $m . '.class.php'; self::call($m, ACTION, $fpath); } static function call($m, $a, $fpath) { $fileName = RUNTIME_PATH . '' . md5($m . $a) . Conf::param('tpl_cache_suffix'); if (self::checkCache($fileName)) { exit(file_get_contents($fileName)); } if (is_file($fpath) && require($fpath)) { if (class_exists($m, false)) { if (method_exists($m, $a)) { $m::$a(); } else { Error::halt(METHOD_NOTFOUND, $m . '::' . $a); } } else { Error::halt(CLASS_NOTFOUND, $m); } } else { Error::halt(FILE_NOTFOUND, $fpath); } } static function isAjax() { if (isset($_SERVER['HTTP_X_REQUESTED_WITH'])) { if ('xmlhttprequest' == strtolower($_SERVER['HTTP_X_REQUESTED_WITH'])) header('Expires: Fri, 25 Dec 1980 00:00:00 GMT'); header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . 'GMT'); header('Cache-Control: no-cache, must-revalidate'); header('Pragma: no-cache'); define('AJAX_REQUEST', 1); return true; } return false; } static function checkCache($tmpFile) { if (!Conf::param('tpl_cache_on') || APP_DEBUG) { return false; } if (!is_file($tmpFile)) { return false; } else if (filectime($tmpFile) > filemtime($tmpFile)) { return false; } else if (time() > filemtime($tmpFile) + Conf::param('tpl_cache_time')) { return false; } return true; } } ?>