"use client";

import React, { useState } from "react";
import {
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import {
  ProfileSettingsShell,
  SearchField,
} from "@/components/profile/ProfileSettingsShell";

const faqItems = [
  {
    title: "Getting Started",
    description: "Learn the basics of VoxSign and set up your account.",
  },
  {
    title: "Account & Profile",
    description: "Manage profile details, sign in methods, and account settings.",
  },
  {
    title: "Learning & Practice",
    description: "Practice lessons, save favorites, and improve your signing routine.",
  },
  {
    title: "Premium & Billing",
    description: "Subscription details, plan access, and payment support.",
  },
  {
    title: "Troubleshooting",
    description: "Fix common issues with playback, recordings, or navigation.",
  },
];

export default function SupportFaqPage() {
  const [openItem, setOpenItem] = useState("Getting Started");

  return (
    <ProfileSettingsShell
      title="FAQ"
      subtitle="Quick answers to the most common VoxSign questions."
      backHref="/profile/support"
    >
      <SearchField placeholder="Search FAQs..." />

      <div className="rounded-[28px] border border-[#E7EEF8] bg-white p-2 shadow-sm">
        {faqItems.map((item, index) => {
          const isOpen = item.title === openItem;

          return (
            <button
              key={item.title}
              type="button"
              onClick={() => setOpenItem(isOpen ? "" : item.title)}
              className={`block w-full rounded-[22px] px-4 py-4 text-left transition hover:bg-[#F6FAFF] ${
                index > 0 ? "mt-1" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-[#24344D]">{item.title}</p>
                <span className="text-[#A9B6C9]">
                  {isOpen ? <UpOutlined /> : <DownOutlined />}
                </span>
              </div>
              <p className="mt-2 text-sm leading-5 text-[#8290A7]">{item.description}</p>
              {isOpen ? (
                <div className="mt-3 rounded-[18px] bg-[#F7FBFF] px-4 py-3 text-sm leading-6 text-[#5A6A85]">
                  Visit this section to find guides, support resources, and short
                  walkthroughs that address the topic.
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="rounded-[28px] border border-[#E7EEF8] bg-white px-5 py-6 text-center shadow-sm">
        <p className="font-medium text-[#24344D]">Can&apos;t find what you&apos;re looking for?</p>
        <p className="mt-2 text-sm text-[#8290A7]">Contact our support team for direct help.</p>
        <a
          href="/profile/support"
          className="mt-4 inline-flex rounded-full bg-[#EDF6FF] px-5 py-3 text-sm font-semibold text-[#1D5FD1]"
        >
          Contact Support
        </a>
      </div>
    </ProfileSettingsShell>
  );
}
