"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Form, Input, Button, Layout, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const { Content } = Layout;

export default function LoginPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: Record<string, string>) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", values);
      const { user, token } = response.data;

      login(
        {
          id: user.id,
          email: user.email,
          name: user.fullName,
          avatar: user.avatar,
        },
        token,
      );

      message.success("Login successful!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error against", api.defaults.baseURL, error);
      message.error(
        error.response?.data?.message ||
          `Login failed. Please check your email and password.`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="h-full bg-[#EAECEF] flex items-center justify-center">
      <Content className="w-full max-w-[400px] p-4">
        <div className="bg-[#1546A0] rounded-[40px] px-8 pt-16 pb-12 flex flex-col items-center shadow-xl">
          <div className="mb-12">
            <Image
              src="/VoxSign logo.png"
              alt="VoxSign Logo"
              width={180}
              height={180}
              className="object-contain"
            />
          </div>

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            className="w-full"
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please input your email!" }]}
              className="mb-6"
            >
              <Input
                placeholder="surname@gmail.com"
                className="h-12 bg-[#4C75B8] border-none text-white placeholder:text-blue-100 rounded-full px-6"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
              className="mb-2"
            >
              <Input.Password
                placeholder="•••••••"
                iconRender={(visible) =>
                  visible ? (
                    <EyeTwoTone twoToneColor="#fff" />
                  ) : (
                    <EyeInvisibleOutlined className="text-white" />
                  )
                }
                className="h-12 bg-[#4C75B8] border-none text-white placeholder:text-blue-100 rounded-full px-6"
              />
            </Form.Item>

            <div className="text-center mb-6">
              <Link
                href="/forgot-password"
                className="text-blue-200 text-sm hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <div className="text-center mb-8">
              <span className="text-blue-100 text-sm">
                Don&apos;t have an account,{" "}
              </span>
              <Link
                href="/signup"
                className="text-white text-sm font-semibold hover:underline"
              >
                SignUp.
              </Link>
            </div>

            <div className="w-full border-t border-blue-400 mb-8 opacity-50"></div>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 bg-[#5EB7EB] hover:bg-[#4EA7DB]! border-none rounded-[15px] text-lg font-medium shadow-md"
              >
                Log in
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>
    </Layout>
  );
}
