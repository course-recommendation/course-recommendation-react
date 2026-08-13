import type { ThemeConfig } from 'antd';

const antdThemeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#4338CA',
    colorLink: '#4338CA',
    colorBgBase: '#FAF9F7',
    colorTextBase: '#1C1917',
    borderRadius: 10,
    fontFamily: "'Be Vietnam Pro', sans-serif",
    colorBgContainer: '#FFFFFF',
  },
  components: {
    // Amber là màu dành riêng cho điểm/đánh giá theo design brief, nên đặt ở token của Rate
    // thay vì override CSS của AntD.
    Rate: {
      starColor: '#D97706',
      // Dãy sao "Mức độ hài lòng tổng thể" là điều khiển chính của khối đánh giá - điểm duy nhất
      // nói lên thích hay không thích - nên cho to hơn hẳn nhãn 14-15px bên trên. Mặc định của
      // AntD là controlHeight * 0.625 = 20px, thang size dựng sẵn cao nhất cũng chỉ 25px, nên đặt
      // token trực tiếp. Rate duy nhất trong app là SatisfactionRating nên token này không ảnh
      // hưởng chỗ nào khác.
      starSize: 32,
    },
  },
};

export default antdThemeConfig;
