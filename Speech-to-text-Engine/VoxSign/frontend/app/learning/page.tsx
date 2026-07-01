"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Input, Upload, Button, Card } from "antd";
import { LinkOutlined, UploadOutlined, CheckCircleFilled } from "@ant-design/icons";

export default function LearningPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[500px] mx-auto px-6 py-10">
        <h2 className="text-[#1546A0] text-2xl font-bold text-center mb-2">
          Start a Learning Session
        </h2>
        <p className="text-gray-500 text-center mb-10 px-4">
          Upload a video or paste a link to learn with sign support.
        </p>

        {/* Link Input Card */}
        <Card className="rounded-[30px] shadow-sm border-gray-100 mb-8 overflow-hidden">
          <h3 className="text-[#1546A0] font-semibold mb-4 text-lg">
            Paste YouTube Link or Zoom Meeting Link.
          </h3>
          <div className="bg-gray-50 rounded-full px-6 py-1 flex items-center border border-gray-100">
            <Input
              placeholder="https://youtube.com/watch?v=..."
              className="bg-transparent border-none shadow-none focus:ring-0 placeholder:text-gray-400"
            />
            <LinkOutlined className="text-[#7033FF] text-xl" />
          </div>
        </Card>

        <div className="flex items-center gap-4 mb-8 text-gray-400 font-medium">
          <div className="flex-1 border-t border-gray-200"></div>
          OR
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Upload Card */}
        <div className="border-2 border-dashed border-blue-200 rounded-[30px] p-10 flex flex-col items-center bg-white mb-8">
          <div className="bg-[#E0E7FF] h-14 w-14 rounded-2xl flex items-center justify-center mb-4">
            <UploadOutlined className="text-2xl text-[#7033FF]" />
          </div>
          <h3 className="text-[#1546A0] font-semibold text-lg mb-1">
            Upload Video from Device
          </h3>
          <p className="text-gray-400 text-sm mb-6">Drag & drop or click to browse</p>
          <Upload showUploadList={false}>
            <Button className="rounded-full bg-gray-200 border-none px-8 font-semibold text-gray-600 h-10">
              Browse files
            </Button>
          </Upload>
        </div>

        {/* Status Card */}
        <div className="bg-gradient-to-r from-[#7033FF] to-[#5123C0] rounded-[20px] p-6 flex items-center gap-4 text-white shadow-lg mb-4">
          <div className="bg-white/20 h-14 w-14 rounded-full flex items-center justify-center flex-shrink-0">
             <span className="text-3xl">👋</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircleFilled className="text-blue-300" />
              <p className="font-semibold">Your signing assistant is ready!</p>
            </div>
            <p className="text-white/80 text-sm">AI avatar will translate in real-time</p>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-4">
          ✓ Supported: YouTube, Zoom, MP4, Classroom recordings<br/>
          ✓ Works best with clear audio
        </p>
      </div>
    </DashboardLayout>
  );
}
