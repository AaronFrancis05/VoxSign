"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button, Card, Tag } from "antd";
import {
  CheckCircleFilled,
  ThunderboltFilled,
  MinusCircleFilled,
  GlobalOutlined,
  BookOutlined,
} from "@ant-design/icons";

export default function PlansPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[500px] mx-auto px-6 py-10 pb-20">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-[#7033FF] h-14 w-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
             <ThunderboltFilled className="text-2xl text-white" />
          </div>
          <h2 className="text-[#1546A0] text-2xl font-bold mb-2">Choose Your Plan.</h2>
          <p className="text-gray-400 text-sm">Access sign language support your way.</p>
        </div>

        {/* Free Plan Card */}
        <Card className="rounded-[40px] shadow-sm border-gray-100 mb-6 p-2">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800">Free Plan</h3>
            <p className="text-gray-400 text-sm mb-4">Perfect for getting started</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-800">0 UGX</span>
              <span className="text-gray-400 text-sm">/ month</span>
            </div>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <CheckCircleFilled className="text-[#7033FF] mt-1" />
              <span className="text-gray-600 text-sm">Translate up to 3,000 words per day.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleFilled className="text-blue-400 mt-1" />
              <span className="text-gray-600 text-sm">Basic AI signing avatar</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleFilled className="text-blue-300 mt-1" />
              <span className="text-gray-600 text-sm">Limited integration support</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleFilled className="text-purple-300 mt-1" />
              <span className="text-gray-600 text-sm">Light ads</span>
            </li>
          </ul>

          <Button className="w-full h-12 rounded-full border-gray-200 text-gray-800 font-bold text-sm">
            Continue Free Plan
          </Button>
        </Card>

        {/* Premium Plan Card */}
        <Card className="rounded-[40px] shadow-xl border-none bg-gradient-to-br from-[#F5F7FF] to-[#EBEFFF] p-2 relative overflow-hidden">
          <div className="absolute top-6 right-6">
            <Tag color="#FF3377" className="rounded-full px-4 py-1 border-none font-bold">Most Popular</Tag>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800">Premium Plan</h3>
            <p className="text-gray-400 text-sm mb-4">Perfect for getting started</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-800">50,000 UGX</span>
              <span className="text-gray-400 text-sm">/ month</span>
            </div>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <div className="bg-blue-500 rounded-lg p-1 flex items-center justify-center">
                <ThunderboltFilled className="text-white text-xs" />
              </div>
              <span className="text-gray-600 text-sm font-medium">Unlimited Translations</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-blue-400 rounded-lg p-1 flex items-center justify-center">
                <MinusCircleFilled className="text-white text-xs" />
              </div>
              <span className="text-gray-600 text-sm font-medium">No Ads</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-blue-300 rounded-lg p-1 flex items-center justify-center">
                <GlobalOutlined className="text-white text-xs" />
              </div>
              <span className="text-gray-600 text-sm font-medium leading-tight">Integrate with Zoom, YouTube, and Google Classroom</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-blue-200 rounded-lg p-1 flex items-center justify-center">
                <BookOutlined className="text-white text-xs" />
              </div>
              <span className="text-gray-600 text-sm font-medium">Learning tool</span>
            </li>
          </ul>

          <Button type="primary" className="w-full h-12 rounded-full bg-[#7033FF] border-none font-bold text-sm shadow-lg shadow-purple-200">
            Get Started
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
}
