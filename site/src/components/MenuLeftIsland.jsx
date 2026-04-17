import React, { useState, useEffect } from "react";
import "../styles/MenuLeft.css";

// Auto-generated from content/ directory
const VITAMIN_MINERAL_NUTRIENT_FOODS = new Set(["aenganyu", "aganyuu", "b12ganyu", "b1ganyuu", "b2ganyuu", "b3ganyuu", "b5ganyuu", "b6ganyuu", "biotinga", "bkganyuu", "carugany", "cganyuu", "colingan", "coqganyu", "cromugan", "dganyuu", "douganyu", "eganyuu", "gerumaga", "housogan", "inosigan", "karigany", "keisogan", "magganyu", "mangagan", "moribuga", "senigany", "serengan", "tetugany", "vanagany", "yo-dogan", "yousanga"]);
const VITAMIN_MINERAL = new Set(["aenganyu", "aensiryou", "aganyuu", "b12ganyu", "b1ganyuu", "b2ganyuu", "b3ganyuu", "b5ganyuu", "b6ganyuu", "biotinga", "bkganyuu", "carugany", "cganyuu", "colingan", "coqganyu", "cromugan", "dganyuu", "douganyu", "eganyuu", "eiyou", "ganyuute", "gerumaga", "housogan", "inosigan", "karigany", "keisogan", "lipoicacid", "magganyu", "magsiryou", "mangagan", "mokuzito", "mokuzitu", "moribuga", "senigany", "serengan", "serensir", "tetugany", "tetusiryou", "vanagany", "vitasi2", "vitasi3", "vitasi4", "yo-dogan", "yousanga"]);
const SUPPLEMENT = new Set(["be-tagur", "be-tagur10", "begu", "megafudo", "shyoyou", "suppuse"]);
const ACTIVE_OXYGEN = new Set(["kousanka"]);
const ATOPIC = new Set(["atopic", "meneki", "menekikihon", "thbalance"]);
const FLOWERS_2004 = new Set(["2004ran"]);
const FLOWERS_2006 = new Set(["2006cattleya", "2006lycaste11", "2006paphio", "2006ranten"]);
const FLOWERS_2007 = new Set(["2007catC", "2007paphE", "2007ranten120"]);
const FLOWERS_CATTLEYA = new Set(["cattleya", "cattleya1", "cattleya22", "cattleyablue"]);
const FLOWERS_DENDROBIUM = new Set(["dendrobiumnew", "dendrobiumu", "kaizyou"]);
const FLOWERS_LYCASTE = new Set(["lycaste1", "lycasteNew"]);
const FLOWERS_OTHERS = new Set(["harubotan16", "masdevallia", "sonota", "takasimayabaraten"]);
const FLOWERS_PAPHIO = new Set(["paphio101", "paphio103", "paphio202", "paphiopedilum", "paphiopedilum2"]);
const FLOWERS_PHALAENOPSIS = new Set(["phalaenopsis", "phalaenopsis4"]);
const FLOWERS = new Set(["2004ran", "2006cattleya", "2006lycaste11", "2006paphio", "2006ranten", "2007catC", "2007paphE", "2007ranten120", "cattleya", "cattleya1", "cattleya22", "cattleyablue", "dendrobiumnew", "dendrobiumu", "harubotan16", "kaizyou", "lycaste1", "lycasteNew", "masdevallia", "paphio101", "paphio103", "paphio202", "paphiopedilum", "paphiopedilum2", "phalaenopsis", "phalaenopsis4", "sonota", "takasimayabaraten"]);
const TRAVEL = new Set(["hanaumabay", "hawaibeach", "mauibus", "mauisunset", "mauisyokubutu", "suizokukan", "wikikibeach"]);
const OTHERS = new Set(["hadautukusisa", "oldcar"]);
const SHOP = new Set(["fukui", "order", "tyuumon"]);
const ABOUT = new Set(["fukui", "fukui2", "fukui3"]);

