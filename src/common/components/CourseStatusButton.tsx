import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, ButtonProps } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import useRequest from '../hooks/network/useRequest';
import { UpdateUserCourseStatusRequest, UserCourseStatus } from '../types/Course.types';

type Props = {
  type: 'plan' | 'complete';
  marked: boolean;
  onMarkChange?: (marked: boolean) => void;
  className?: string;
  courseId: number;
  onClick?: ButtonProps['onClick'];
};

export default function CourseStatusButton({
  type,
  marked: initialMarked,
  className,
  courseId,
  onClick,
  onMarkChange,
}: Props) {
  const [marked, setMarked] = useState(initialMarked);
  const { request: updateUserCourseStatus } = useRequest<void, UpdateUserCourseStatusRequest>();

  useEffect(() => {
    setMarked(initialMarked);
  }, [initialMarked]);

  const getButtonLabel = () => {
    if (type === 'plan') {
      return marked ? 'Đang dự kiến học' : 'Dự kiến học';
    }
    if (type === 'complete') {
      return marked ? 'Đã hoàn thành' : 'Hoàn thành';
    }
    return 'Unknown label';
  };

  const getColor = () => {
    if (type === 'plan') {
      return marked ? 'cyan' : 'primary';
    }
    if (type === 'complete') {
      return marked ? 'cyan' : 'primary';
    }
    return undefined;
  };

  const getVariant = () => {
    if (type === 'plan') {
      return 'solid';
    }
    if (type === 'complete') {
      return marked ? 'solid' : 'outlined';
    }
    return undefined;
  };

  return (
    <Button
      icon={marked ? <CheckOutlined /> : <PlusOutlined />}
      color={getColor()}
      variant={getVariant()}
      className={classNames(className)}
      onClick={(e) => {
        onMarkChange?.(!marked);
        setMarked((prev) => !prev);
        updateUserCourseStatus({
          url: `/me/courses/${courseId}`,
          method: 'PUT',
          data: {
            status: type === 'plan' ? UserCourseStatus.PLANNED : UserCourseStatus.COMPLETED,
          },
        });

        onClick?.(e);
      }}
    >
      {getButtonLabel()}
    </Button>
  );
}
