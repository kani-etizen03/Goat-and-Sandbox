/* ==================================================
  最小限のJavaScript
  文章や資料データはHTMLに置き、ここでは軽い操作だけを扱います。
================================================== */
window.addEventListener("load", () => {

    const splash = document.getElementById("splash");

    if (!splash) return;

    // ロゴ表示完了後に少し待つ
    setTimeout(() => {

        splash.classList.add("hide");

        // フェードアウト完了後に削除
        setTimeout(() => {
            splash.remove();
        }, 1000);

    }, 1500);

});

window.addEventListener("load", () => {

    const splashOther = document.getElementById("splash-other");

    if (!splashOther) return;

    // ロゴ表示完了後に少し待つ
    setTimeout(() => {

        splashOther.classList.add("hide");

        // フェードアウト完了後に削除
        setTimeout(() => {
            splashOther.remove();
        }, 1000);

    }, 1500);

});

window.addEventListener("load", () => {

    const splashSquare = document.getElementById("splash-square");

    if (!splashSquare) return;

    // ロゴ表示完了後に少し待つ
    setTimeout(() => {

        splashSquare.classList.add("hide");

        // フェードアウト完了後に削除
        setTimeout(() => {
            splashSquare.remove();
        }, 1000);

    }, 3000);

});

/* ヘッダー背景とモバイルメニュー */
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuButton = document.querySelector("[data-menu-button]");

function updateHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });

  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      nav.classList.remove("is-open");
    }
  });
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

