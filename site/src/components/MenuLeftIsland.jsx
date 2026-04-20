import React, { useState } from "react";
import "../styles/MenuLeft.css";

// URLパス（先頭・末尾スラッシュなし）→ 開くメニューキーの完全マッピング
const PATH_TO_MENU = {
  // ビタミン・ミネラル
  "vitamin-mineral/eiyou": "vitaminMineral",
  "vitamin-mineral/vitasi2": "vitaminMineral",
  "vitamin-mineral/vitasi3": "vitaminMineral",
  "vitamin-mineral/vitasi4": "vitaminMineral",
  "vitamin-mineral/magsiryou": "vitaminMineral",
  "vitamin-mineral/serensir": "vitaminMineral",
  "vitamin-mineral/lipoicacid": "vitaminMineral",
  "vitamin-mineral/aensiryou": "vitaminMineral",
  "vitamin-mineral/tetusiryou": "vitaminMineral",
  "vitamin-mineral/ganyuute": "vitaminMineral",
  // 出版（vitamin-mineralディレクトリだが出版メニュー）
  "vitamin-mineral/mokuzitu": "publication",
  "vitamin-mineral/mokuzito": "publication",
  // 活性酸素
  "active-oxygen/kousanka": "activeOxygen",
  // サプリメント
  "supplement/shyoyou": "supplement",
  "supplement/suppuse": "supplement",
  "supplement/begu": "supplement",
  "supplement/be-tagur": "supplement",
  "supplement/be-tagur10": "supplement",
  "supplement/megafudo": "supplement",
  // アトピー・免疫
  "atopic/atopic": "atopic",
  "atopic/meneki": "atopic",
  "atopic/menekikihon": "atopic",
  "atopic/thbalance": "atopic",
  // 栄養素を多く含む食品
  "nutrient-foods/aganyuu": "nutrientFoods",
  "nutrient-foods/eganyuu": "nutrientFoods",
  "nutrient-foods/dganyuu": "nutrientFoods",
  "nutrient-foods/bkganyuu": "nutrientFoods",
  "nutrient-foods/cganyuu": "nutrientFoods",
  "nutrient-foods/b1ganyuu": "nutrientFoods",
  "nutrient-foods/b2ganyuu": "nutrientFoods",
  "nutrient-foods/b3ganyuu": "nutrientFoods",
  "nutrient-foods/b5ganyuu": "nutrientFoods",
  "nutrient-foods/b6ganyuu": "nutrientFoods",
  "nutrient-foods/b12ganyu": "nutrientFoods",
  "nutrient-foods/yousanga": "nutrientFoods",
  "nutrient-foods/biotinga": "nutrientFoods",
  "nutrient-foods/carugany": "nutrientFoods",
  "nutrient-foods/magganyu": "nutrientFoods",
  "nutrient-foods/karigany": "nutrientFoods",
  "nutrient-foods/aenganyu": "nutrientFoods",
  "nutrient-foods/tetugany": "nutrientFoods",
  "nutrient-foods/douganyu": "nutrientFoods",
  "nutrient-foods/cromugan": "nutrientFoods",
  "nutrient-foods/mangagan": "nutrientFoods",
  "nutrient-foods/yo-dogan": "nutrientFoods",
  "nutrient-foods/serengan": "nutrientFoods",
  "nutrient-foods/moribuga": "nutrientFoods",
  "nutrient-foods/vanagany": "nutrientFoods",
  "nutrient-foods/senigany": "nutrientFoods",
  "nutrient-foods/keisogan": "nutrientFoods",
  "nutrient-foods/housogan": "nutrientFoods",
  "nutrient-foods/gerumaga": "nutrientFoods",
  "nutrient-foods/coqganyu": "nutrientFoods",
  "nutrient-foods/colingan": "nutrientFoods",
  "nutrient-foods/inosigan": "nutrientFoods",
  // 花の写真集
  "flowers/2007/2007ranten120": "flower",
  "flowers/2007/2007catC": "flower",
  "flowers/2007/2007paphE": "flower",
  "flowers/2006/2006ranten": "flower",
  "flowers/2006/2006cattleya": "flower",
  "flowers/2006/2006paphio": "flower",
  "flowers/2006/2006lycaste11": "flower",
  "flowers/dendrobium/dendrobiumu": "flower",
  "flowers/paphio/paphio101": "flower",
  "flowers/paphio/paphio202": "flower",
  "flowers/paphio/paphio103": "flower",
  "flowers/cattleya/cattleya1": "flower",
  "flowers/cattleya/cattleya22": "flower",
  "flowers/lycaste/lycaste1": "flower",
  "flowers/phalaenopsis/phalaenopsis": "flower",
  "flowers/others/masdevallia": "flower",
  "flowers/dendrobium/kaizyou": "flower",
  "flowers/2004/2004ran": "flower",
  "flowers/cattleya/cattleya": "flower",
  "flowers/cattleya/cattleyablue": "flower",
  "flowers/paphio/paphiopedilum": "flower",
  "flowers/paphio/paphiopedilum2": "flower",
  "flowers/phalaenopsis/phalaenopsis4": "flower",
  "flowers/dendrobium/dendrobiumnew": "flower",
  "flowers/lycaste/lycasteNew": "flower",
  "flowers/others/harubotan16": "flower",
  "flowers/others/sonota": "flower",
  "flowers/others/takasimayabaraten": "flower",
  // ハワイ旅行
  "travel/mauisunset": "travel",
  "travel/mauibus": "travel",
  "travel/mauisyokubutu": "travel",
  "travel/suizokukan": "travel",
  "travel/hanaumabay": "travel",
  "travel/wikikibeach": "travel",
  "travel/hawaibeach": "travel",
  // 当店について（展開なし、リンクのみ）
  "shop/fukui": null,
  "shop/order": null,
  "shop/tyuumon": null,
  // アクセス（展開なし）
  "access/fukui": null,
  "access/fukui2": null,
  "access/fukui3": null,
  // 肌の美しさと栄養（展開なし）
  "others/hadautukusisa": null,
  "others/oldcar": null,
};

