"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ArrowLeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

export function ProfileSettingsShell({
  title,
  subtitle,
  children,
  backHref = "/profile",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  backHref?: string;
}) {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[560px] px-5 py-6 pb-24 md:px-6">
        <div className="mb-5 rounded-[30px] bg-gradient-to-r from-[#123D80] to-[#1F58B8] px-5 py-5 text-white shadow-lg shadow-blue-100/60">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(backHref)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/14 transition hover:bg-white/20"
              aria-label={`Back to ${backHref}`}
            >
              <ArrowLeftOutlined />
            </button>
            <div>
              <h1 className="text-xl font-semibold">{title}</h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-blue-100">{subtitle}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-4">{children}</div>
      </div>
    </DashboardLayout>
  );
}

export function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-[0.16em] text-[#6A7D9B]">
        {title}
      </h2>
      <div className="rounded-[26px] border border-[#E7EEF8] bg-white p-2 shadow-sm">
        {children}
      </div>
    </section>
  );
}

export function SettingsRow({
  icon,
  title,
  description,
  end,
  onClick,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  end?: React.ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-4 rounded-[22px] px-4 py-4 transition hover:bg-[#F6FAFF]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF5FF] text-lg text-[#1D5FD1]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[#24344D]">{title}</p>
        {description ? (
          <p className="mt-1 text-sm leading-5 text-[#8290A7]">{description}</p>
        ) : null}
      </div>
      <div className="shrink-0 text-[#A9B6C9]">{end || <RightOutlined />}</div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left">
        {content}
      </button>
    );
  }

  return content;
}

export function SearchField({ placeholder }: { placeholder: string }) {
  return (
    <div className="rounded-full border border-[#E4ECF5] bg-white px-4 py-3 shadow-sm">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-[#24344D] outline-none placeholder:text-[#A1AEC0]"
      />
    </div>
  );
}
