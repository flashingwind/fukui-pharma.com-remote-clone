import React, { useState } from "react";
import "../styles/MenuLeft.css";

const VITAMIN_SLUGS = new Set([
  "eiyou", "eiyouso", "b1ganyuu", "b2ganyuu", "b3ganyuu", "b5ganyuu", "b6ganyuu", "b12ganyu",
  "cganyuu", "eganyuu", "vitasi2", "vitasi3", "vitasi4",
]);

const MINERAL_SLUGS = new Set([
  "magganyu", "magsiryou", "bkganyuu", "carugany", "cganyuu", "colingan", "coqganyu", "dganyuu",
  "douganyu", "eganyuu", "ganyuute", "karigany", "keisogan", "lipoicacid", "mangagan", "meneki",
  "menekikihon", "senigany", "serengan", "serensir", "tetugany", "tetusiryou", "thbalance", "vanagany",
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

const MenuLeft = () => {
  const slug = window.location.pathname.replace(/^\/+|\/+$/g, "").replace(/\.(htm|html)$/i, "");
  const inFlower = FLOWER_2007.has(slug) || FLOWER_2006.has(slug) || FLOWER_2005.has(slug) || FLOWER_2004.has(slug) || FLOWER_EXTRA.has(slug);

  // アコーディオン開閉状態
  const [openSection, setOpenSection] = useState(() => ({
    flower: inFlower,
    vitamin: VITAMIN_SLUGS.has(slug),
    mineral: !VITAMIN_SLUGS.has(slug) && MINERAL_SLUGS.has(slug),
    travel: TRAVEL_SLUGS.has(slug),
    publication: PUBLICATION_SLUGS.has(slug),
    shop: SHOP_SLUGS.has(slug),
    access: ACCESS_SLUGS.has(slug),
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
      {/* ビタミン */}
      <div className="menu-section" onClick={() => toggleSection('vitamin')} style={{cursor:'pointer'}}>
        ビタミン {openSection.vitamin ? '▼' : '▶'}
      </div>
      {openSection.vitamin && (
        <ul className="menu-group">
          <li><a href="/eiyou">ビタミン総論</a></li>
          <li><a href="/eiyouso">ビタミンの働き</a></li>
          <li><a href="/b1ganyuu">ビタミンB1</a></li>
          <li><a href="/b2ganyuu">ビタミンB2</a></li>
          <li><a href="/b3ganyuu">ビタミンB3</a></li>
          <li><a href="/b5ganyuu">ビタミンB5</a></li>
          <li><a href="/b6ganyuu">ビタミンB6</a></li>
          <li><a href="/b12ganyu">ビタミンB12</a></li>
          <li><a href="/cganyuu">ビタミンC</a></li>
          <li><a href="/eganyuu">ビタミンE</a></li>
          <li><a href="/vitasi2">ビタミンA</a></li>
          <li><a href="/vitasi3">ビタミンD</a></li>
          <li><a href="/vitasi4">ビタミンK</a></li>
        </ul>
      )}

      {/* ミネラル */}
      <div className="menu-section" onClick={() => toggleSection('mineral')} style={{cursor:'pointer'}}>
        ミネラル {openSection.mineral ? '▼' : '▶'}
      </div>
      {openSection.mineral && (
        <ul className="menu-group">
          <li><a href="/magganyu">マグネシウム</a></li>
          <li><a href="/magsiryou">マグネシウム資料</a></li>
          <li><a href="/bkganyuu">カリウム</a></li>
          <li><a href="/carugany">カルシウム</a></li>
          <li><a href="/cganyuu">クロム</a></li>
          <li><a href="/colingan">コバルト</a></li>
          <li><a href="/coqganyu">コエンザイムQ10</a></li>
          <li><a href="/dganyuu">銅</a></li>
          <li><a href="/douganyu">銅資料</a></li>
          <li><a href="/eganyuu">鉄</a></li>
          <li><a href="/ganyuute">亜鉛</a></li>
          <li><a href="/karigany">カリウム</a></li>
          <li><a href="/keisogan">ケイ素</a></li>
          <li><a href="/lipoicacid">αリポ酸</a></li>
          <li><a href="/mangagan">マンガン</a></li>
          <li><a href="/meneki">免疫とミネラル</a></li>
          <li><a href="/menekikihon">免疫の基本</a></li>
          <li><a href="/senigany">セレン</a></li>
          <li><a href="/serengan">セレン資料</a></li>
          <li><a href="/serensir">セレン資料2</a></li>
          <li><a href="/tetugany">鉄</a></li>
          <li><a href="/tetusiryou">鉄資料</a></li>
          <li><a href="/thbalance">ミネラルバランス</a></li>
          <li><a href="/vanagany">バナジウム</a></li>
        </ul>
      )}
      {/* 出版 */}
      <div className="menu-section" onClick={() => toggleSection('publication')} style={{cursor:'pointer'}}>
        出版 {openSection.publication ? '▼' : '▶'}
      </div>
      {openSection.publication && (
        <ul className="menu-group">
          <li><a href="/mokuzitu">書籍『ビタミン・ミネラルの使い方』</a></li>
        </ul>
      )}

      {/* 通販 */}
      <div className="menu-section" onClick={() => toggleSection('shop')} style={{cursor:'pointer'}}>
        通販 {openSection.shop ? '▼' : '▶'}
      </div>
      {openSection.shop && (
        <ul className="menu-group">
          <li><a href="/tyuumon">注文方法</a></li>
          <li><a href="/megafudo">メガフードアルファ</a></li>
          <li><a href="/be-tagur">ベータグルカン</a></li>
        </ul>
      )}

      {/* アクセス */}
      <div className="menu-section" onClick={() => toggleSection('access')} style={{cursor:'pointer'}}>
        アクセス {openSection.access ? '▼' : '▶'}
      </div>
      {openSection.access && (
        <ul className="menu-group">
          <li><a href="/access">アクセス情報</a></li>
        </ul>
      )}

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
          <li><a href="/harubotan16">上野公園ぼたん展</a></li>
        </ul>
      )}

      {/* ハワイ旅行 */}
      <div className="menu-section" onClick={() => toggleSection('travel')} style={{cursor:'pointer'}}>
        ハワイ旅行 {openSection.travel ? '▼' : '▶'}
      </div>
      {openSection.travel && (
        <ul className="menu-group">
          <li className="menu-subtitle">マウイ島</li>
          <li><a href="/mauisunset">カアナパリ</a></li>
          <li><a href="/hanaumabay">ハナウマ湾</a></li>
          <li className="menu-subtitle">ワイキキ</li>
          <li><a href="/wikikibeach">カラカウア</a></li>
          <li><a href="/mauibus">マウイのバス</a></li>
          <li><a href="/mauisyokubutu">マウイ植物園</a></li>
          <li><a href="/suizokukan">マウイ水族館</a></li>
          <li><a href="/hawaibeach">ビーチ</a></li>
        </ul>
      )}
      </nav>
    </aside>
  );
};

export default MenuLeft;
