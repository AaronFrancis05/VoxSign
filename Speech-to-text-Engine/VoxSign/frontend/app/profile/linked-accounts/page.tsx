"use client";

import React from "react";
import {
  AppleOutlined,
  GoogleOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  ProfileSettingsShell,
  SettingsRow,
  SettingsSection,
} from "@/components/profile/ProfileSettingsShell";

export default function LinkedAccountsPage() {
  return (
    <ProfileSettingsShell
      title="Linked Accounts"
      subtitle="Manage the providers connected to your VoxSign account."
    >
      <SettingsSection title="Connected Providers">
        <SettingsRow
          icon={<GoogleOutlined />}
          title="Google"
          description="Connected for quick sign in."
          end={<span className="text-xs font-semibold text-[#1D5FD1]">Connected</span>}
        />
        <SettingsRow
          icon={<AppleOutlined />}
          title="Apple"
          description="Not linked yet."
          end={<span className="text-xs font-semibold text-[#9AA6B9]">Connect</span>}
        />
        <SettingsRow
          icon={<LockOutlined />}
          title="Password Login"
          description="Use your email and password as a backup sign in method."
          end={<span className="text-xs font-semibold text-[#1D5FD1]">Active</span>}
        />
      </SettingsSection>
    </ProfileSettingsShell>
  );
}
