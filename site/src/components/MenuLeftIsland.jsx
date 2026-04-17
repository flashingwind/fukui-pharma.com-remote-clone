import React, { useState } from "react";
import "../styles/MenuLeft.css";

// flowersサブディレクトリの年度マッピング
const FLOWER_YEAR = { '2004': '2004年', '2006': '2006年', '2007': '2007年' };

function groupBySubdir(pages) {
  const groups = {};
  for (const p of pages) {
    const parts = p.id.split('/');
    const subdir = parts.length > 1 ? parts[0] : '';
    if (!groups[subdir]) groups[subdir] = [];
    groups[subdir].push(p);
  }
  return groups;
}

export const MenuLeftIsland = ({ currentSlug = "", currentSection = "", allPages = [] }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const byCollection = {};
  for (const p of allPages) {
    if (!byCollection[p.collection]) byCollection[p.collection] = [];
    byCollection[p.collection].push(p);
  }

  const [openSection, setOpenSection] = useState(currentSection);
  const [openFlowerSub, setOpenFlowerSub] = useState(() => {
    if (currentSection !== 'flowers') return null;
    const match = allPages.find(p => p.id.endsWith(currentSlug));
    if (!match) return null;
    return match.id.split('/')[0] ?? null;
  });

  const toggleSection = (key) => {
    setOpenSection(prev => prev === key ? null : key);
  };

  const toggleFlowerSub = (sub) => {
    setOpenFlowerSub(prev => prev === sub ? null : sub);
  };

  const flowerGroups = groupBySubdir(byCollection['flowers'] ?? []);

  // sections定義（表示順）
  const sections = [
    { key: 'vitamin-mineral', label: 'ビタミン・ミネラル' },
    { key: 'nutrient-foods',  label: '含有食品' },
    { key: 'supplement',      label: 'サプリメント' },
    { key: 'active-oxygen',   label: '活性酸素' },
    { key: 'atopic',          label: 'アトピー' },
    { key: 'flowers',         label: '花' },
    { key: 'travel',          label: '旅行' },
    { key: 'others',          label: 'その他' },
    { key: 'shop',            label: 'ショップ' },
    { key: 'access',          label: 'アクセス' },
  ];

  return (
    <aside className={`menu-left ${isMenuOpen ? 'menu-left-open' : ''}`}>
      <button className="menu-toggle" onClick={() => setIsMenuOpen(p => !p)}>
        ☰ Menu
      </button>

      <nav className="menu-nav">
        {sections.map(({ key, label }) => {
          const pages = byCollection[key] ?? [];
          if (pages.length === 0) return null;
          const isOpen = openSection === key;

          return (
            <details key={key} open={isOpen} onToggle={() => toggleSection(key)}>
              <summary>{label}</summary>

              {key === 'flowers' ? (
                <ul>
                  {Object.entries(flowerGroups).map(([sub, subPages]) => {
                    const subLabel = FLOWER_YEAR[sub] ?? sub;
                    const isSubOpen = openFlowerSub === sub;
                    return (
                      <li key={sub}>
                        <details open={isSubOpen} onToggle={() => toggleFlowerSub(sub)}>
                          <summary>{subLabel}</summary>
                          <ul>
                            {subPages.map(p => (
                              <li key={p.urlSlug}>
                                <a href={`/${p.urlSlug}`}>{p.id.split('/').pop()}</a>
                              </li>
                            ))}
                          </ul>
                        </details>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul>
                  {pages.map(p => (
                    <li key={p.urlSlug}>
                      <a href={`/${p.urlSlug}`}>{p.id.split('/').pop()}</a>
                    </li>
                  ))}
                </ul>
              )}
            </details>
          );
        })}
      </nav>
    </aside>
  );
};
