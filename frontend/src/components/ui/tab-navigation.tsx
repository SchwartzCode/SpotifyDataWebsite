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
  activeTab?: string;
  setActiveTab?: (tabId: string) => void;
}

export const TabNavigation = ({ tabs, defaultTab, activeTab, setActiveTab }: TabNavigationProps) => {
  // Use the controlled activeTab if provided, otherwise use internal state
  const [internalActiveTab, setInternalActiveTab] = useState<string>(defaultTab || tabs[0]?.id || "");
  
  // Determine which active tab state to use
  const currentTab = activeTab !== undefined ? activeTab : internalActiveTab;
  
  // Function to handle tab change
  const handleTabChange = (tabId: string) => {
    if (setActiveTab) {
      // If external control is provided, use it
      setActiveTab(tabId);
    } else {
      // Otherwise use internal state
      setInternalActiveTab(tabId);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex border-b border-spotify-medium-gray">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 font-semibold transition-colors duration-200 
              ${
                currentTab === tab.id
                  ? "text-spotify-green border-b-2 border-spotify-green"
                  : "text-spotify-off-white hover:text-spotify-green"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.find((tab) => tab.id === currentTab)?.content}
      </div>
    </div>
  );
};