"use client";

import React from "react";
import { InboxOutlined } from "@ant-design/icons";
import { ProfileSettingsShell } from "@/components/profile/ProfileSettingsShell";

export default function SupportReportPage() {
  return (
    <ProfileSettingsShell
      title="Report a Problem"
      subtitle="Tell us what went wrong and we will do our best to fix it."
      backHref="/profile/support"
    >
      <div className="rounded-[28px] border border-[#E7EEF8] bg-white p-5 shadow-sm">
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#24344D]">
              What is the issue about?
            </label>
            <select className="w-full rounded-[20px] border border-[#E4ECF5] bg-[#FBFDFF] px-4 py-3 text-sm text-[#24344D] outline-none">
              <option>Select an option</option>
              <option>Playback problem</option>
              <option>Transcription issue</option>
              <option>Sign lesson issue</option>
              <option>Account issue</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#24344D]">
              Describe the issue
            </label>
            <textarea
              rows={6}
              placeholder="Please provide as much detail as possible..."
              className="w-full rounded-[20px] border border-[#E4ECF5] bg-[#FBFDFF] px-4 py-3 text-sm text-[#24344D] outline-none placeholder:text-[#A1AEC0]"
            />
            <p className="mt-2 text-right text-xs text-[#9AA6B9]">0/500</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#24344D]">
              Add Screenshot (Optional)
            </label>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-[22px] border border-dashed border-[#CFE1F4] bg-[#F8FBFF] px-4 py-4 text-left text-[#4A6C9A]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg text-[#1D5FD1] shadow-sm">
                <InboxOutlined />
              </div>
              <div>
                <p className="font-medium">Upload image</p>
                <p className="mt-1 text-sm text-[#8290A7]">
                  PNG, JPG, or screenshot from your device
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="w-full rounded-full bg-gradient-to-r from-[#1FB6FF] to-[#2E6BFF] py-4 font-semibold text-white shadow-lg shadow-blue-100"
      >
        Submit Report
      </button>
    </ProfileSettingsShell>
  );
}
