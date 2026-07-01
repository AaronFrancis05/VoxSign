"use client";

import React from "react";
import {
  AlertOutlined,
  BulbOutlined,
  CustomerServiceOutlined,
  MailOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import {
  ProfileSettingsShell,
  SettingsRow,
  SettingsSection,
} from "@/components/profile/ProfileSettingsShell";

export default function SupportPage() {
  const router = useRouter();

  return (
    <ProfileSettingsShell
      title="Contact Support"
      subtitle="Reach out to us anytime for help, troubleshooting, or feedback."
    >
      <SettingsSection title="Support Options">
        <SettingsRow
          icon={<MessageOutlined />}
          title="Chat with Us"
          description="Get direct help from our support team."
          onClick={() => router.push("/profile/support/chat")}
        />
        <SettingsRow
          icon={<MailOutlined />}
          title="Email Support"
          description="Send us an email and we will respond as soon as possible."
          href="mailto:support@voxsign.app"
        />
        <SettingsRow
          icon={<AlertOutlined />}
          title="Report a Problem"
          description="Let us know if something is not working correctly."
          onClick={() => router.push("/profile/support/report")}
        />
        <SettingsRow
          icon={<BulbOutlined />}
          title="Suggest a Feature"
          description="Share ideas to help improve VoxSign."
          href="mailto:feedback@voxsign.app?subject=VoxSign%20Feature%20Suggestion"
        />
      </SettingsSection>

      <SettingsSection title="Self Service">
        <SettingsRow
          icon={<QuestionCircleOutlined />}
          title="FAQ"
          description="View frequently asked questions and quick answers."
          onClick={() => router.push("/profile/support/faq")}
        />
        <SettingsRow
          icon={<CustomerServiceOutlined />}
          title="Support Hours"
          description="Our team is typically available Monday to Friday, 8 AM to 8 PM."
          end={<span className="text-xs font-semibold text-[#1D5FD1]">Available</span>}
        />
      </SettingsSection>
    </ProfileSettingsShell>
  );
}
