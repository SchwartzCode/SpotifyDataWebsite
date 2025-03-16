// src/components/ui/tab-navigation.tsx

import { ReactNode, useState } from "react";

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabNavigationProps {
  tabs: TabItem[];
  defaultTab?: string;
}

export const TabNavigation = ({ tabs, defaultTab }: TabNavigationProps) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || tabs[0]?.id || "");

  return (
    <div className="flex flex-col w-full">
      <div className="flex border-b border-spotify-medium-gray">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-semibold transition-colors duration-200 
              ${
                activeTab === tab.id
                  ? "text-spotify-green border-b-2 border-spotify-green"
                  : "text-spotify-off-white hover:text-spotify-green"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};