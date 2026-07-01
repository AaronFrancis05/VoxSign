"use client";

import React, { useState } from "react";
import { Switch } from "antd";
import {
  EyeOutlined,
  FontSizeOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SkinOutlined,
  SlidersOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import {
  ProfileSettingsShell,
  SettingsRow,
  SettingsSection,
} from "@/components/profile/ProfileSettingsShell";

export default function AccessibilityPage() {
  const [textSize, setTextSize] = useState("Medium");
  const [highContrast, setHighContrast] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showDescriptions, setShowDescriptions] = useState(true);
  const [easyNavigation, setEasyNavigation] = useState(true);

  return (
    <ProfileSettingsShell
      title="Accessibility Settings"
      subtitle="Customize VoxSign to make it easier and more comfortable for you."
    >
      <SettingsSection title="Display">
        <div className="px-2 pb-2 pt-1">
          <div className="rounded-[24px] px-4 py-4">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF5FF] text-lg text-[#1D5FD1]">
                <FontSizeOutlined />
              </div>
              <div>
                <p className="font-medium text-[#24344D]">Text Size</p>
                <p className="mt-1 text-sm text-[#8290A7]">
                  Choose the reading size that fits you best.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["Small", "Medium", "Large"].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setTextSize(size)}
                  className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                    textSize === size
                      ? "bg-gradient-to-r from-[#1FB6FF] to-[#2E6BFF] text-white shadow-sm"
                      : "bg-[#F3F7FC] text-[#6F7E95]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SettingsRow
          icon={<EyeOutlined />}
          title="High Contrast"
          description="Increase color contrast for better visibility."
          end={<Switch checked={highContrast} onChange={setHighContrast} size="small" />}
        />
        <SettingsRow
          icon={<SkinOutlined />}
          title="Color Blind Mode"
          description="Improve visibility for color blindness."
          end={
            <Switch checked={colorBlindMode} onChange={setColorBlindMode} size="small" />
          }
        />
        <SettingsRow
          icon={<PauseCircleOutlined />}
          title="Reduce Motion"
          description="Minimize animations and transitions across the app."
          end={<Switch checked={reduceMotion} onChange={setReduceMotion} size="small" />}
        />
      </SettingsSection>

      <SettingsSection title="Sign Language Preferences">
        <SettingsRow
          icon={<PlayCircleOutlined />}
          title="Play Videos Automatically"
          description="Start sign videos as soon as the lesson opens."
          end={<Switch checked={autoPlay} onChange={setAutoPlay} size="small" />}
        />
        <SettingsRow
          icon={<SoundOutlined />}
          title="Show Sign Descriptions"
          description="Display text descriptions alongside signs."
          end={
            <Switch checked={showDescriptions} onChange={setShowDescriptions} size="small" />
          }
        />
      </SettingsSection>

      <SettingsSection title="Interaction">
        <SettingsRow
          icon={<SlidersOutlined />}
          title="Easy Navigation"
          description="Simplify movement and focus across common actions."
          end={
            <Switch checked={easyNavigation} onChange={setEasyNavigation} size="small" />
          }
        />
      </SettingsSection>
    </ProfileSettingsShell>
  );
}
