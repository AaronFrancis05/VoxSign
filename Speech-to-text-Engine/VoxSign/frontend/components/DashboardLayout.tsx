"use client";

import React, { useState } from "react";
import { Layout, Button, Badge, Drawer } from "antd";
import {
  BellOutlined,
  QuestionCircleOutlined,
  HomeOutlined,
  SearchOutlined,
  AudioOutlined,
  BookOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";

const { Header, Content, Footer } = Layout;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const navItems = [
    { label: "Home", icon: <HomeOutlined />, path: "/dashboard" },
    { label: "Search", icon: <SearchOutlined />, path: "/search" },
    { label: "Learning", icon: <BookOutlined />, path: "/learning" },
    { label: "Profile", icon: <UserOutlined />, path: "/profile" },
  ];

  const handleNavClick = (path: string) => {
    router.push(path);
    setIsDrawerVisible(false);
  };

  return (
    <Layout className="min-h-screen bg-[#F8F9FA]">
      {/* Mobile Drawer */}
      <Drawer
        title={
          <span className="text-xl font-bold text-[#1546A0]">VoxSign.</span>
        }
        placement="left"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        size="default"
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex flex-col py-4">
          {navItems.map((item) => (
            <Button
              key={item.path}
              type="text"
              icon={item.icon}
              className={`flex items-center gap-4 h-14 px-6 text-lg justify-start rounded-none ${
                pathname === item.path
                  ? "text-[#1546A0] bg-blue-50 border-r-4 border-[#1546A0]"
                  : "text-gray-600"
              }`}
              onClick={() => handleNavClick(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </Drawer>

      {/* Top Header */}
      <Header className="!text-blue-500 border-b border-white/10 px-6 flex items-center justify-between h-16 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <h1
            className="text-2xl font-bold text-white m-0 cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            VoxSign.
          </h1>
        </div>

        {/* Desktop Navigation Links - Centered */}
        <nav className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              type="text"
              icon={React.cloneElement(item.icon as React.ReactElement, {
                // @ts-ignore
                className: "!text-white",
              })}
              className={`flex items-center gap-2 font-medium !text-white hover:!bg-white/10 px-4 h-10 ${
                pathname === item.path ? "bg-white/20" : "opacity-80"
              }`}
              onClick={() => handleNavClick(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Badge dot>
            <BellOutlined className="text-xl !text-white cursor-pointer" />
          </Badge>
          <QuestionCircleOutlined className="text-xl !text-white cursor-pointer" />
        </div>
      </Header>

      {/* Main Content */}
      <Content className="pb-24 md:pb-8">{children}</Content>

      {/* Bottom Navigation */}
      <Footer className="fixed bottom-0 left-0 right-0 !p-0 bg-white border-t border-gray-200 z-50 md:hidden h-24">
        <div className="flex justify-around items-end h-full pb-2">
          {/* Home */}
          <button
            className="flex flex-col items-center gap-1 flex-1 mb-2"
            onClick={() => router.push("/dashboard")}
          >
            <HomeOutlined
              style={{
                fontSize: "24px",
                color: pathname === "/dashboard" ? "#1546A0" : "#9CA3AF",
              }}
            />
            <span
              className={`text-[12px] font-medium ${pathname === "/dashboard" ? "text-[#1546A0]" : "text-[#9CA3AF]"}`}
            >
              Home
            </span>
          </button>

          {/* Search */}
          <button
            className="flex flex-col items-center gap-1 flex-1 mb-2"
            onClick={() => router.push("/search")}
          >
            <SearchOutlined
              style={{
                fontSize: "24px",
                color: pathname === "/search" ? "#1546A0" : "#9CA3AF",
              }}
            />
            <span
              className={`text-[12px] font-medium ${pathname === "/search" ? "text-[#1546A0]" : "text-[#9CA3AF]"}`}
            >
              Search
            </span>
          </button>

          {/* Record */}
          <div className="flex-1 flex flex-col items-center ">
            <div
              // className="bg-[#EBF5FF] p-3 rounded-[24px] flex flex-col items-center gap-1 min-w-[80px]"
              className="flex flex-col items-center gap-1 min-w-[80px]"
            >
              <button
                className="bg-gradient-to-b from-[#4A90FF] to-[#0047FF] h-14 w-14 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
                onClick={() => router.push("/dashboard")}
              >
                <div className="text-white flex items-center justify-center">
                  <AudioOutlined style={{ fontSize: "24px", color: "white" }} />
                </div>
              </button>
              <span className="text-[#3B82F6] text-[12px] font-bold">
                Record
              </span>
            </div>
          </div>

          {/* Learn */}
          <button
            className="flex flex-col items-center gap-1 flex-1 mb-2"
            onClick={() => router.push("/learning")}
          >
            <BookOutlined
              style={{
                fontSize: "24px",
                color: pathname === "/learning" ? "#1546A0" : "#9CA3AF",
              }}
            />
            <span
              className={`text-[12px] font-medium ${pathname === "/learning" ? "text-[#1546A0]" : "text-[#9CA3AF]"}`}
            >
              Learn
            </span>
          </button>

          {/* Profile */}
          <button
            className="flex flex-col items-center gap-1 flex-1 mb-2"
            onClick={() => router.push("/profile")}
          >
            <UserOutlined
              style={{
                fontSize: "24px",
                color: pathname === "/profile" ? "#1546A0" : "#9CA3AF",
              }}
            />
            <span
              className={`text-[12px] font-medium ${pathname === "/profile" ? "text-[#1546A0]" : "text-[#9CA3AF]"}`}
            >
              Profile
            </span>
          </button>
        </div>
      </Footer>
    </Layout>
  );
}
