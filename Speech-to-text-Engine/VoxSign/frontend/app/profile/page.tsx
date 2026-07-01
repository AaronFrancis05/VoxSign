"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, Input, Switch } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  defaultSimulationSettings,
  readSimulationSettings,
  VOXSIGN_SIMULATION_EMAIL,
  writeSimulationSettings,
} from "@/lib/simulationSettings";
import {
  AudioOutlined,
  BellOutlined,
  BookOutlined,
  BulbOutlined,
  LinkOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  RightOutlined,
  SettingOutlined,
  ThunderboltFilled,
} from "@ant-design/icons";

const profileItems = [
  {
    icon: <LinkOutlined />,
    label: "Linked Accounts",
    description: "Manage connected providers and sign-in methods.",
    path: "/profile/linked-accounts",
  },
  {
    icon: <BellOutlined />,
    label: "Notifications",
    description: "Choose reminders and alerts you want to receive.",
    path: "/profile/notifications",
  },
  {
    icon: <SettingOutlined />,
    label: "Accessibility Settings",
    description: "Adjust text, motion, contrast, and signing preferences.",
    path: "/profile/accessibility",
  },
  {
    icon: <QuestionCircleOutlined />,
    label: "Help & Tutorials",
    description: "Browse guides and onboarding videos for VoxSign.",
    path: "/profile/help",
  },
  {
    icon: <MessageOutlined />,
    label: "Contact Support",
    description: "Chat, report a problem, or view frequently asked questions.",
    path: "/profile/support",
  },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [themeEnabled, setThemeEnabled] = useState(true);
  const [simulationSettings, setSimulationSettings] = useState(
    defaultSimulationSettings,
  );
  const [hasLoadedSimulationSettings, setHasLoadedSimulationSettings] =
    useState(false);
  const isSimulationUser = user?.email === VOXSIGN_SIMULATION_EMAIL;

  useEffect(() => {
    if (!isSimulationUser) {
      setHasLoadedSimulationSettings(false);
      return;
    }

    setSimulationSettings(readSimulationSettings());
    setHasLoadedSimulationSettings(true);
  }, [isSimulationUser]);

  useEffect(() => {
    if (!isSimulationUser || !hasLoadedSimulationSettings) return;

    writeSimulationSettings(simulationSettings);
  }, [hasLoadedSimulationSettings, isSimulationUser, simulationSettings]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[560px] px-5 py-6 pb-24 md:px-6">
        <div className="rounded-[34px] bg-gradient-to-r from-[#123D80] to-[#1F58B8] p-6 text-white shadow-lg shadow-blue-100/70">
          <div className="flex items-center gap-4">
            <Avatar
              size={84}
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Sandra"}`
              }
              className="border-2 border-white/80 shadow-md"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                VoxSign Profile
              </p>
              <h1 className="mt-1 text-2xl font-semibold">
                {user?.name || "Naikambo Sandra"}
              </h1>
              <p className="mt-1 text-sm text-blue-100">
                Student learner with active practice streak
              </p>
              <button
                type="button"
                className="mt-3 rounded-full bg-white/14 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-white transition hover:bg-white/20"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-[24px] border border-[#E6EEF8] bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-[#1D5FD1]">42</p>
            <p className="mt-1 text-xs text-[#8D9AB0]">Lessons learned</p>
          </div>
          <div className="rounded-[24px] border border-[#E6EEF8] bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-[#1D5FD1]">195</p>
            <p className="mt-1 text-xs text-[#8D9AB0]">Words signed today</p>
          </div>
          <div className="rounded-[24px] border border-[#E6EEF8] bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-[#1D5FD1]">18</p>
            <p className="mt-1 text-xs text-[#8D9AB0]">Favorite signs</p>
          </div>
        </div>

        <div className="mt-6 rounded-[30px] border border-[#E6EEF8] bg-white p-2 shadow-sm">
          <button
            type="button"
            onClick={() => router.push("/plans")}
            className="flex w-full items-center gap-4 rounded-[24px] bg-gradient-to-r from-[#FFF5E9] to-[#FFF9F2] px-4 py-4 text-left transition hover:brightness-[0.99]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg text-[#F59E0B] shadow-sm">
              <ThunderboltFilled />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[#24344D]">My Plan: Free</p>
              <p className="mt-1 text-sm text-[#8A97AE]">
                Upgrade for expanded lessons and advanced tools.
              </p>
            </div>
            <RightOutlined className="text-[#C7A45F]" />
          </button>
        </div>

        <div className="mt-5 rounded-[30px] border border-[#E6EEF8] bg-white p-2 shadow-sm">
          {profileItems.map((item, index) => (
            <button
              key={item.label}
              type="button"
              onClick={() => router.push(item.path)}
              className={`flex w-full items-center gap-4 rounded-[24px] px-4 py-4 text-left transition hover:bg-[#F6FAFF] ${
                index > 0 ? "mt-1" : ""
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF5FF] text-lg text-[#1D5FD1]">
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[#24344D]">{item.label}</p>
                <p className="mt-1 text-sm leading-5 text-[#8290A7]">
                  {item.description}
                </p>
              </div>
              <RightOutlined className="text-[#A9B6C9]" />
            </button>
          ))}

          <div className="mt-1 flex items-center gap-4 rounded-[24px] px-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF5FF] text-lg text-[#1D5FD1]">
              <BulbOutlined />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[#24344D]">Theme: Light</p>
              <p className="mt-1 text-sm text-[#8290A7]">
                Light mode is active to match the current app look.
              </p>
            </div>
            <Switch
              checked={themeEnabled}
              onChange={setThemeEnabled}
              size="small"
            />
          </div>

          <div className="mt-1 flex items-center gap-4 rounded-[24px] px-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF5FF] text-lg text-[#1D5FD1]">
              <BookOutlined />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[#24344D]">
                Saved Signs / Favorite
              </p>
              <p className="mt-1 text-sm text-[#8290A7]">
                Keep important signs close while your library grows.
              </p>
            </div>
            <span className="rounded-full bg-[#EDF6FF] px-3 py-1 text-xs font-semibold text-[#1D5FD1]">
              Soon
            </span>
          </div>

          {isSimulationUser ? (
            <div className="mt-1 rounded-[24px] p-2">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E7F0FF] text-lg text-[#1D5FD1]">
                  <AudioOutlined />
                </div>
                {/* <div className="flex-1">
                  <p className="font-medium text-[#24344D]">
                    Transcription Simulation
                  </p>
                  <p className="mt-1 text-sm text-[#8290A7]">
                    Use simulated sentence streaming instead of live microphone
                    upload.
                  </p>
                </div> */}
                <Switch
                  checked={simulationSettings.showSettings}
                  onChange={(checked) =>
                    setSimulationSettings((prev) => ({
                      ...prev,
                      showSettings: checked,
                    }))
                  }
                />
              </div>

              {simulationSettings.showSettings ? (
                <div className="mt-4">
                  <div className="flex items-center justify-between gap-4 rounded-[20px] bg-white px-4 py-3 ring-1 ring-[#E8F0FB]">
                    <div>
                      <p className="font-medium text-[#24344D]">
                        Simulation Mode
                      </p>
                      <p className="mt-1 text-sm text-[#8290A7]">
                        Switch between saved transcript simulation and live
                        microphone capture.
                      </p>
                    </div>
                    <Switch
                      checked={simulationSettings.simulate}
                      onChange={(checked) =>
                        setSimulationSettings((prev) => ({
                          ...prev,
                          simulate: checked,
                        }))
                      }
                      checkedChildren="Sim"
                      unCheckedChildren="Live"
                    />
                  </div>

                  {simulationSettings.simulate ? (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#6D84AD]">
                        Sentence To Simulate
                      </p>
                      <Input.TextArea
                        value={simulationSettings.sentence}
                        onChange={(event) =>
                          setSimulationSettings((prev) => ({
                            ...prev,
                            sentence: event.target.value,
                          }))
                        }
                        placeholder="Enter the sentence that should stream into the transcript."
                        autoSize={{ minRows: 3, maxRows: 6 }}
                        className="rounded-2xl"
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full rounded-full border border-[#F4C8C8] bg-white py-4 font-semibold text-[#D95050] shadow-sm transition hover:bg-[#FFF6F6]"
        >
          Log Out
        </button>
      </div>
    </DashboardLayout>
  );
}
