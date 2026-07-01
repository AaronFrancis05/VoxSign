"use client";

import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Input, Modal } from "antd";
import {
  AudioFilled,
  CameraFilled,
  ClockCircleOutlined,
  PlayCircleFilled,
  SearchOutlined,
  ThunderboltFilled,
} from "@ant-design/icons";

type SignCategory = "All" | "Greetings" | "Numbers" | "Emotions" | "Common";

type DemoSign = {
  id: number;
  word: string;
  category: Exclude<SignCategory, "All">;
  subtitle: string;
  meaning: string;
  cue: string;
  gesture: string;
  usageTip: string;
  related: string[];
};

const demoSigns: DemoSign[] = [
  {
    id: 1,
    word: "Hello",
    category: "Greetings",
    subtitle: "A general greeting",
    meaning: "A common greeting used any time to acknowledge someone.",
    cue: "Raise an open hand and hold it near the side of your face.",
    gesture: "👋",
    usageTip: "Works well in both formal and casual conversations.",
    related: ["Hi", "Good Morning", "How Are You?"],
  },
  {
    id: 2,
    word: "Thank You",
    category: "Greetings",
    subtitle: "Expression of gratitude",
    meaning: "Used to show appreciation after receiving help or kindness.",
    cue: "Touch your chin lightly and move your hand forward.",
    gesture: "🙏",
    usageTip: "Keep the movement smooth and clear rather than fast.",
    related: ["Please", "Excuse Me", "Goodbye"],
  },
  {
    id: 3,
    word: "Good Morning",
    category: "Greetings",
    subtitle: "Morning greeting",
    meaning: "Used to greet someone early in the day.",
    cue: "Start high and open the hand outward to suggest the morning sun.",
    gesture: "🌤️",
    usageTip: "Best used before midday in face-to-face greetings.",
    related: ["Hello", "How Are You?", "Nice to Meet You"],
  },
  {
    id: 4,
    word: "How Are You?",
    category: "Greetings",
    subtitle: "Asking about someone's well-being",
    meaning: "A friendly way to check in on another person.",
    cue: "Point gently outward, then curl the hand back into a question shape.",
    gesture: "🙂",
    usageTip: "Pair it with eye contact to make the question clear.",
    related: ["Hello", "Good Morning", "Thank You"],
  },
  {
    id: 5,
    word: "Water",
    category: "Common",
    subtitle: "A basic everyday word",
    meaning: "Used when asking for or referring to drinking water.",
    cue: "Bring your fingertips toward the mouth in a small repeated motion.",
    gesture: "💧",
    usageTip: "Useful in schools, clinics, and daily home conversation.",
    related: ["Please", "Food", "Eat"],
  },
  {
    id: 6,
    word: "Please",
    category: "Common",
    subtitle: "A polite request word",
    meaning: "Used to make a request sound respectful and considerate.",
    cue: "Place an open hand on the chest and move it in a small circle.",
    gesture: "✨",
    usageTip: "Use it before requests to soften the tone of the message.",
    related: ["Thank You", "Excuse Me", "Water"],
  },
  {
    id: 7,
    word: "1",
    category: "Numbers",
    subtitle: "One",
    meaning: "The number one.",
    cue: "Raise the index finger while the remaining fingers stay folded.",
    gesture: "1️⃣",
    usageTip: "Keep the hand upright so the finger shape is easy to read.",
    related: ["2", "3", "5"],
  },
  {
    id: 8,
    word: "5",
    category: "Numbers",
    subtitle: "Five",
    meaning: "The number five.",
    cue: "Open the hand with all five fingers spread outward.",
    gesture: "🖐️",
    usageTip: "Spread the fingers clearly so it does not resemble four.",
    related: ["4", "6", "10"],
  },
  {
    id: 9,
    word: "Happy",
    category: "Emotions",
    subtitle: "Positive emotion",
    meaning: "Used to express joy, excitement, or pleasure.",
    cue: "Brush both hands upward over the chest with a bright expression.",
    gesture: "😊",
    usageTip: "Facial expression matters a lot for emotion signs.",
    related: ["Love", "Excited", "Thank You"],
  },
];

