import { createRoot } from "react-dom/client";

import { autoPrefixTransformer, StyleProvider } from "@ant-design/cssinjs";
import { enUSIntl, ProConfigProvider } from "@ant-design/pro-components";
import { App, ConfigProvider } from "antd";
import enUS from "antd/lib/locale/en_US";
import { RouterProvider } from "react-router";
import antdThemeConfig from "./common/config/antdThemeConfig.ts";
import { router } from "./router.tsx";

createRoot(document.getElementById("root")!).render(
  <StyleProvider layer container={document.body} transformers={[autoPrefixTransformer]}>
    <ConfigProvider theme={antdThemeConfig} locale={enUS}>
      <ProConfigProvider intl={enUSIntl}>
        <App>
          <RouterProvider router={router} />
        </App>
      </ProConfigProvider>
    </ConfigProvider>
  </StyleProvider>,
);
