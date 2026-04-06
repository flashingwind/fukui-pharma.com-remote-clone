import React, { useState } from "react";
import "../styles/MenuLeft.css";

const VITAMIN_SLUGS = new Set([
  "eiyou", "vitasi2", "vitasi3", "vitasi4",
]);

const MINERAL_SLUGS = new Set([
  "magsiryou", "tetusiryou", "serensir", "lipoicacid",
]);

const FLOWER_2007 = new Set(["2007ranten120", "2007catC", "2007paphE"]);
const FLOWER_2006 = new Set(["2006ranten", "2006cattleya", "2006paphio", "2006lycaste11"]);
const FLOWER_2005 = new Set(["dendrobiumu", "paphio101", "paphio202", "paphio103", "cattleya1", "cattleya22", "lycaste1", "phalaenopsis", "masdevallia", "kaizyou"]);
const FLOWER_2004 = new Set(["2004ran", "cattleya", "cattleyablue", "paphiopedilum", "paphiopedilum2", "phalaenopsis4", "dendrobiumnew", "lycasteNew"]);
const FLOWER_EXTRA = new Set(["harubotan16"]);

const TRAVEL_SLUGS = new Set(["mauisunset", "hanaumabay", "wikikibeach", "mauibus", "mauisyokubutu", "suizokukan", "hawaibeach"]);
const SHOP_SLUGS = new Set(["tyuumon", "megafudo", "be-tagur"]);
const PUBLICATION_SLUGS = new Set(["mokuzitu"]);
const ACCESS_SLUGS = new Set(["access"]);
const ATOPIC_SLUGS = new Set(["atopic", "meneki", "menekikihon", "thbalance"]);
const SKIN_SLUGS = new Set(["hadautukusisa"]);
const NUTRIENT_FOOD_SLUGS = new Set([
  "eiyouso", "ganyuute",
  "aganyuu", "eganyuu", "dganyuu", "bkganyuu", "cganyuu", "b1ganyuu", "b2ganyuu", "b3ganyuu",
  "b5ganyuu", "b6ganyuu", "b12ganyu", "yousanga", "biotinga",
  "carugany", "magganyu", "karigany", "aenganyu", "tetugany", "douganyu", "cromugan", "mangagan",
  "yo-dogan", "serengan", "moribuga", "vanagany", "senigany", "keisogan", "housogan", "gerumaga",
  "coqganyu", "colingan", "inosigan",
]);

