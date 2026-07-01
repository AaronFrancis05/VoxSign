"use client";

import React, { useState } from "react";
import { Switch } from "antd";
import {
  BellOutlined,
  CalendarOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  ProfileSettingsShell,
  SettingsRow,
  SettingsSection,
} from "@/components/profile/ProfileSettingsShell";

export default function NotificationsPage() {
  const [practiceReminders, setPracticeReminders] = useState(true);
  const [lessonUpdates, setLessonUpdates] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(false);

  return (
    <ProfileSettingsShell
      title="Notifications"
      subtitle="Choose the reminders and updates that matter to you."
    >
      <SettingsSection title="Alerts">
        <SettingsRow
          icon={<CalendarOutlined />}
          title="Practice Reminders"
          description="Stay on track with daily lesson prompts."
          end={
            <Switch checked={practiceReminders} onChange={setPracticeReminders} size="small" />
          }
        />
        <SettingsRow
          icon={<BellOutlined />}
          title="Lesson Updates"
          description="Get notified when new practice content is available."
          end={<Switch checked={lessonUpdates} onChange={setLessonUpdates} size="small" />}
        />
        <SettingsRow
          icon={<TrophyOutlined />}
          title="Achievement Alerts"
          description="Celebrate milestones and streak progress."
          end={
            <Switch checked={achievementAlerts} onChange={setAchievementAlerts} size="small" />
          }
        />
      </SettingsSection>
    </ProfileSettingsShell>
  );
}
