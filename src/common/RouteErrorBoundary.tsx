import { Button, Result } from "antd";
import { Link } from "react-router";

export default function RouteErrorBoundary() {
  return (
    <Result
      status={500}
      title={500}
      subTitle="Đã có lỗi xảy ra"
      extra={
        <Button type="primary">
          <Link to={"/"} type="primary">
            Về trang chủ
          </Link>
        </Button>
      }
    />
  );
}
