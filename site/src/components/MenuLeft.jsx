import React, { useState } from "react";
import "../styles/MenuLeft.css";

const MenuLeft = () => {
  // アコーディオン開閉状態
  const [openSection, setOpenSection] = useState({
    flower: true,
    vitamin: false,
    mineral: false,
    travel: false,
  });
  const [openYear, setOpenYear] = useState({
    y2007: false,
    y2006: false,
    y2005: false,
    y2004: false,
    vBasic: false,
    mBasic: false,
  });

  // セクション開閉
  const toggleSection = (key) => {
    setOpenSection((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  // 年度開閉
  const toggleYear = (key) => {
    setOpenYear((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <nav className="menu-left">
      <ul className="menu-group">
        <li className="menu-title"><a href="/">トップページ</a></li>
      </ul>
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
        </ul>
      )}

      {/* ビタミン */}
      <div className="menu-section" onClick={() => toggleSection('vitamin')} style={{cursor:'pointer'}}>
        ビタミン {openSection.vitamin ? '▼' : '▶'}
      </div>
      {openSection.vitamin && (
        <ul className="menu-group">
          <li className="menu-subtitle" onClick={() => toggleYear('vBasic')} style={{cursor:'pointer'}}>
            基本情報 {openYear.vBasic ? '▼' : '▶'}
          </li>
          {openYear.vBasic && <>
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
          </>}
        </ul>
      )}

      {/* ミネラル */}
      <div className="menu-section" onClick={() => toggleSection('mineral')} style={{cursor:'pointer'}}>
        ミネラル {openSection.mineral ? '▼' : '▶'}
      </div>
      {openSection.mineral && (
        <ul className="menu-group">
          <li className="menu-subtitle" onClick={() => toggleYear('mBasic')} style={{cursor:'pointer'}}>
            基本情報 {openYear.mBasic ? '▼' : '▶'}
          </li>
          {openYear.mBasic && <>
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
          </>}
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
  );
};

export default MenuLeft;
