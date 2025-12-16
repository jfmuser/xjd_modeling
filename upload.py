import paramiko
import sys
import os
from configparser import ConfigParser
from stat import S_ISDIR as isdir








# try:
#   sftp.stat(target_folder)
# except FileNotFoundError:
#   sftp.mkdir(target_folder)
# sftp.put(source_file, target_folder)
# sftp.close()

# 执行shell命令
# command = 'docker cp '+ target_folder +' pazhoulab_cms:/usr/local/pazhoulab_cms/static/upload/image/tempImage'
# stdin, stdout, stderr = ssh.exec_command(command)

# # 获取命令输出结果
# output = stdout.read().decode('utf-8') 

# 输出命令输出结果
# print(output)


# if __name__ == "__main__":

current_path = os.getcwd()
# 远程服务器的IP地址、用户名和密码
#'192.168.10.25'
host = '192.168.10.25' 
username = 'root'
password = 'A19961004'

# 创建SSH客户端
ssh = paramiko.SSHClient()
# 自动添加服务器的主机密钥
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
# 连接到远程服务器
ssh.connect(hostname=host, username=username, password=password)
# 使用SFTP传输文件
sftp = ssh.open_sftp()
# 设置源文件路径和目标路径
filename = 'dist'
source_file = os.path.join(current_path,filename)
source_file.replace('\\', '/')
target_folder ='/home/kaivin/iframes/xj'


def check_local_dir(dir_name):
  # """本地文件夹是否存在，不存在则创建"""
  if not os.path.exists(dir_name):
      os.makedirs(dir_name)

# 递归上传文件夹，也可以上传文件
def uploadDir(local_dir_name,remote_dir_name):
  print(local_dir_name)
  if os.path.isdir(local_dir_name):
      # 文件夹，不能直接上传，需要继续循环
      check_local_dir(remote_dir_name)
      print('开始上传文件夹：' + local_dir_name)
      for local_file_name in os.listdir(local_dir_name):
          sub_local = os.path.join(local_dir_name, local_file_name)
          sub_local = sub_local.replace('\\', '/')
          sub_target = os.path.join(remote_dir_name, local_file_name)
          sub_target = sub_target.replace('\\', '/')
          uploadDir(sub_local,sub_target)
  else:
        # 文件，直接上传
        print('开始上传文件：' + local_dir_name,'到',remote_dir_name)
        sftp.put(local_dir_name,remote_dir_name)


uploadDir(source_file,target_folder)
sftp.close()

# 执行shell命令
# command = 'python /home/kaivin/upload.py'
# stdin, stdout, stderr = ssh.exec_command(command)
# result = stdout.read()
# print(result)
# 关闭SSH连接
ssh.close()