"use client";

import React from "react";
import {
  PaperClipOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { ProfileSettingsShell } from "@/components/profile/ProfileSettingsShell";

const messages = [
  {
    from: "support",
    text: "Hi there! How can we help you today?",
    time: "10:30 AM",
  },
  {
    from: "user",
    text: "I am having trouble playing some sign videos.",
    time: "10:31 AM",
  },
  {
    from: "support",
    text: "Sorry to hear that. Can you tell us which sign you were trying to watch?",
    time: "10:31 AM",
  },
];

export default function SupportChatPage() {
  return (
    <ProfileSettingsShell
      title="Contact Support"
      subtitle="Chat with us"
      backHref="/profile/support"
    >
      <div className="rounded-[28px] border border-[#E7EEF8] bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3 rounded-[22px] bg-[#F6FAFF] px-4 py-4">
          <div className="h-3 w-3 rounded-full bg-[#22C55E]" />
          <div>
            <p className="font-medium text-[#24344D]">Support team</p>
            <p className="text-sm text-[#8290A7]">Online now</p>
          </div>
        </div>

        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={`${message.from}-${message.time}`}
              className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-[22px] px-4 py-3 shadow-sm ${
                  message.from === "user"
                    ? "bg-gradient-to-r from-[#1FB6FF] to-[#2E6BFF] text-white"
                    : "bg-[#F6FAFF] text-[#24344D]"
                }`}
              >
                <p className="text-sm leading-6">{message.text}</p>
                <p
                  className={`mt-2 text-right text-xs ${
                    message.from === "user" ? "text-blue-100" : "text-[#93A1B7]"
                  }`}
                >
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-full border border-[#E4ECF5] bg-white px-4 py-3 shadow-sm">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 bg-transparent text-sm text-[#24344D] outline-none placeholder:text-[#A1AEC0]"
        />
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F7FD] text-[#6F7E95]"
        >
          <PaperClipOutlined />
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#1FB6FF] to-[#2E6BFF] text-white shadow-sm"
        >
          <SendOutlined />
        </button>
      </div>
    </ProfileSettingsShell>
  );
}