// 花のページの年サブセクションマッピング
const PATH_TO_FLOWER_YEAR = {
  "flowers/2007/2007ranten120": "y2007",
  "flowers/2007/2007catC": "y2007",
  "flowers/2007/2007paphE": "y2007",
  "flowers/2006/2006ranten": "y2006",
  "flowers/2006/2006cattleya": "y2006",
  "flowers/2006/2006paphio": "y2006",
  "flowers/2006/2006lycaste11": "y2006",
  "flowers/dendrobium/dendrobiumu": "y2005",
  "flowers/paphio/paphio101": "y2005",
  "flowers/paphio/paphio202": "y2005",
  "flowers/paphio/paphio103": "y2005",
  "flowers/cattleya/cattleya1": "y2005",
  "flowers/cattleya/cattleya22": "y2005",
  "flowers/lycaste/lycaste1": "y2005",
  "flowers/phalaenopsis/phalaenopsis": "y2005",
  "flowers/others/masdevallia": "y2005",
  "flowers/dendrobium/kaizyou": "y2005",
  "flowers/2004/2004ran": "y2004",
  "flowers/cattleya/cattleya": "y2004",
  "flowers/cattleya/cattleyablue": "y2004",
  "flowers/paphio/paphiopedilum": "y2004",
  "flowers/paphio/paphiopedilum2": "y2004",
  "flowers/phalaenopsis/phalaenopsis4": "y2004",
  "flowers/dendrobium/dendrobiumnew": "y2004",
  "flowers/lycaste/lycasteNew": "y2004",
};