/* ==================================================
  INT-MAP / 地図のズーム・遷移・モバイル表示制御
  ここは後から編集しやすいように、各機能ごとに小さな塊として整理しています。
================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const intMapLayouts = document.querySelectorAll(".map-accordion-layout");

  intMapLayouts.forEach((layout) => {
    const shell = layout.querySelector("[data-int-map]");
    const toggleButton = layout.querySelector("[data-int-map-open]");
    const closeButton = layout.querySelector("[data-int-map-close]");
    const scrollArea = layout.querySelector("[data-map-scroll]");
    const canvas = layout.querySelector("[data-map-canvas]");
    const zoomInButton = layout.querySelector("[data-map-zoom-in]");
    const zoomOutButton = layout.querySelector("[data-map-zoom-out]");
    const zoomResetButton = layout.querySelector("[data-map-zoom-reset]");
    const mapIcons = layout.querySelectorAll(".map-icon");
    const mapHintButtons = layout.querySelectorAll(".map-term");

    // どの要素が無くてもページ全体には影響しないようにする。
    if (!shell || !toggleButton || !canvas || !scrollArea) return;

    let zoomLevel = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let startPanX = 0;
    let startPanY = 0;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const updateMapTransform = () => {
      const viewportWidth = scrollArea.clientWidth || 1;
      const viewportHeight = scrollArea.clientHeight || 1;
      const maxPanX = Math.max(0, (viewportWidth * zoomLevel - viewportWidth) / 2);
      const maxPanY = Math.max(0, (viewportHeight * zoomLevel - viewportHeight) / 2);

      panX = clamp(panX, -maxPanX, maxPanX);
      panY = clamp(panY, -maxPanY, maxPanY);

      canvas.style.setProperty("--map-zoom", zoomLevel.toFixed(2));
      canvas.style.setProperty("--map-pan-x", `${panX}px`);
      canvas.style.setProperty("--map-pan-y", `${panY}px`);
      canvas.setAttribute("data-map-zoom", zoomLevel.toFixed(2));
    };

    const setZoom = (nextZoom) => {
      zoomLevel = Math.min(5.1, Math.max(1, nextZoom));
      updateMapTransform();
    };

    const openMobileMap = () => {
      shell.classList.add("is-map-open");
      toggleButton.setAttribute("aria-expanded", "true");
    };

    const closeMobileMap = () => {
      shell.classList.remove("is-map-open");
      toggleButton.setAttribute("aria-expanded", "false");
    };

    const focusAccordion = (targetId) => {
      const target = document.getElementById(targetId);
      if (!target) return;

      const summary = target.querySelector("summary");
      if (summary && !target.hasAttribute("open")) {
        summary.click();
      }

      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };

    const highlightIcon = (icon) => {
      mapIcons.forEach((item) => item.classList.remove("is-locating"));
      icon.classList.add("is-locating");
      clearTimeout(icon._locatingTimer);
      icon._locatingTimer = setTimeout(() => {
        icon.classList.remove("is-locating");
      }, 1400);
    };

    // ツールバーのボタン操作
    zoomInButton?.addEventListener("click", () => setZoom(zoomLevel + 0.3));
    zoomOutButton?.addEventListener("click", () => setZoom(zoomLevel - 0.3));
    zoomResetButton?.addEventListener("click", () => {
      zoomLevel = 1;
      panX = 0;
      panY = 0;
      updateMapTransform();
    });

    // 地図のドラッグで見回す
    const stopDragging = () => {
      isDragging = false;
      scrollArea.style.cursor = "grab";
    };

    scrollArea.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      if (event.target.closest("button, .map-icon")) return;

      isDragging = true;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      startPanX = panX;
      startPanY = panY;
      scrollArea.setPointerCapture(event.pointerId);
      scrollArea.style.cursor = "grabbing";
      event.preventDefault();
    });

    scrollArea.addEventListener("pointermove", (event) => {
      if (!isDragging) return;

      panX = startPanX + (event.clientX - dragStartX);
      panY = startPanY + (event.clientY - dragStartY);
      updateMapTransform();
    });

    scrollArea.addEventListener("pointerup", stopDragging);
    scrollArea.addEventListener("pointercancel", stopDragging);
    scrollArea.addEventListener("pointerleave", () => {
      if (!isDragging) return;
      stopDragging();
    });

    window.addEventListener("resize", updateMapTransform);

    // モバイル時の地図表示切り替え
    toggleButton.addEventListener("click", () => {
      if (!window.matchMedia("(max-width: 980px)").matches) return;
      const isOpen = shell.classList.contains("is-map-open");
      if (isOpen) {
        closeMobileMap();
      } else {
        openMobileMap();
      }
    });

    closeButton?.addEventListener("click", closeMobileMap);

    // マップアイコンまたはヒントボタンから該当アコーディオンへ移動
    mapIcons.forEach((icon) => {
      icon.addEventListener("click", (event) => {
        event.preventDefault();
        const targetId = icon.getAttribute("data-map-target");
        if (!targetId) return;
        focusAccordion(targetId);
        highlightIcon(icon);
        closeMobileMap();
      });
    });

    mapHintButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const targetId = button.getAttribute("data-map-target");
        if (!targetId) return;
        focusAccordion(targetId);
        closeMobileMap();
      });
    });

    // 画面が大きい時は常に地図を見せるようにしておく。
    if (!window.matchMedia("(max-width: 980px)").matches) {
      openMobileMap();
    } else {
      closeMobileMap();
    }

    // 初期状態のズームと位置を反映しておく。
    updateMapTransform();
  });
});

/* ==================================================
  DATABASE / 全体横断検索ボックス
  sub-tabs と int-map-hint の間に配置し、database 全体の
  summary を横断検索して候補を出す。候補をクリックすると
  該当パネルへ移動して該当アコーディオンを開く。
  後から編集しやすいよう、1機能1ブロックに分けてあります。
================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const panelLabels = {
    nation: "国家、勢力",
    characters: "人物設定",
    geography: "地理用語",
    armament: "兵器、兵装",
    record: "記録",
    chronicle: "歴史",
    words: "用語集",
    afterword: "後記"
  };

  const createSearchBox = (panel) => {
    const subTabs = panel.querySelector(".sub-tabs");

    if (!subTabs) return;

    const searchBox = document.createElement("div");
    searchBox.className = "database-search-box";

    const searchInput = document.createElement("input");
    searchInput.type = "search";
    searchInput.className = "database-search-input";
    searchInput.placeholder = "項目を検索";
    searchInput.setAttribute("aria-label", "データベース内検索");

    const resultList = document.createElement("div");
    resultList.className = "database-search-results";
    resultList.setAttribute("aria-live", "polite");

    // ルート要素を持たせておくと、入力欄や候補リストの外側をクリックした時の
    // 非表示制御がしやすくなります。後で見直ししやすいように、ここは独立したブロックとして残しています。
    searchBox.appendChild(searchInput);
    searchBox.appendChild(resultList);
    subTabs.insertAdjacentElement("afterend", searchBox);

    return { searchInput, resultList, searchBox };
  };

  const getPanelName = (panel) => {
    const rawPanelKey = panel.className.match(/panel-([a-z-]+)/)?.[1] || "";
    return panelLabels[rawPanelKey] || panel.dataset.panelName || "DATABASE";
  };

  const getStackName = (stack) => {
    return stack.dataset.stackTitle || stack.id || "SECTION";
  };

  const openTargetAccordion = (detail, panel) => {
    if (!detail) return;

    const panelKey = panel.className.match(/panel-([a-z-]+)/)?.[1];
    const radio = panelKey ? document.getElementById(`tab-${panelKey}`) : null;

    if (radio) {
      radio.checked = true;
    }

    requestAnimationFrame(() => {
      const summary = detail.querySelector("summary");
      if (summary && !detail.hasAttribute("open")) {
        summary.click();
      }

      detail.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const searchEntries = [];

  document.querySelectorAll(".db-panel").forEach((panel) => {
    const panelName = getPanelName(panel);

    panel.querySelectorAll(".accordion-stack").forEach((stack) => {
      const stackName = getStackName(stack);

      stack.querySelectorAll("details").forEach((detail) => {
        const summary = detail.querySelector("summary");
        const title = summary?.textContent.trim();

        if (!title) return;

        searchEntries.push({
          title,
          panelName,
          stackName,
          detail,
          panel,
          path: `${panelName} → ${stackName} → ${title}`
        });
      });
    });

    const searchBox = createSearchBox(panel);
    if (!searchBox) return;

    const { searchInput, resultList, searchBox: searchBoxRoot } = searchBox;

    const renderResults = (query) => {
      const normalized = query.trim().toLowerCase();

      if (!normalized) {
        resultList.classList.remove("is-visible");
        resultList.innerHTML = "";
        return;
      }

      const filtered = searchEntries.filter((entry) => {
        const haystack = `${entry.title} ${entry.panelName} ${entry.stackName}`.toLowerCase();
        return haystack.includes(normalized);
      }).slice(0, 10);

      resultList.innerHTML = "";

      if (!filtered.length) {
        resultList.classList.add("is-visible");

        const emptyState = document.createElement("div");
        emptyState.className = "database-search-empty";
        emptyState.textContent = "一致する項目がありません";
        resultList.appendChild(emptyState);
        return;
      }

      filtered.forEach((entry) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "database-search-result";

        const titleWrap = document.createElement("span");
        titleWrap.className = "database-search-title";
        titleWrap.textContent = entry.title;

        const pathWrap = document.createElement("span");
        pathWrap.className = "database-search-path";
        pathWrap.textContent = `${entry.panelName} → ${entry.stackName}`;

        button.appendChild(titleWrap);
        button.appendChild(pathWrap);

        button.addEventListener("click", () => {
          openTargetAccordion(entry.detail, entry.panel);
          resultList.classList.remove("is-visible");
          searchInput.value = entry.title;
        });

        resultList.appendChild(button);
      });

      resultList.classList.add("is-visible");
    };

    searchInput.addEventListener("input", (event) => {
      renderResults(event.target.value);
    });

    searchInput.addEventListener("focus", () => {
      if (searchInput.value.trim()) {
        renderResults(searchInput.value);
      }
    });

    document.addEventListener("click", (event) => {
      if (!searchBoxRoot.contains(event.target)) {
        resultList.classList.remove("is-visible");
      }
    });
  });
});

/* SPECIALカードの拡大表示 */
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector(".special-modal");
  const closeControls = modal ? modal.querySelectorAll("[data-special-modal-close]") : [];
  const modalImage = modal ? modal.querySelector(".special-modal-image") : null;
  const modalType = modal ? modal.querySelector(".special-modal-type") : null;
  const modalTitle = modal ? modal.querySelector(".special-modal-title") : null;
  const modalDescription = modal ? modal.querySelector(".special-modal-description") : null;
  const modalDownload = modal ? modal.querySelector(".special-modal-download") : null;
  const cards = document.querySelectorAll(".special-card");

  if (!modal || !modalImage || !modalType || !modalTitle || !modalDescription || !modalDownload) return;

  const openModal = (card) => {
    const image = card.querySelector("img");
    const type = card.querySelector(".eyebrow");
    const title = card.querySelector("h2");
    const description = card.querySelector("div > p:last-of-type");
    if (!image || !type || !title || !description) return;

    modalImage.src = image.src;
    modalImage.alt = title.textContent.trim();
    modalType.textContent = type.textContent.trim();
    modalTitle.textContent = title.textContent.trim();
    modalDescription.textContent = description.textContent.trim();
    modalDownload.href = image.src;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => openModal(card));
  });

  closeControls.forEach((control) => {
    control.addEventListener("click", (event) => {
      event.preventDefault();
      closeModal();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });
});