const MenuLeft = () => {
  const normalizedPath = window.location.pathname.replace(/^\/+|\/+$/g, "").replace(/\.(htm|html)$/i, "");
  const segments = normalizedPath.split("/").filter(Boolean);
  const section = segments.length > 1 ? segments[0] : "";
  const slug = segments.length === 0 ? "" : segments[segments.length - 1];
  const inFlower = section === "flowers" || FLOWER_2007.has(slug) || FLOWER_2006.has(slug) || FLOWER_2005.has(slug) || FLOWER_2004.has(slug) || FLOWER_EXTRA.has(slug);

  // アコーディオン開閉状態
  const [openSection, setOpenSection] = useState(() => ({
    flower: inFlower,
    vitaminMineral: (section === "vitamin-mineral" && (VITAMIN_SLUGS.has(slug) || MINERAL_SLUGS.has(slug))) || VITAMIN_SLUGS.has(slug) || MINERAL_SLUGS.has(slug),
    atopic: section === "atopic" || ATOPIC_SLUGS.has(slug),
    travel: section === "travel" || TRAVEL_SLUGS.has(slug),
    publication: section === "publication" || PUBLICATION_SLUGS.has(slug),
    shop: section === "shop" || SHOP_SLUGS.has(slug),
    access: section === "access" || ACCESS_SLUGS.has(slug),
    nutrientFoods: (section === "vitamin-mineral" && NUTRIENT_FOOD_SLUGS.has(slug)) || NUTRIENT_FOOD_SLUGS.has(slug),
  }));
  const [openYear, setOpenYear] = useState(() => ({
    y2007: FLOWER_2007.has(slug),
    y2006: FLOWER_2006.has(slug),
    y2005: FLOWER_2005.has(slug),
    y2004: FLOWER_2004.has(slug),
  }));

  // セクション開閉
  const toggleSection = (key) => {
    setOpenSection((prev) => {
      const next = Object.keys(prev).reduce((acc, k) => ({ ...acc, [k]: false }), {});
      next[key] = !prev[key];
      return next;
    });
  };
  // 年度開閉
  const toggleYear = (key) => {
    setOpenYear((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="menu-left">
      <a className="menu-header-link" href="/">
        <img className="menu-header-image" src="/taitorf.gif" alt="福井薬局" />
      </a>
      <nav className="menu-left-nav">
      {/* 栄養素を多く含む食品 */}
      <div className="menu-section" onClick={() => toggleSection('nutrientFoods')} style={{cursor:'pointer'}}>
        栄養素を多く含む食品 {openSection.nutrientFoods ? '▼' : '▶'}
      </div>
      {openSection.nutrientFoods && (
        <ul className="menu-group">
          <li><a href="/vitamin-mineral/ganyuute">ビタミン・ミネラルを多く含む食品（一覧）</a></li>
          <li className="menu-subtitle">ビタミン</li>
          <li><a href="/vitamin-mineral/aganyuu">ビタミンA</a></li>
          <li><a href="/vitamin-mineral/eganyuu">ビタミンE</a></li>
          <li><a href="/vitamin-mineral/dganyuu">ビタミンD</a></li>
          <li><a href="/vitamin-mineral/bkganyuu">ビタミンK</a></li>
          <li><a href="/vitamin-mineral/cganyuu">ビタミンC</a></li>
          <li><a href="/vitamin-mineral/b1ganyuu">ビタミンB1</a></li>
          <li><a href="/vitamin-mineral/b2ganyuu">ビタミンB2</a></li>
          <li><a href="/vitamin-mineral/b3ganyuu">ビタミンB3（ナイアシン）</a></li>
          <li><a href="/vitamin-mineral/b5ganyuu">ビタミンB5（パントテン酸）</a></li>
          <li><a href="/vitamin-mineral/b6ganyuu">ビタミンB6</a></li>
          <li><a href="/vitamin-mineral/b12ganyu">ビタミンB12</a></li>
          <li><a href="/vitamin-mineral/yousanga">葉酸</a></li>
          <li><a href="/vitamin-mineral/biotinga">ビオチン</a></li>

          <li className="menu-subtitle">ミネラル</li>
          <li><a href="/vitamin-mineral/carugany">カルシウム</a></li>
          <li><a href="/vitamin-mineral/magganyu">マグネシウム</a></li>
          <li><a href="/vitamin-mineral/karigany">カリウム</a></li>
          <li><a href="/vitamin-mineral/aenganyu">亜鉛</a></li>
          <li><a href="/vitamin-mineral/tetugany">鉄</a></li>
          <li><a href="/vitamin-mineral/douganyu">銅</a></li>
          <li><a href="/vitamin-mineral/cromugan">クロム</a></li>
          <li><a href="/vitamin-mineral/mangagan">マンガン</a></li>
          <li><a href="/vitamin-mineral/yo-dogan">ヨード</a></li>
          <li><a href="/vitamin-mineral/serengan">セレン</a></li>
          <li><a href="/vitamin-mineral/moribuga">モリブデン</a></li>
          <li><a href="/vitamin-mineral/vanagany">バナジウム</a></li>
          <li><a href="/vitamin-mineral/senigany">食物繊維</a></li>
          <li><a href="/vitamin-mineral/keisogan">ケイ素（シリコン）</a></li>
          <li><a href="/vitamin-mineral/housogan">ホウ素</a></li>
          <li><a href="/vitamin-mineral/gerumaga">ゲルマニウム</a></li>

          <li className="menu-subtitle">その他</li>
          <li><a href="/vitamin-mineral/coqganyu">CoQ</a></li>
          <li><a href="/vitamin-mineral/colingan">コリン</a></li>
          <li><a href="/vitamin-mineral/inosigan">イノシトール</a></li>
        </ul>
      )}

      {/* ビタミン・ミネラル */}
      <div className="menu-section" onClick={() => toggleSection('vitaminMineral')} style={{cursor:'pointer'}}>
        ビタミン・ミネラル {openSection.vitaminMineral ? '▼' : '▶'}
      </div>
      {openSection.vitaminMineral && (
        <ul className="menu-group">
          <li className="menu-subtitle">総論</li>
          <li><a href="/vitamin-mineral/eiyou">症状と不足が疑われる栄養素</a></li>
          <li><a href="/vitamin-mineral/vitasi2">ビタミン・ミネラルの必要性</a></li>
          <li><a href="/vitamin-mineral/vitasi3">ビタミンとミネラルの働き（前編）</a></li>
          <li><a href="/vitamin-mineral/vitasi4">ビタミンとミネラルの働き（後編）</a></li>
          <li className="menu-subtitle">各論</li>
          <li><a href="/vitamin-mineral/magsiryou">マグネシウムとはどんなものか</a></li>
          <li><a href="/vitamin-mineral/tetusiryou">鉄とはどんなものか</a></li>
          <li><a href="/vitamin-mineral/serensir">セレンの働き（詳細）</a></li>
          <li><a href="/vitamin-mineral/lipoicacid">アルファリポ酸</a></li>
        </ul>
      )}
      {/* アトピー */}
      <div className="menu-section" onClick={() => toggleSection('atopic')} style={{cursor:'pointer'}}>
        アトピー {openSection.atopic ? '▼' : '▶'}
      </div>
      {openSection.atopic && (
        <ul className="menu-group">
          <li><a href="/atopic">アトピー性皮膚炎と栄養素の関係</a></li>
          <li><a href="/meneki">免疫とは（免疫を受け持つ細胞）</a></li>
          <li><a href="/menekikihon">免疫の基本応答</a></li>
          <li><a href="/thbalance">Th1とTh2のバランス</a></li>
        </ul>
      )}

      {/* 肌の美しさと栄養 */}
      <a className="menu-section-link" href="/hadautukusisa">肌の美しさと栄養 ▶</a>

      {/* 出版 */}
      <div className="menu-section" onClick={() => toggleSection('publication')} style={{cursor:'pointer'}}>
        出版 {openSection.publication ? '▼' : '▶'}
      </div>
      {openSection.publication && (
        <ul className="menu-group">
          <li><a href="/vitamin-mineral/mokuzitu">『薬剤師がすすめるビタミン・ミネラルの使い方（第2版）』</a></li>
        </ul>
      )}

      {/* サプリメント */}
      {/*
      <div className="menu-section" onClick={() => toggleSection('shop')} style={{cursor:'pointer'}}>
        サプリメント {openSection.shop ? '▼' : '▶'}
      </div>
      {openSection.shop && (
        <ul className="menu-group">
          <li><a href="/megafudo">メガフードアルファ</a></li>
          <li><a href="/be-tagur">ベータグルカン</a></li>
        </ul>
      )}
      */}

      {/* 福井薬局 */}
        {/*<div className="menu-section" onClick={() => toggleSection('access')} style={{cursor:'pointer'}}>
        アクセス（店舗情報） {openSection.access ? '▼' : '▶'}
      </div>
      {openSection.access && (
        <ul className="menu-group">
          <li><a href="/access">アクセス</a></li>
        </ul>
      )}
      */}

      {/* 花の写真集 */}
      <div className="menu-section" onClick={() => toggleSection('flower')} style={{cursor:'pointer'}}>
        花の写真集 {openSection.flower ? '▼' : '▶'}
      </div>
      {openSection.flower && (
        <ul className="menu-group">
          <li className="menu-subtitle" onClick={() => toggleYear('y2007')} style={{cursor:'pointer'}}>
            2007 世界らん展 {openYear.y2007 ? '▼' : '▶'}
          </li>
          {openYear.y2007 && <>
            <li><a href="/2007ranten120">日本大賞はデンドロビウム</a></li>
            <li><a href="/2007catC">カトレア</a></li>
            <li><a href="/2007paphE">パフィオ</a></li>
          </>}
          <li className="menu-subtitle" onClick={() => toggleYear('y2006')} style={{cursor:'pointer'}}>
            2006 世界らん展 {openYear.y2006 ? '▼' : '▶'}
          </li>
          {openYear.y2006 && <>
            <li><a href="/2006ranten">日本大賞はマスデバリア</a></li>
            <li><a href="/2006cattleya">カトレア</a></li>
            <li><a href="/2006paphio">パフィオ</a></li>
            <li><a href="/2006lycaste11">リカステ</a></li>
          </>}
          <li className="menu-subtitle" onClick={() => toggleYear('y2005')} style={{cursor:'pointer'}}>
            2005 世界らん展 {openYear.y2005 ? '▼' : '▶'}
          </li>
          {openYear.y2005 && <>
            <li><a href="/dendrobiumu">日本大賞はデンドロビウム</a></li>
            <li><a href="/paphio101">パフィオ1</a></li>
            <li><a href="/paphio202">パフィオ2</a></li>
            <li><a href="/paphio103">パフィオ3</a></li>
            <li><a href="/cattleya1">パフィオ4</a></li>
            <li><a href="/cattleya22">カトレア</a></li>
            <li><a href="/lycaste1">リカステ</a></li>
            <li><a href="/phalaenopsis">ファレノ</a></li>
            <li><a href="/masdevallia">マスデバリア</a></li>
            <li><a href="/kaizyou">その他</a></li>
          </>}
          <li className="menu-subtitle" onClick={() => toggleYear('y2004')} style={{cursor:'pointer'}}>
            2004 世界らん展 {openYear.y2004 ? '▼' : '▶'}
          </li>
          {openYear.y2004 && <>
            <li><a href="/2004ran">日本大賞はファレノプシス</a></li>
            <li><a href="/cattleya">カトレア</a></li>
            <li><a href="/cattleyablue">カトレア・青</a></li>
            <li><a href="/paphiopedilum">パフィオ1</a></li>
            <li><a href="/paphiopedilum2">パフィオ2</a></li>
            <li><a href="/phalaenopsis4">ファレノ</a></li>
            <li><a href="/dendrobiumnew">デンドロ</a></li>
            <li><a href="/lycasteNew">リカステ</a></li>
          </>}
          <li className="menu-subtitle"><a href="/harubotan16" style={{textDecoration:'none', color:'inherit'}}>上野公園ぼたん展 ▶</a></li>
        </ul>
      )}

      {/* ハワイ旅行 */}
      <div className="menu-section" onClick={() => toggleSection('travel')} style={{cursor:'pointer'}}>
        ハワイ旅行 {openSection.travel ? '▼' : '▶'}
      </div>
      {openSection.travel && (
        <ul className="menu-group">
          <li className="menu-subtitle">マウイ島</li>
          <li><a href="/mauisunset">カアナパリの夕日・虹</a></li>
          <li><a href="/mauibus">マウイのバス（ホエールビレッジ）</a></li>
          <li><a href="/mauisyokubutu">マウイ植物園（バナナ・ジンジャーの花）</a></li>
          <li><a href="/suizokukan">マウイ水族館</a></li>
          <li className="menu-subtitle">オアフ島</li>
          <li><a href="/hanaumabay">ハナウマ湾</a></li>
          <li><a href="/wikikibeach">ワイキキ・カラカウア通り</a></li>
          <li><a href="/hawaibeach">ハワイのビーチ</a></li>
        </ul>
      )}
      </nav>
    </aside>
  );
};

export default MenuLeft;