export const MenuLeftIsland = ({ currentSlug = "", currentSection = "" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState({
    flower: currentSection === "flowers" || FLOWERS.has(currentSlug),
    vitaminMineral: currentSection === "vitamin-mineral" || VITAMIN_MINERAL.has(currentSlug),
    atopic: currentSection === "atopic" || ATOPIC.has(currentSlug),
    activeOxygen: currentSection === "active-oxygen" || ACTIVE_OXYGEN.has(currentSlug),
    travel: currentSection === "travel" || TRAVEL.has(currentSlug),
    publication: currentSection === "publication" || VITAMIN_MINERAL.has(currentSlug),
    shop: currentSection === "shop" || SHOP.has(currentSlug),
    supplement: currentSection === "supplement" || SUPPLEMENT.has(currentSlug),
    access: currentSection === "access",
    nutrientFoods: false,
  });
  const [openYear, setOpenYear] = useState({
    y2007: FLOWERS_2007.has(currentSlug),
    y2006: FLOWERS_2006.has(currentSlug),
    y2004: FLOWERS_2004.has(currentSlug),
  });
  const [openNutrientGroup, setOpenNutrientGroup] = useState({
    vitamin: currentSection === "vitamin-mineral" && VITAMIN_MINERAL_NUTRIENT_FOODS.has(currentSlug),
  });

  const toggleSection = (key) => {
    setOpenSection((prev) => {
      const next = Object.keys(prev).reduce((acc, k) => ({ ...acc, [k]: false }), {});
      next[key] = !prev[key];
      return next;
    });
  };

  const toggleYear = (key) => {
    setOpenYear((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleNutrientGroup = (key) => {
    setOpenNutrientGroup((prev) => {
      const next = Object.keys(prev).reduce((acc, k) => ({ ...acc, [k]: false }), {});
      next[key] = !prev[key];
      return next;
    });
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <aside className={`menu-left ${isMenuOpen ? 'menu-left-open' : ''}`}>
      <button className="menu-toggle" onClick={toggleMobileMenu}>
        ☰ Menu
      </button>

      <nav className="menu-nav">
        {/* Vitamin & Mineral */}
        <details open={openSection.vitaminMineral} onToggle={() => toggleSection('vitaminMineral')}>
          <summary>ビタミン・ミネラル</summary>
          <ul>
            <li><a href="/vitamin-mineral/eiyou">栄養素について</a></li>
            <li><a href="/vitamin-mineral/ganyuute">含有食品</a></li>
            {openNutrientGroup.vitamin && (
              <ul>
                {Array.from(VITAMIN_MINERAL_NUTRIENT_FOODS).map(slug => (
                  <li key={slug}><a href={`/vitamin-mineral/${slug}`}>{slug}</a></li>
                ))}
              </ul>
            )}
          </ul>
        </details>

        {/* Supplement */}
        <details open={openSection.supplement} onToggle={() => toggleSection('supplement')}>
          <summary>サプリメント</summary>
          <ul>
            {Array.from(SUPPLEMENT).map(slug => (
              <li key={slug}><a href={`/supplement/${slug}`}>{slug}</a></li>
            ))}
          </ul>
        </details>

        {/* Active Oxygen */}
        <details open={openSection.activeOxygen} onToggle={() => toggleSection('activeOxygen')}>
          <summary>活性酸素</summary>
          <ul>
            {Array.from(ACTIVE_OXYGEN).map(slug => (
              <li key={slug}><a href={`/active-oxygen/${slug}`}>{slug}</a></li>
            ))}
          </ul>
        </details>

        {/* Atopic */}
        <details open={openSection.atopic} onToggle={() => toggleSection('atopic')}>
          <summary>アトピー</summary>
          <ul>
            {Array.from(ATOPIC).map(slug => (
              <li key={slug}><a href={`/atopic/${slug}`}>{slug}</a></li>
            ))}
          </ul>
        </details>

        {/* Flowers */}
        <details open={openSection.flower} onToggle={() => toggleSection('flower')}>
          <summary>花</summary>
          <ul>
            <li><a href="/flowers/2007catC">2007年</a>
              <details open={openYear.y2007} onToggle={() => toggleYear('y2007')}>
                <ul>
                  {Array.from(FLOWERS_2007).map(slug => (
                    <li key={slug}><a href={`/flowers/${slug}`}>{slug}</a></li>
                  ))}
                </ul>
              </details>
            </li>
            <li><a href="/flowers/2006cattleya">2006年</a>
              <details open={openYear.y2006} onToggle={() => toggleYear('y2006')}>
                <ul>
                  {Array.from(FLOWERS_2006).map(slug => (
                    <li key={slug}><a href={`/flowers/${slug}`}>{slug}</a></li>
                  ))}
                </ul>
              </details>
            </li>
            <li><a href="/flowers/2004ran">2004年</a>
              <details open={openYear.y2004} onToggle={() => toggleYear('y2004')}>
                <ul>
                  {Array.from(FLOWERS_2004).map(slug => (
                    <li key={slug}><a href={`/flowers/${slug}`}>{slug}</a></li>
                  ))}
                </ul>
              </details>
            </li>
          </ul>
        </details>

        {/* Travel */}
        <details open={openSection.travel} onToggle={() => toggleSection('travel')}>
          <summary>旅行</summary>
          <ul>
            {Array.from(TRAVEL).map(slug => (
              <li key={slug}><a href={`/travel/${slug}`}>{slug}</a></li>
            ))}
          </ul>
        </details>

        {/* Shop */}
        <details open={openSection.shop} onToggle={() => toggleSection('shop')}>
          <summary>ショップ</summary>
          <ul>
            {Array.from(SHOP).map(slug => (
              <li key={slug}><a href={`/shop/${slug}`}>{slug}</a></li>
            ))}
          </ul>
        </details>

        {/* About */}
        <details open={openSection.access} onToggle={() => toggleSection('access')}>
          <summary>アクセス</summary>
          <ul>
            {Array.from(ABOUT).map(slug => (
              <li key={slug}><a href={`/about/${slug}`}>{slug}</a></li>
            ))}
          </ul>
        </details>
      </nav>
    </aside>
  );
};