/* CHRONICLEのクリック注釈 */
const notePopover = document.querySelector("[data-note-popover]");

document.addEventListener("click", (event) => {
  const term = event.target.closest("[data-note]");

  if (!notePopover) return;

  if (!term) {
    notePopover.classList.remove("is-visible");
    notePopover.setAttribute("aria-hidden", "true");
    return;
  }

  event.stopPropagation();
  const rect = term.getBoundingClientRect();
  notePopover.textContent = term.dataset.note;
  notePopover.style.left = `${Math.min(rect.left, window.innerWidth - 280)}px`;
  notePopover.style.top = `${rect.bottom + 10}px`;
  notePopover.classList.add("is-visible");
  notePopover.setAttribute("aria-hidden", "false");
});

/* gsapでのトップページアニメーション(修正予定) */

gsap.from(".news-list", {
  opacity: 0,
  y: 50,
  duration: 1,

  scrollTrigger: {
    trigger: ".news-list",
    start: "top 80%"
  }
});

gsap.from(".top-character-card", {
  opacity: 0,
  y: 80,
  stagger: 0.2,

  scrollTrigger: {
    trigger: ".top-character-grid",
    start: "top 80%"
  }
});

/* トップページビジュアルのアニメーション。どうやらdurationがアニメーションの秒数（ｓ） */

