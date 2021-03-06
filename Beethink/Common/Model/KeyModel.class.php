<?php
/**
 * 令牌处理
 * 
 * 
 * 生成随机数
 */
class KeyModel
{
  /**
   * 获取令牌
   */
  public function getKey()
  {
    $token = mt_rand(0,1000000);
    $_SESSION['token']=$token; 
    return $token;
  }
  /**
   * 验证token
   */
  public function parseKey($token)
  {
     return isset($_SESSION['token']) && !empty($_SESSION['token']) && $_SESSION['token']==$token;
  }
  /**
   * 销毁令牌
   */
  public function unsetKey()
  {
    if(isset($_SESSION['token']))
    {
      unset($_SESSION['token']);
    }
  }
}
?>