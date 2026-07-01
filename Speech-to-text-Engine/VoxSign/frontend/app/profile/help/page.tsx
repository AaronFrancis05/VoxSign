"use client";

import React, { useState } from "react";
import {
  AppstoreOutlined,
  BookOutlined,
  PlayCircleOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import {
  ProfileSettingsShell,
  SearchField,
} from "@/components/profile/ProfileSettingsShell";

const categories = ["All", "Getting Started", "How to Sign", "Features"];

const tutorials = [
  {
    group: "Getting Started",
    title: "Welcome to VoxSign",
    description: "Overview of the app and its core purpose.",
    duration: "1:20",
  },
  {
    group: "Getting Started",
    title: "Create Your Profile",
    description: "Set up your profile in a few steps.",
    duration: "1:45",
  },
  {
    group: "Features",
    title: "Navigate the App",
    description: "Learn your way around VoxSign.",
    duration: "2:10",
  },
  {
    group: "How to Sign",
    title: "Basic Greetings",
    description: "Learn common greeting signs.",
    duration: "3:05",
  },
  {
    group: "How to Sign",
    title: "Numbers 1-10",
    description: "Learn number signs in sign language.",
    duration: "4:12",
  },
];

const categoriesGrid = [
  {
    title: "Getting Started",
    description: "Learn the basics of VoxSign.",
    icon: <PlayCircleOutlined />,
  },
  {
    title: "How to Sign",
    description: "Learn how to sign words clearly.",
    icon: <ReadOutlined />,
  },
  {
    title: "Features Guide",
    description: "Explore app tools and workflows.",
    icon: <AppstoreOutlined />,
  },
  {
    title: "Tips & Best Practices",
    description: "Improve your learning routine.",
    icon: <BookOutlined />,
  },
];

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTutorials =
    activeCategory === "All"
      ? tutorials
      : tutorials.filter((item) => item.group === activeCategory);

  return (
    <ProfileSettingsShell
      title="Help & Tutorials"
      subtitle="Find walkthroughs, onboarding help, and short guides."
    >
      <SearchField placeholder="Search tutorials or help topics..." />

      <div className="grid grid-cols-2 gap-3">
        {categoriesGrid.map((item) => (
          <div
            key={item.title}
            className="rounded-[24px] border border-[#E7EEF8] bg-white p-4 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF5FF] text-lg text-[#1D5FD1]">
              {item.icon}
            </div>
            <p className="mt-4 font-medium text-[#24344D]">{item.title}</p>
            <p className="mt-1 text-sm leading-5 text-[#8290A7]">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeCategory === category
                ? "bg-gradient-to-r from-[#1FB6FF] to-[#2E6BFF] text-white shadow-sm"
                : "bg-white text-[#6F7E95] ring-1 ring-[#E4ECF5]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="rounded-[28px] border border-[#E7EEF8] bg-white p-2 shadow-sm">
        {filteredTutorials.map((tutorial, index) => (
          <div
            key={tutorial.title}
            className={`flex items-center gap-4 rounded-[22px] px-4 py-4 ${
              index > 0 ? "mt-1" : ""
            }`}
          >
            <div className="flex h-16 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D7EBFF] to-[#F4F9FF] text-2xl text-[#1D5FD1]">
              <PlayCircleOutlined />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[#24344D]">{tutorial.title}</p>
              <p className="mt-1 text-sm leading-5 text-[#8290A7]">
                {tutorial.description}
              </p>
            </div>
            <span className="text-sm font-medium text-[#7B89A1]">{tutorial.duration}</span>
          </div>
        ))}
      </div>
    </ProfileSettingsShell>
  );
}
