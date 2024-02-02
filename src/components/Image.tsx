import { ImageType } from '@/services/typings';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Upload, message } from 'antd';
import React from 'react';

function imageToSrc(image: ImageType): string {
  if (image.type === 'none') {
    return '';
  } else if (image.type === 'uri') {
    return image.data;
  } else if (image.type === 'jpeg base64') {
    return 'data:image/jpeg;charset=utf-8;base64, ' + image.data;
  } else if (image.type === 'png base64') {
    return 'data:image/png;charset=utf-8;base64, ' + image.data;
  } else if (image.type === 'jpg base64') {
    return 'data:image/gif;charset=utf-8;base64, ' + image.data;
  }
  throw new Error('unknown image type');
}

function srcTypeToImage(type: string | undefined, data: string): ImageType {
  if (type === undefined) {
    return { type: 'none', data: '' };
  } else if (type === 'image/jpeg') {
    return { type: 'jpeg base64', data };
  } else if (type === 'image/png') {
    return { type: 'png base64', data };
  } else if (type === 'image/jpg') {
    return { type: 'jpg base64', data };
  }
  throw new Error('unknown image type');
}

const Image: React.FC<{
  img: ImageType;
  style?: React.CSSProperties;
}> = (props) => {
  return <img src={imageToSrc(props.img)} style={{ width: '100%', ...props.style }} />;
};

const ImageUpload: React.FC<{
  defaultValue?: ImageType;
  onChange: (image: ImageType) => void;
}> = (props) => {
  const intl = useIntl();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [img, setImg] = React.useState<ImageType>({ type: 'none', data: '' });

  React.useEffect(() => {
    if (props.defaultValue) {
      setImg(props.defaultValue);
    }
  }, []);

  return (
    <Upload
      name="avatar"
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      action={async (file): Promise<string> => {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result?.toString().split(',')[1] || '';
            resolve(base64data);
          };
          reader.readAsDataURL(file);
        });
        setImg(srcTypeToImage(file.type, base64));
        return '';
      }}
      beforeUpload={(file) => {
        const fileTypeOk =
          file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
        if (!fileTypeOk) {
          message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          message.error('Image must smaller than 2MB!');
        }
        return fileTypeOk && isLt2M;
      }}
      onChange={(info) => {
        if (info.file.status === 'uploading') {
          setLoading(true);
          return;
        }
        if (info.file.status === 'done') {
          setLoading(false);
        }
        props.onChange(img);
      }}
    >
      {img.type !== 'none' ? (
        <Image img={img}></Image>
      ) : (
        <button style={{ border: 0, background: 'none' }} type="button">
          {loading ? <LoadingOutlined /> : <PlusOutlined />}
          <div style={{ marginTop: 8 }}>
            {intl.formatMessage({ id: 'global.components.action.upload' })}
          </div>
        </button>
      )}
    </Upload>
  );
};

export { Image, ImageUpload };
export type { ImageType };
