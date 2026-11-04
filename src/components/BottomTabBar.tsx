import React from 'react';
import { Gauge, Disc, BookOpen, Bookmark, Wrench } from 'lucide-react';
import { haptics } from '../utils/haptics';

export type AppTab = 'turning' | 'tools' | 'drilling' | 'formulas' | 'saved';

interface BottomTabBarProps {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  savedCount: number;
  toolCount: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onChangeTab,
  savedCount,
  toolCount,
}) => {
  const tabs = [
    {
      id: 'turning' as AppTab,
      label: 'Drehen',
      icon: Gauge,
    },
    {
      id: 'tools' as AppTab,
      label: 'Werkzeuge',
      icon: Wrench,
      badge: toolCount > 0 ? toolCount : undefined,
    },
    {
      id: 'drilling' as AppTab,
      label: 'Bohren',
      icon: Disc,
    },
    {
      id: 'formulas' as AppTab,
      label: 'Tabellen',
      icon: BookOpen,
    },
    {
      id: 'saved' as AppTab,
      label: 'Merkzettel',
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : undefined,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-safe transition-colors">
      <div className="max-w-lg mx-auto grid grid-cols-5 items-center h-16 px-1">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          const Icon = t.icon;

          return (
            <button
              key={t.id}
              onClick={() => {
                haptics.tick();
                onChangeTab(t.id);
              }}
              className={`min-h-[44px] flex flex-col items-center justify-center relative cursor-pointer transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                />
                {t.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center px-1">
                    {t.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
