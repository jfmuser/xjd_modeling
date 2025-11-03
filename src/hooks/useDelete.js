import { ElMessageBox, ElMessage, ElLoading } from 'element-plus';

export default function ({ deleteRequest, fetchListRequest }) {
  const onDelete = async (row) => {
    const confirm = await ElMessageBox.confirm(
      `此操作将永久删除【${row.projectName}】, 是否继续?`,
      '提示',
      {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning',
      },
    ).catch(() => {});

    if (confirm !== 'confirm') {
      return;
    }
    const loading = ElLoading.service({
      lock: true,
      background: 'rgba(0, 0, 0, 0.7)',
    });
    try {
      await deleteRequest(row.id);
      ElMessage.success('删除成功');
      fetchListRequest();
    } catch (error) {
      ElMessage.error('删除失败');
    } finally {
      loading.close();
    }
  };

  return {
    onDelete,
  };
}
