import useRequest from '@/common/hooks/network/useRequest';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Input, Upload, message } from 'antd';
import { useState } from 'react';

export default function AdminHome() {
  const [attributeText, setAttributeText] = useState('');
  const { request: uploadReq, isPending: uploadPending } = useRequest<any, FormData>();
  const { request: saveAttr, isPending: saveAttrPending } = useRequest<void, string[]>();

  const handleUpload = async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    try {
      await uploadReq({
        url: '/admin/courses/upload',
        method: 'POST',
        data: form,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('Upload thành công');
    } catch (e) {
      message.error('Upload thất bại');
    }
  };

  const handleSaveAttributes = async () => {
    const values = attributeText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    try {
      await saveAttr({ url: '/admin/attributes', method: 'POST', data: values });
      message.success('Lưu thuộc tính thành công');
    } catch (e) {
      message.error('Lưu thất bại (có thể đã tồn tại)');
    }
  };

  return (
    <div className='max-w-4xl mx-auto'>
      <h2 className='text-2xl font-bold mb-4'>Trang chủ Quản trị</h2>

      <Card className='mb-6'>
        <h3 className='text-lg font-semibold mb-2'>Bulk upload courses (CSV)</h3>
        <p className='text-sm text-gray-500'>CSV format: code,name,description (header optional)</p>
        <Upload
          beforeUpload={(file) => {
            handleUpload(file);
            return false;
          }}
          accept='.csv'
        >
          <Button icon={<UploadOutlined />} loading={uploadPending}>
            Upload CSV
          </Button>
        </Upload>
      </Card>

      <Card>
        <h3 className='text-lg font-semibold mb-2'>Define attributes (one-time save)</h3>
        <p className='text-sm text-gray-500 mb-2'>
          Enter one attribute per line. Saving is allowed only once.
        </p>
        <Input.TextArea
          rows={8}
          value={attributeText}
          onChange={(e) => setAttributeText(e.target.value)}
        />
        <Divider />
        <Button type='primary' loading={saveAttrPending} onClick={handleSaveAttributes}>
          Save attributes
        </Button>
      </Card>
    </div>
  );
}