gsap.from(".toppage-visual", {
  opacity: 0,
  x: -100,
  duration: 0.7,

  scrollTrigger: {
    trigger: ".toppage-visual",
    start: "top 50%"
  }
});

/* ==================================================
  DATABASE / アコーディオン開閉アニメーション
  details の標準開閉に頼らず、開閉をすべてJSで制御する版
  コピペママなので、ちゃんと調べること。今後のために。
================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // databaseページ内の全アコーディオン項目を取得
  const accordionItems = document.querySelectorAll(".accordion-stack details");

  accordionItems.forEach((detail) => {
    const summary = detail.querySelector("summary");
    const body = detail.querySelector(".accordion-body");

    // 必須要素が無ければ何もしない
    if (!summary || !body) return;

    // 初期状態では body を閉じておく
    if (!detail.hasAttribute("open")) {
      body.style.height = "0px";
    }

    summary.addEventListener("click", (event) => {
      // details の標準開閉は毎回止める
      event.preventDefault();

      const isOpen = detail.hasAttribute("open");
      const isAnimating = detail.classList.contains("is-opening") || detail.classList.contains("is-closing");

      // 開閉アニメーション中の連打は無視
      if (isAnimating) return;

      if (isOpen) {
        closeAccordion(detail, body);
      } else {
        openAccordion(detail, body);
      }
    });
  });

  /**
   * アコーディオンを開く
   * 1. summaryを2回明滅
   * 2. 枠を下に伸ばす
   * 3. 本文を明滅表示
   */
