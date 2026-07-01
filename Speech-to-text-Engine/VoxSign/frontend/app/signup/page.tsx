"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Form, Input, Button, Layout, Select, message, Card, Tag } from "antd";
import { 
  CheckCircleFilled, 
  ThunderboltFilled, 
  MinusCircleFilled, 
  GlobalOutlined, 
  BookOutlined 
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const { Content } = Layout;
const { Option } = Select;

export default function SignUpPage() {
  const [step, setStep] = useState(1); // 1: Info, 2: Plan
  const [userType, setUserType] = useState("student");
  const [plan, setPlan] = useState("free");
  const [form] = Form.useForm();
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const onInfoFinish = (values: Record<string, string>) => {
    setFormData(values);
    setStep(2);
  };

  const onFinalSignup = async () => {
    setLoading(true);
    try {
      const signupData = {
        ...formData,
        userType,
        plan,
      };
      
      const response = await api.post("/auth/register", signupData);
      const { user, token } = response.data;
      
      login({
        id: user.id,
        email: user.email,
        name: user.fullName,
        avatar: user.avatar,
      }, token);
      
      message.success("Registration successful!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Signup error:", error);
      message.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-[#EAECEF] flex items-center justify-center py-8 px-4">
      <Content className="w-full max-w-[450px]">
        <div className="bg-[#1546A0] rounded-[40px] px-8 pt-10 pb-12 flex flex-col items-center shadow-xl">
          <div className="mb-4">
            <Image
              src="/VoxSign logo.png"
              alt="VoxSign Logo"
              width={60}
              height={60}
              className="object-contain"
            />
          </div>

          <h1 className="text-white text-3xl font-semibold mb-8">
            {step === 1 ? "Sign Up" : "Choose Your Plan"}
          </h1>

          {step === 1 ? (
            <>
              <div className="w-full mb-8 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setUserType("student")}
                  className={`flex-1 h-12 rounded-full font-semibold transition-all ${
                    userType === "student"
                      ? "bg-gradient-to-r from-[#4A4AFF] to-[#B04AFF] text-white shadow-lg"
                      : "bg-white text-black"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("educator")}
                  className={`flex-1 h-12 rounded-full font-semibold transition-all ${
                    userType === "educator"
                      ? "bg-gradient-to-r from-[#4A4AFF] to-[#B04AFF] text-white shadow-lg"
                      : "bg-white text-black"
                  }`}
                >
                  Educator
                </button>
              </div>

              <Form
                form={form}
                name="signup"
                onFinish={onInfoFinish}
                layout="vertical"
                className="w-full space-y-2"
              >
                <Form.Item
                  label={<span className="text-white font-medium">Full Name</span>}
                  name="fullName"
                  rules={[{ required: true, message: "Please input your full name!" }]}
                  className="mb-4"
                >
                  <Input
                    placeholder="Enter your full name"
                    className="h-12 bg-[#4C75B8] border-none text-white placeholder:text-blue-100 rounded-[15px] px-6"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-white font-medium">Email</span>}
                  name="email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                    { type: "email", message: "Please enter a valid email!" },
                  ]}
                  className="mb-4"
                >
                  <Input
                    placeholder="Enter your email"
                    className="h-12 bg-[#4C75B8] border-none text-white placeholder:text-blue-100 rounded-[15px] px-6"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-white font-medium">Phone Number</span>}
                  name="phoneNumber"
                  className="mb-4"
                >
                  <Input
                    placeholder="Enter your phone number"
                    className="h-12 bg-[#4C75B8] border-none text-white placeholder:text-blue-100 rounded-[15px] px-6"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-white font-medium">Gender</span>}
                  name="gender"
                  className="mb-4"
                >
                  <Select
                    placeholder="Select your gender"
                    className="h-12 w-full rounded-[15px] overflow-hidden"
                  >
                    <Option value="male">Male</Option>
                    <Option value="female">Female</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label={<span className="text-white font-medium">Password</span>}
                  name="password"
                  rules={[{ required: true, message: "Please input your password!" }]}
                  className="mb-4"
                >
                  <Input.Password
                    placeholder="Enter your password"
                    className="h-12 bg-[#4C75B8] border-none text-white placeholder:text-blue-100 rounded-[15px] px-6"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-white font-medium">Confirm Password</span>}
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: "Please confirm your password!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords do not match!'));
                      },
                    }),
                  ]}
                  className="mb-8"
                >
                  <Input.Password
                    placeholder="Re-enter your password"
                    className="h-12 bg-[#4C75B8] border-none text-white placeholder:text-blue-100 rounded-[15px] px-6"
                  />
                </Form.Item>

                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full h-12 bg-[#5EB7EB] hover:bg-[#4EA7DB]! border-none rounded-[15px] text-lg font-medium shadow-md mt-4"
                  >
                    Continue
                  </Button>
                </Form.Item>
              </Form>
            </>
          ) : (
            <div className="w-full space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              <Card 
                className={`rounded-[30px] cursor-pointer transition-all border-2 ${plan === 'free' ? 'border-blue-400 bg-blue-50/10' : 'border-transparent'}`}
                onClick={() => setPlan('free')}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800">Free Plan</h3>
                  {plan === 'free' && <CheckCircleFilled className="text-blue-500" />}
                </div>
                <p className="text-blue-200 text-xs mb-2">0 UGX / month</p>
                <ul className="text-[10px] text-blue-100 space-y-1">
                  <li>• 3,000 words per day</li>
                  <li>• Basic AI avatar</li>
                  <li>• Light ads</li>
                </ul>
              </Card>

              <Card 
                className={`rounded-[30px] cursor-pointer transition-all border-2 relative overflow-hidden ${plan === 'premium' ? 'border-purple-400 bg-purple-50/10' : 'border-transparent'}`}
                onClick={() => setPlan('premium')}
              >
                <Tag color="#FF3377" className="absolute top-2 right-2 rounded-full text-[8px] px-2 py-0 border-none font-bold">Popular</Tag>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800">Premium Plan</h3>
                  {plan === 'premium' && <CheckCircleFilled className="text-purple-500" />}
                </div>
                <p className="text-blue-200 text-xs mb-2">50,000 UGX / month</p>
                <ul className="text-[10px] text-blue-100 space-y-1">
                  <li>• Unlimited Translations</li>
                  <li>• No Ads</li>
                  <li>• Zoom/YouTube integration</li>
                </ul>
              </Card>

              <div className="pt-4 space-y-3">
                <Button
                  type="primary"
                  loading={loading}
                  onClick={onFinalSignup}
                  className="w-full h-12 bg-[#5EB7EB] hover:bg-[#4EA7DB]! border-none rounded-[15px] text-lg font-medium shadow-md"
                >
                  Complete Sign Up
                </Button>
                <Button
                  type="link"
                  onClick={() => setStep(1)}
                  className="w-full text-blue-200 hover:text-white"
                >
                  Back to info
                </Button>
              </div>
            </div>
          )}

          <div className="text-center mt-6">
            <span className="text-blue-100 text-sm">Already have an account? </span>
            <Link href="/login" className="text-white text-sm font-semibold hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </Content>

      <style jsx global>{`
        .ant-select-selector {
          background-color: #4C75B8 !important;
          border: none !important;
          height: 48px !important;
          border-radius: 15px !important;
          padding: 0 24px !important;
          display: flex;
          align-items: center;
        }
        .ant-select-selection-placeholder {
          color: #BFDBFE !important;
          line-height: 48px !important;
        }
        .ant-select-selection-item {
          color: white !important;
          line-height: 48px !important;
        }
        .ant-select-arrow {
          color: white !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
      `}</style>
    </Layout>
  );
}