export const MenuLeftIsland = ({ allPages = [] }) => {
  const pathname = typeof window !== 'undefined' ? window.location.pathname.replace(/^\/+|\/+$/g, '') : '';

  const menuKey = PATH_TO_MENU[pathname];
  const flowerYear = PATH_TO_FLOWER_YEAR[pathname];

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [openSection, setOpenSection] = useState({
    flower: menuKey === "flower",
    vitaminMineral: menuKey === "vitaminMineral",
    atopic: menuKey === "atopic",
    activeOxygen: menuKey === "activeOxygen",
    travel: menuKey === "travel",
    publication: menuKey === "publication",
    shop: false,
    supplement: menuKey === "supplement",
    access: false,
    nutrientFoods: menuKey === "nutrientFoods",
  });

  const [openYear, setOpenYear] = useState({
    y2007: flowerYear === "y2007",
    y2006: flowerYear === "y2006",
    y2005: flowerYear === "y2005",
    y2004: flowerYear === "y2004",
  });

  const [openNutrientGroup, setOpenNutrientGroup] = useState({ vitamin: false, mineral: false, other: false });

  const toggleSection = (key) => {
    setOpenSection((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const toggleYear = (key) => {
    setOpenYear((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const toggleNutrientGroup = (key) => {
    setOpenNutrientGroup((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className={`menu-left ${isMenuOpen ? 'menu-left-open' : ''}`}>
      <div className="menu-left-header">
        <a className="menu-header-link" href="/">
          <img className="menu-header-image" src="/taitorf.gif" alt="福井薬局" />
        </a>
        <button
          type="button"
          className="menu-left-toggle"
          onClick={() => setIsMenuOpen(p => !p)}
          aria-expanded={isMenuOpen}
          aria-controls="menu-left-navigation"
          aria-label="メニューを開閉"
        >
          <span className="menu-left-toggle-line" />
          <span className="menu-left-toggle-line" />
          <span className="menu-left-toggle-line" />
        </button>
      </div>
      <nav className="menu-left-nav" id="menu-left-navigation">

        {/* 栄養素を多く含む食品 */}
        <div className="menu-section" onClick={() => toggleSection('nutrientFoods')} style={{cursor:'pointer'}}>
          栄養素を多く含む食品 {openSection.nutrientFoods ? '▼' : '▶'}
        </div>
        {openSection.nutrientFoods && (
          <ul className="menu-group">
            <li className="menu-subtitle" onClick={() => toggleNutrientGroup('vitamin')} style={{cursor:'pointer'}}>
              ビタミン {openNutrientGroup.vitamin ? '▼' : '▶'}
            </li>
            {openNutrientGroup.vitamin && <>
              <li><a href="/nutrient-foods/aganyuu">ビタミンA</a></li>
              <li><a href="/nutrient-foods/eganyuu">ビタミンE</a></li>
              <li><a href="/nutrient-foods/dganyuu">ビタミンD</a></li>
              <li><a href="/nutrient-foods/bkganyuu">ビタミンK</a></li>
              <li><a href="/nutrient-foods/cganyuu">ビタミンC</a></li>
              <li><a href="/nutrient-foods/b1ganyuu">ビタミンB1</a></li>
              <li><a href="/nutrient-foods/b2ganyuu">ビタミンB2</a></li>
              <li><a href="/nutrient-foods/b3ganyuu">ビタミンB3（ナイアシン）</a></li>
              <li><a href="/nutrient-foods/b5ganyuu">ビタミンB5（パントテン酸）</a></li>
              <li><a href="/nutrient-foods/b6ganyuu">ビタミンB6</a></li>
              <li><a href="/nutrient-foods/b12ganyu">ビタミンB12</a></li>
              <li><a href="/nutrient-foods/yousanga">葉酸</a></li>
              <li><a href="/nutrient-foods/biotinga">ビオチン</a></li>
            </>}
            <li className="menu-subtitle" onClick={() => toggleNutrientGroup('mineral')} style={{cursor:'pointer'}}>
              ミネラル {openNutrientGroup.mineral ? '▼' : '▶'}
            </li>
            {openNutrientGroup.mineral && <>
              <li><a href="/nutrient-foods/carugany">カルシウム</a></li>
              <li><a href="/nutrient-foods/magganyu">マグネシウム</a></li>
              <li><a href="/nutrient-foods/karigany">カリウム</a></li>
              <li><a href="/nutrient-foods/aenganyu">亜鉛</a></li>
              <li><a href="/nutrient-foods/tetugany">鉄</a></li>
              <li><a href="/nutrient-foods/douganyu">銅</a></li>
              <li><a href="/nutrient-foods/cromugan">クロム</a></li>
              <li><a href="/nutrient-foods/mangagan">マンガン</a></li>
              <li><a href="/nutrient-foods/yo-dogan">ヨード</a></li>
              <li><a href="/nutrient-foods/serengan">セレン</a></li>
              <li><a href="/nutrient-foods/moribuga">モリブデン</a></li>
              <li><a href="/nutrient-foods/vanagany">バナジウム</a></li>
              <li><a href="/nutrient-foods/senigany">食物繊維</a></li>
              <li><a href="/nutrient-foods/keisogan">ケイ素（シリコン）</a></li>
              <li><a href="/nutrient-foods/housogan">ホウ素</a></li>
              <li><a href="/nutrient-foods/gerumaga">ゲルマニウム</a></li>
            </>}
            <li className="menu-subtitle" onClick={() => toggleNutrientGroup('other')} style={{cursor:'pointer'}}>
              その他 {openNutrientGroup.other ? '▼' : '▶'}
            </li>
            {openNutrientGroup.other && <>
              <li><a href="/nutrient-foods/coqganyu">CoQ</a></li>
              <li><a href="/nutrient-foods/colingan">コリン</a></li>
              <li><a href="/nutrient-foods/inosigan">イノシトール</a></li>
            </>}
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
            <li><a href="/vitamin-mineral/serensir">セレンの働き（詳細）</a></li>
            <li><a href="/vitamin-mineral/lipoicacid">アルファリポ酸</a></li>
          </ul>
        )}

        {/* 活性酸素 */}
        <div className="menu-section" onClick={() => toggleSection('activeOxygen')} style={{cursor:'pointer'}}>
          活性酸素 {openSection.activeOxygen ? '▼' : '▶'}
        </div>
        {openSection.activeOxygen && (
          <ul className="menu-group">
            <li><a href="/active-oxygen/kousanka">活性酸素(フリーラジカル)が老化や成人病の原因に?</a></li>
          </ul>
        )}

        {/* サプリメント */}
        <div className="menu-section" onClick={() => toggleSection('supplement')} style={{cursor:'pointer'}}>
          サプリメント {openSection.supplement ? '▼' : '▶'}
        </div>
        {openSection.supplement && (
          <ul className="menu-group">
            <li><a href="/supplement/shyoyou">所要量、RDA,DV,ODAの比較表</a></li>
            <li><a href="/supplement/suppuse">サプリメントの摂り方</a></li>
            <li><a href="/supplement/begu">ベータグルカンとは</a></li>
            <li><a href="/supplement/be-tagur">ベータグルカン</a></li>
            <li><a href="/supplement/be-tagur10">ベータグルカン（詳細）</a></li>
            <li><a href="/supplement/megafudo">メガフードアルファー</a></li>
          </ul>
        )}

        {/* アトピー・免疫 */}
        <div className="menu-section" onClick={() => toggleSection('atopic')} style={{cursor:'pointer'}}>
          アトピー・免疫 {openSection.atopic ? '▼' : '▶'}
        </div>
        {openSection.atopic && (
          <ul className="menu-group">
            <li><a href="/atopic/atopic">アトピー性皮膚炎と栄養素の関係</a></li>
            <li><a href="/atopic/meneki">免疫とは（免疫を受け持つ細胞）</a></li>
            <li><a href="/atopic/menekikihon">免疫の基本応答</a></li>
            <li><a href="/atopic/thbalance">Th1とTh2のバランス</a></li>
          </ul>
        )}

        {/* 肌の美しさと栄養 */}
        <a className="menu-section-link" href="/others/hadautukusisa">肌の美しさと栄養 ▶</a>

        {/* 出版 */}
        <div className="menu-section" onClick={() => toggleSection('publication')} style={{cursor:'pointer'}}>
          出版 {openSection.publication ? '▼' : '▶'}
        </div>
        {openSection.publication && (
          <ul className="menu-group">
            <li><a href="/vitamin-mineral/mokuzitu">薬剤師がすすめるビタミン・ミネラルの使い方（第2版）</a></li>
            <li><a href="/vitamin-mineral/mokuzito">新版 薬剤師がすすめるビタミン・ミネラルのとり方</a></li>
          </ul>
        )}

        {/* 当店について */}
        <a className="menu-section-link" href="/shop/fukui">当店について ▶</a>

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
              <li><a href="/flowers/2007/2007ranten120">日本大賞はデンドロビウム</a></li>
              <li><a href="/flowers/2007/2007catC">カトレア</a></li>
              <li><a href="/flowers/2007/2007paphE">パフィオ</a></li>
            </>}
            <li className="menu-subtitle" onClick={() => toggleYear('y2006')} style={{cursor:'pointer'}}>
              2006 世界らん展 {openYear.y2006 ? '▼' : '▶'}
            </li>
            {openYear.y2006 && <>
              <li><a href="/flowers/2006/2006ranten">日本大賞はマスデバリア</a></li>
              <li><a href="/flowers/2006/2006cattleya">カトレア</a></li>
              <li><a href="/flowers/2006/2006paphio">パフィオ</a></li>
              <li><a href="/flowers/2006/2006lycaste11">リカステ</a></li>
            </>}
            <li className="menu-subtitle" onClick={() => toggleYear('y2005')} style={{cursor:'pointer'}}>
              2005 世界らん展 {openYear.y2005 ? '▼' : '▶'}
            </li>
            {openYear.y2005 && <>
              <li><a href="/flowers/dendrobium/dendrobiumu">日本大賞はデンドロビウム</a></li>
              <li><a href="/flowers/paphio/paphio101">パフィオ1</a></li>
              <li><a href="/flowers/paphio/paphio202">パフィオ2</a></li>
              <li><a href="/flowers/paphio/paphio103">パフィオ3</a></li>
              <li><a href="/flowers/cattleya/cattleya1">パフィオ4</a></li>
              <li><a href="/flowers/cattleya/cattleya22">カトレア</a></li>
              <li><a href="/flowers/lycaste/lycaste1">リカステ</a></li>
              <li><a href="/flowers/phalaenopsis/phalaenopsis">ファレノ</a></li>
              <li><a href="/flowers/others/masdevallia">マスデバリア</a></li>
              <li><a href="/flowers/dendrobium/kaizyou">その他</a></li>
            </>}
            <li className="menu-subtitle" onClick={() => toggleYear('y2004')} style={{cursor:'pointer'}}>
              2004 世界らん展 {openYear.y2004 ? '▼' : '▶'}
            </li>
            {openYear.y2004 && <>
              <li><a href="/flowers/2004/2004ran">日本大賞はファレノプシス</a></li>
              <li><a href="/flowers/cattleya/cattleya">カトレア</a></li>
              <li><a href="/flowers/cattleya/cattleyablue">カトレア・青</a></li>
              <li><a href="/flowers/paphio/paphiopedilum">パフィオ1</a></li>
              <li><a href="/flowers/paphio/paphiopedilum2">パフィオ2</a></li>
              <li><a href="/flowers/phalaenopsis/phalaenopsis4">ファレノ</a></li>
              <li><a href="/flowers/dendrobium/dendrobiumnew">デンドロ</a></li>
              <li><a href="/flowers/lycaste/lycasteNew">リカステ</a></li>
            </>}
            <li className="menu-subtitle"><a href="/flowers/others/harubotan16" style={{textDecoration:'none', color:'inherit'}}>上野公園ぼたん展 ▶</a></li>
          </ul>
        )}

        {/* ハワイ旅行 */}
        <div className="menu-section" onClick={() => toggleSection('travel')} style={{cursor:'pointer'}}>
          ハワイ旅行 {openSection.travel ? '▼' : '▶'}
        </div>
        {openSection.travel && (
          <ul className="menu-group">
            <li className="menu-subtitle">マウイ島</li>
            <li><a href="/travel/mauisunset">カアナパリの夕日・虹</a></li>
            <li><a href="/travel/mauibus">マウイのバス（ホエールビレッジ）</a></li>
            <li><a href="/travel/mauisyokubutu">マウイ植物園（バナナ・ジンジャーの花）</a></li>
            <li><a href="/travel/suizokukan">マウイ水族館</a></li>
            <li className="menu-subtitle">オアフ島</li>
            <li><a href="/travel/hanaumabay">ハナウマ湾</a></li>
            <li><a href="/travel/wikikibeach">ワイキキ・カラカウア通り</a></li>
            <li><a href="/travel/hawaibeach">ハワイのビーチ</a></li>
          </ul>
        )}

      </nav>
    </aside>
  );
};