function openAccordion(detail, body) {
  // 開く途中フラグ
  detail.classList.add("is-opening");
  detail.classList.add("is-blinking");
  console.log(detail.className);
  console.log("1: open start", detail);

  // summary の明滅時間
  const blinkDuration = 300;

  setTimeout(() => {
    // 明滅終了
    detail.classList.remove("is-blinking");

    // ここで初めて open を付ける
    detail.setAttribute("open", "");

    // 本文表示アニメーションのクラスを一旦外して初期化
    detail.classList.remove("is-content-visible");

    /*
      -----------------------------
      ここが重要
      まず「本来の高さ」を測る
      -----------------------------
      body が height: 0 のままだと scrollHeight が期待通り取れない場合があるので、
      一旦 auto にして自然な高さを読みに行く
    */
    body.style.transition = "none";
    body.style.height = "auto";

    const targetHeight = body.scrollHeight;
    console.log("2: targetHeight =", targetHeight);

    /*
      その後、アニメーション開始位置として 0px に戻す
      ここで一度描画を挟んでから targetHeight に伸ばす
    */
    body.style.height = "0px";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        console.log("3: animate to", targetHeight);
        let didFinishExpand = false;

        const finishExpand = () => {
          if (didFinishExpand) return;
          didFinishExpand = true;

          body.removeEventListener("transitionend", onExpandEnd);

          // 本文を明滅表示
          detail.classList.add("is-content-visible");

          // 開ききったら auto に戻しておく
          body.style.transition = "";
          body.style.height = "auto";

          // 開く途中フラグ解除
          detail.classList.remove("is-opening");
        };

        const onExpandEnd = (e) => {
          if (e.propertyName !== "height") return;
          finishExpand();
        };

        body.addEventListener("transitionend", onExpandEnd);

        // ここで初めて 0 → targetHeight の変化を作る
        body.style.transition = "height 0.3s ease";
        body.style.height = `${targetHeight}px`;

        // 万一 transitionend が拾えなかった時の保険
        if (targetHeight === 0) {
          finishExpand();
        } else {
          setTimeout(finishExpand, 700);
        }
      });
    });
  }, blinkDuration);
}

  /**
   * アコーディオンを閉じる
   * 今回は閉じる時の明滅は入れず、素直に縮める
   */
  function closeAccordion(detail, body) {
    detail.classList.add("is-closing");

    // 本文表示アニメーションのクラスを外す
    detail.classList.remove("is-content-visible");
    detail.classList.remove("is-blinking");
    detail.classList.remove("is-opening");

    // auto のままだと 0 にアニメーションできないので、
    // 現在の高さを一度 px 固定する
    const currentHeight = body.scrollHeight;
    body.style.transition = "none";
    body.style.height = `${currentHeight}px`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        let didFinishClose = false;

        const finishClose = () => {
          if (didFinishClose) return;
          didFinishClose = true;

          body.removeEventListener("transitionend", onCloseEnd);

          // 完全に閉じたら open を外す
          detail.removeAttribute("open");

          detail.classList.remove("is-closing");
        };

        const onCloseEnd = (e) => {
          if (e.propertyName !== "height") return;
          finishClose();
        };

        body.addEventListener("transitionend", onCloseEnd);

        // ここで 0 に向かって縮める
        body.style.transition = "height 0.45s ease";
        body.style.height = "0px";

        if (currentHeight === 0) {
          finishClose();
        } else {
          setTimeout(finishClose, 550);
        }
      });
    });
  }
});