const categories: SignCategory[] = [
  "All",
  "Greetings",
  "Numbers",
  "Common",
  "Emotions",
];

const quickCategories = [
  { label: "Greetings", icon: "👋" },
  { label: "Numbers", icon: "🔢" },
  { label: "Emotions", icon: "😊" },
];

const recentlySearched = ["Hello", "Water", "Thank You", "5"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SignCategory>("All");
  const [selectedSign, setSelectedSign] = useState<DemoSign>(demoSigns[0]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const filteredSigns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return demoSigns.filter((sign) => {
      const matchesCategory =
        activeCategory === "All" || sign.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        sign.word.toLowerCase().includes(normalizedQuery) ||
        sign.subtitle.toLowerCase().includes(normalizedQuery) ||
        sign.category.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  const handlePickSign = (sign: DemoSign) => {
    setSelectedSign(sign);
  };

  const handleOpenSign = (sign: DemoSign) => {
    handlePickSign(sign);
    setIsPreviewOpen(true);
  };

  const handleCategoryClick = (category: SignCategory) => {
    setActiveCategory(category);
  };

  const handleQuickWord = (word: string) => {
    setQuery(word);
    const match = demoSigns.find(
      (sign) => sign.word.toLowerCase() === word.toLowerCase(),
    );

    if (match) {
      setSelectedSign(match);
      setActiveCategory(match.category);
    }
  };

  const wordOfTheDay = demoSigns.find((sign) => sign.word === "Water") ?? demoSigns[0];

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-[540px] flex-col px-5 py-6 pb-24">
        <div className="rounded-[30px] bg-white p-2 shadow-[0_16px_40px_rgba(9,30,66,0.08)] ring-1 ring-[#EEF3FB]">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-3 rounded-[24px] px-4 py-2">
              <SearchOutlined className="text-lg text-[#9FB0C9]" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a word, phrase or sign..."
                variant="borderless"
                className="px-0 text-sm placeholder:text-[#B9C4D6]"
              />
            </div>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#53A4FF] to-[#196BFF] text-white shadow-md"
              aria-label="Voice search demo"
            >
              <AudioFilled />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F7FF] text-[#2E6BFF] ring-1 ring-[#DCE8FF]"
              aria-label="Camera search demo"
            >
              <CameraFilled />
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#5E7AB0]">
            Quick Categories
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {quickCategories.map((category) => (
              <button
                key={category.label}
                type="button"
                onClick={() => handleCategoryClick(category.label as SignCategory)}
                className={`flex min-w-fit items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition-all ${
                  activeCategory === category.label
                    ? "border-[#2E6BFF] bg-[#EAF3FF] text-[#1B57D6]"
                    : "border-[#EEF3FB] bg-white text-[#5F6F89]"
                }`}
              >
                <span className="text-base">{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[30px] bg-gradient-to-br from-[#FFF8EC] via-white to-[#FFF1D7] p-5 shadow-[0_14px_34px_rgba(255,169,64,0.12)] ring-1 ring-[#FDE6BB]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF8B1F] text-xl text-white shadow-lg shadow-orange-100">
              <ThunderboltFilled />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D97706]">
                Word Of The Day
              </p>
              <h2 className="mt-1 text-3xl font-bold text-[#10213F]">
                {wordOfTheDay.word}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#7A684C]">
                {wordOfTheDay.meaning}
              </p>
              <button
                type="button"
                onClick={() => handleOpenSign(wordOfTheDay)}
                className="mt-4 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-[#D97706] shadow-sm ring-1 ring-[#F5D7A0]"
              >
                View Sign
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#9AA8BE]">
            <ClockCircleOutlined className="text-xs" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">
              Recently Searched
            </span>
          </div>
          <span className="text-xs font-semibold text-[#2E6BFF]">
            {filteredSigns.length} results
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          {recentlySearched.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => handleQuickWord(term)}
              className="rounded-full bg-[#F4F8FF] px-4 py-2 text-sm font-medium text-[#4770C9] ring-1 ring-[#DFE9FF]"
            >
              {term}
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => {
            const count =
              category === "All"
                ? demoSigns.length
                : demoSigns.filter((sign) => sign.category === category).length;

            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryClick(category)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  activeCategory === category
                    ? "bg-gradient-to-r from-[#2E6BFF] to-[#46A0FF] text-white shadow-md"
                    : "bg-white text-[#667892] ring-1 ring-[#E7EDF7]"
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          {filteredSigns.length > 0 ? (
            filteredSigns.map((sign) => (
              <button
                key={sign.id}
                type="button"
                onClick={() => handleOpenSign(sign)}
                className={`overflow-hidden rounded-[24px] border bg-white text-left shadow-sm transition-all ${
                  selectedSign.id === sign.id
                    ? "border-[#2E6BFF] shadow-[0_18px_34px_rgba(46,107,255,0.14)]"
                    : "border-[#EEF3FB]"
                }`}
              >
                <div className="flex h-[130px] items-center justify-center bg-gradient-to-b from-[#F9FBFF] via-white to-[#F0F6FF]">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#EAF2FF] text-4xl shadow-inner">
                    {sign.gesture}
                  </div>
                </div>
                <div className="px-4 pb-4 pt-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-base font-bold text-[#1D2A44]">
                      {sign.word}
                    </h4>
                    <PlayCircleFilled className="mt-0.5 text-[#2E6BFF]" />
                  </div>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[#7F95BA]">
                    {sign.category}
                  </p>
                  <p className="mt-2 text-sm leading-5 text-[#667892]">
                    {sign.subtitle}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-2 rounded-[28px] border border-dashed border-[#D9E4F5] bg-white px-6 py-10 text-center">
              <p className="text-lg font-semibold text-[#29416E]">
                No demo signs found
              </p>
              <p className="mt-2 text-sm leading-6 text-[#8292AB]">
                Try searching for Hello, Water, Thank You, or a number like 5.
              </p>
            </div>
          )}
        </div>
      </div>
      <Modal
        open={isPreviewOpen}
        onCancel={() => setIsPreviewOpen(false)}
        footer={null}
        centered
        width={520}
        className="[&_.ant-modal-content]:overflow-hidden [&_.ant-modal-content]:rounded-[30px] [&_.ant-modal-content]:p-0 [&_.ant-modal-content]:shadow-[0_24px_60px_rgba(15,34,67,0.16)]"
      >
        <div className="bg-white p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3 pr-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#93A4BF]">
                Demo Sign Preview
              </p>
              <h3 className="mt-1 text-3xl font-bold text-[#14203A]">
                {selectedSign.word}
              </h3>
            </div>
            <span className="rounded-full bg-[#EEF5FF] px-3 py-1 text-xs font-semibold text-[#3471E8]">
              {selectedSign.category}
            </span>
          </div>

          <div className="rounded-[28px] bg-gradient-to-b from-[#FCFDFF] to-[#F3F7FF] p-4 ring-1 ring-[#E5EDFB]">
            <div className="flex min-h-[180px] items-center justify-center rounded-[24px] bg-white shadow-inner">
              <div className="text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] bg-[#EAF2FF] text-5xl">
                  {selectedSign.gesture}
                </div>
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#8AA0C8]">
                  Demo Pose
                </p>
                <p className="mx-auto mt-2 max-w-[260px] text-sm leading-6 text-[#5F7190]">
                  {selectedSign.cue}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-[#91A1BB]">
              Meaning
            </h4>
            <p className="mt-2 text-sm leading-7 text-[#33415C]">
              {selectedSign.meaning}
            </p>
          </div>

          <div className="mt-4 rounded-[22px] bg-[#F8FBFF] p-4 ring-1 ring-[#E6EEF9]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#97A7BF]">
              Usage Tip
            </p>
            <p className="mt-2 text-sm leading-6 text-[#4A5D7B]">
              {selectedSign.usageTip}
            </p>
          </div>

          <div className="mt-5">
            <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-[#91A1BB]">
              Related Signs
            </h4>
            <div className="mt-3 flex flex-wrap gap-3">
              {selectedSign.related.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleQuickWord(term)}
                  className="rounded-2xl bg-[#F4F8FF] px-4 py-2 text-sm font-semibold text-[#3569D5] ring-1 ring-[#DDE7FB]"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
