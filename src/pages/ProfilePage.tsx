import { useNavigate } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import { useEffect, useContext, useState } from "react";
import { getUserProfile, updateUserProfile } from "../data/users";
import { GlobalContext } from "../main";
import { UserProfileFields } from "../utils/constants";
import { Spin, Typography, Form, Input, Button, message } from "antd";
import { useTranslation } from "react-i18next";
const { Title } = Typography;
import { LoadingOutlined } from "@ant-design/icons";
import BottomMenu from "../components/BottomMenu";
import { profile } from "./HelpPage";
import i18n from "../i18n";
const ProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const userContext = useContext(GlobalContext);
  const userId =
    userContext?.userContext?.data || "19b31340-f88c-48dc-bc97-cbe80427ba37";

  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    WebApp.BackButton.show();
    WebApp.BackButton.onClick(() => {
      navigate(-1);
    });
    return () => {
      WebApp.BackButton.hide();
    };
  }, [navigate]);

  const validatePhoneNumber = (_: unknown, value: string) => {
    if (!value) {
      return Promise.reject(new Error(t("phone_error")));
    }
    if (!/^\+?[1-9]\d{1,14}$/.test(value)) {
      return Promise.reject(new Error(t("phone_error")));
    }
    return Promise.resolve();
  };
  const validateEmail = (_: unknown, value: string) => {
    if (!value) {
      return Promise.reject(new Error(t("email_error")));
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return Promise.reject(new Error(t("email_error")));
    }
    return Promise.resolve();
  };
  const fetchUser = async () => {
    if (userId) {
      setIsLoading(true);
      const user = (await getUserProfile(userId)) as UserProfileFields;
      form.setFieldsValue(user);
      setIsLoading(false);
    }
  };
  const onFinish = async (values: UserProfileFields) => {
    console.log('values', values);
    const updatedUser = await updateUserProfile(userId, values);
    console.log('updatedUser', updatedUser);
    if (updatedUser) {
      message.success(t("profile_updated"));
      await fetchUser();
    } else {
      message.error(t("profile_update_error"));
    }
  };
  useEffect(() => {
    fetchUser();
  }, [userId]);

  return (
    <div className="page">
      <Title level={3}>{t("profile")}</Title>
      <Spin
        spinning={isLoading}
        indicator={<LoadingOutlined style={{ fontSize: 72 }} spin />}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="first_name"
            label={t("first_name")}
            rules={[{ required: true, message: t("first_name_error") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="last_name"
            label={t("last_name")}
            rules={[{ required: true, message: t("last_name_error") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone_number"
            label={t("phone")}
            rules={[
              {
                required: true,
                validator: validatePhoneNumber,
                message: t("phone_error"),
              },
            ]}
          >
            <Input prefix="+" />
          </Form.Item>
          <Form.Item
            name="email"
            label={t("email")}
            rules={[{ required: true, validator: validateEmail, message: t("email_error") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
              size="large"
              disabled={isLoading}
            >
              {t("save")}
            </Button>
          </Form.Item>
        </Form>
      </Spin>
      {profile[i18n.language as keyof typeof profile]()}
      <BottomMenu />
    </div>
  );
};

export default ProfilePage;
