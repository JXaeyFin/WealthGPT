const emptyPortfolio = {
  metrics: { return: "--", risk: "--", sharpe: "--", concentration: "--" },
  metricValues: { return: NaN, risk: NaN, sharpe: NaN, concentration: NaN },
  note: "Run an analysis to populate the portfolio allocation and sector breakdown.",
  holdings: [],
  sectors: []
};

let portfolioData = { max: emptyPortfolio, min: emptyPortfolio };
let researchData = [];

const TSX_60_MEMBERS = new Set([
  "RY.TO", "TD.TO", "BMO.TO", "BNS.TO", "NA.TO", "CM.TO", "ENB.TO", "TRP.TO",
  "SU.TO", "CNQ.TO", "CVE.TO", "POW.TO", "SLF.TO", "MFC.TO", "FFH.TO", "BAM.TO",
  "BN.TO", "FTS.TO", "EMA.TO", "TRI.TO", "CSU.TO", "WCN.TO", "WSP.TO", "CNR.TO",
  "CP.TO", "ATD.TO", "DOL.TO", "QSR.TO", "MRU.TO", "SHOP.TO", "GIB-A.TO",
  "WPM.TO", "FNV.TO", "AEM.TO", "ABX.TO", "TECK-B.TO", "NTR.TO", "CCO.TO",
  "BCE.TO", "T.TO", "RCI-B.TO"
]);

const NASDAQ_100_MEMBERS = new Set([
  "AAPL", "ADBE", "ADI", "ADP", "AMD", "AMGN", "AMZN", "APP", "ARM", "ASML",
  "AVGO", "BKNG", "CDW", "CHTR", "CMCSA", "COST", "CPRT", "CRWD", "CSCO", "CSX",
  "CTAS", "DASH", "DDOG", "DXCM", "EA", "EXC", "FAST", "FANG", "FTNT", "GILD",
  "GOOG", "GOOGL", "IDXX", "INTC", "ISRG", "KDP", "KLAC", "LRCX", "MAR", "MCHP",
  "MDLZ", "META", "MNST", "MRVL", "MSFT", "MU", "NFLX", "NVDA", "NXPI", "ODFL",
  "ORLY", "PANW", "PAYX", "PCAR", "PEP", "PLTR", "QCOM", "REGN", "ROP", "ROST",
  "SBUX", "SHOP", "SNPS", "TEAM", "TMUS", "TSLA", "TTWO", "TXN", "VRTX", "WBD",
  "WDAY", "XEL", "ZS"
]);

const SP_500_MEMBERS = new Set([
  "AAPL", "ABBV", "ABT", "ACN", "ADBE", "AIG", "AMD", "AMGN", "AMT", "AMZN",
  "AVGO", "AXP", "BA", "BAC", "BK", "BKNG", "BLK", "BMY", "BRK-B", "C", "CAT",
  "CL", "CMCSA", "COF", "COP", "COST", "CRM", "CSCO", "CVS", "CVX", "DHR",
  "DIS", "DOW", "GE", "GILD", "GM", "GOOG", "GOOGL", "GS", "HD", "HON", "IBM",
  "INTC", "JNJ", "JPM", "KHC", "KO", "LIN", "LLY", "LOW", "MA", "MCD", "META",
  "MET", "MMM", "MRK", "MS", "MSFT", "NEE", "NFLX", "NKE", "NVDA", "ORCL",
  "PEP", "PFE", "PG", "PM", "QCOM", "RTX", "SBUX", "SCHW", "SO", "SPG", "T",
  "TGT", "TMO", "TMUS", "TSLA", "TXN", "UNH", "UNP", "UPS", "USB", "V", "VZ",
  "WFC", "WMT", "XOM"
]);

const FTSE_100_MEMBERS = new Set([
  "AZN.L", "ULVR.L", "SHEL.L", "BP.L", "HSBA.L", "GSK.L", "RIO.L", "BATS.L",
  "DGE.L", "GLEN.L", "AAL.L", "LSEG.L", "NG.L", "VOD.L", "REL.L", "CPG.L",
  "SMIN.L", "IMB.L", "CRH.L", "SN.L"
]);

const EURO_STOXX_50_MEMBERS = new Set([
  "ASML.AS", "SAP.DE", "SIE.DE", "AIR.PA", "OR.PA", "MC.PA", "SAN.PA", "BNP.PA",
  "ENGI.PA", "AI.PA", "RMS.PA", "DG.PA", "ENEL.MI", "ISP.MI", "ENI.MI",
  "STLA.MI", "ABI.BR", "PHIA.AS", "AD.AS"
]);

function marketMetadata(ticker, listing = {}) {
  const normalized = String(ticker || "").toUpperCase();
  const dynamicExchange = listing.exchange || listing.fullExchangeName;
  const dynamicCountry = listing.country;
  const dynamicFlag = listing.flag;
  const dynamicSource = listing.source || "Ticker reference";
  if (normalized.endsWith(".TO")) {
    return {
      flag: dynamicFlag || "🇨🇦",
      market: String(dynamicCountry || "CANADA").toUpperCase(),
      exchange: dynamicExchange || "Toronto Stock Exchange (TSX)",
      source: dynamicSource,
      references: TSX_60_MEMBERS.has(normalized)
        ? ["S&P/TSX 60", "XIU.TO"]
        : ["S&P/TSX Composite", "XIC.TO"]
    };
  }
  if (normalized.endsWith(".L")) {
    return {
      flag: dynamicFlag || "🇬🇧",
      market: String(dynamicCountry || "UNITED KINGDOM").toUpperCase(),
      exchange: dynamicExchange || "London Stock Exchange (LSE)",
      source: dynamicSource,
      references: FTSE_100_MEMBERS.has(normalized) ? ["FTSE 100", "ISF.L"] : ["FTSE All-Share", "ISF.L"]
    };
  }
  if (normalized.endsWith(".PA")) {
    return {
      flag: dynamicFlag || "🇫🇷",
      market: String(dynamicCountry || "FRANCE").toUpperCase(),
      exchange: dynamicExchange || "Euronext Paris",
      source: dynamicSource,
      references: EURO_STOXX_50_MEMBERS.has(normalized) ? ["EURO STOXX 50", "FEZ"] : ["CAC 40 / Europe", "EWQ"]
    };
  }
  if (normalized.endsWith(".AS")) {
    return {
      flag: dynamicFlag || "🇳🇱",
      market: String(dynamicCountry || "NETHERLANDS").toUpperCase(),
      exchange: dynamicExchange || "Euronext Amsterdam",
      source: dynamicSource,
      references: EURO_STOXX_50_MEMBERS.has(normalized) ? ["EURO STOXX 50", "FEZ"] : ["AEX / Europe", "EWN"]
    };
  }
  if (normalized.endsWith(".DE")) {
    return {
      flag: dynamicFlag || "🇩🇪",
      market: String(dynamicCountry || "GERMANY").toUpperCase(),
      exchange: dynamicExchange || "Xetra / Frankfurt",
      source: dynamicSource,
      references: EURO_STOXX_50_MEMBERS.has(normalized) ? ["DAX / EURO STOXX 50", "EWG / FEZ"] : ["DAX", "EWG"]
    };
  }
  if (normalized.endsWith(".MI")) {
    return {
      flag: dynamicFlag || "🇮🇹",
      market: String(dynamicCountry || "ITALY").toUpperCase(),
      exchange: dynamicExchange || "Borsa Italiana",
      source: dynamicSource,
      references: EURO_STOXX_50_MEMBERS.has(normalized) ? ["FTSE MIB / EURO STOXX 50", "EWI / FEZ"] : ["FTSE MIB", "EWI"]
    };
  }
  if (normalized.endsWith(".BR")) {
    return { flag: dynamicFlag || "🇧🇪", market: String(dynamicCountry || "BELGIUM").toUpperCase(), exchange: dynamicExchange || "Euronext Brussels", source: dynamicSource, references: ["BEL 20 / Europe", "EWK"] };
  }
  if (normalized.endsWith(".SW")) {
    return { flag: dynamicFlag || "🇨🇭", market: String(dynamicCountry || "SWITZERLAND").toUpperCase(), exchange: dynamicExchange || "SIX Swiss Exchange", source: dynamicSource, references: ["SMI", "EWL"] };
  }

  const references = [];
  if (SP_500_MEMBERS.has(normalized)) references.push("S&P 500", "SPY");
  if (NASDAQ_100_MEMBERS.has(normalized)) references.push("Nasdaq-100", "QQQ");
  if (!references.length) references.push("U.S. Total Market", "VTI");
  return {
    flag: dynamicFlag || "🇺🇸",
    market: String(dynamicCountry || "UNITED STATES").toUpperCase(),
    exchange: dynamicExchange || "NYSE / Nasdaq",
    source: dynamicSource,
    references
  };
}

function financeClass(value, neutral = false) {
  const numeric = Number(value);
  if (neutral || !Number.isFinite(numeric) || numeric === 0) return "finance-neutral";
  return numeric > 0 ? "finance-positive" : "finance-negative";
}

function setFinanceValue(elementId, value, text, neutral = false) {
  const element = document.getElementById(elementId);
  element.textContent = text;
  element.classList.remove("finance-positive", "finance-negative", "finance-neutral");
  element.classList.add(financeClass(value, neutral));
}

const pageTitles = {
  overview: "Overview",
  portfolios: "Portfolios",
  research: "AI Research",
  settings: "Run Settings",
  console: "Run Console",
  report: "Report"
};

function showView(viewName) {
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
  document.getElementById(`${viewName}-view`).classList.add("active");
  document.querySelector(`[data-view="${viewName}"]`).classList.add("active");
  document.getElementById("page-title").textContent = pageTitles[viewName];
  history.replaceState(null, "", `#${viewName}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderPortfolio(key) {
  const data = portfolioData[key];
  const isMin = key === "min";
  setFinanceValue("portfolio-return", data.metricValues.return, data.metrics.return);
  setFinanceValue("portfolio-risk", data.metricValues.risk, data.metrics.risk, true);
  setFinanceValue("portfolio-sharpe", data.metricValues.sharpe, data.metrics.sharpe);
  setFinanceValue("portfolio-concentration", data.metricValues.concentration, data.metrics.concentration, true);
  document.getElementById("portfolio-note").textContent = data.note;

  const maxWeight = Math.max(...data.holdings.map((holding) => holding[1]));
  document.getElementById("holdings-bars").innerHTML = data.holdings.length ? data.holdings.map(([ticker, weight]) => `
    <div class="holding-row ${isMin ? "min" : ""}">
      <strong>${ticker}</strong>
      <div class="bar-track"><div class="bar-fill" style="width:${(weight / maxWeight) * 100}%"></div></div>
      <span class="holding-weight finance-neutral">${weight.toFixed(2)}%</span>
    </div>
  `).join("") : '<div class="empty-state">No completed allocation is available.</div>';

  let runningTotal = 0;
  const gradientStops = data.sectors.map(([, value, color]) => {
    const start = runningTotal;
    runningTotal += value;
    return `${color} ${start}% ${runningTotal}%`;
  });
  document.getElementById("sector-donut").style.background = gradientStops.length
    ? `conic-gradient(${gradientStops.join(",")})`
    : "#edf2f5";
  document.getElementById("sector-legend").innerHTML = data.sectors.length ? data.sectors.map(([sector, value, color]) => `
    <div class="sector-item">
      <i class="sector-swatch" style="background:${color}"></i>
      <span>${sector}</span>
      <strong class="finance-neutral">${value.toFixed(1)}%</strong>
    </div>
  `).join("") : '<span class="terminal-muted">Awaiting run</span>';
}

function renderResearch(query = "") {
  const normalized = query.trim().toLowerCase();
  const filtered = researchData.filter((item) =>
    `${item.ticker} ${item.industry} ${item.thesis}`.toLowerCase().includes(normalized)
  );
  const container = document.getElementById("research-list");
  if (!filtered.length) {
    container.innerHTML = `<div class="empty-state">${normalized ? "No research views match that search." : "No completed research run is available."}</div>`;
    return;
  }
  container.innerHTML = filtered.map((item) => `
    <article class="research-card">
      <div class="ticker-block">
        <div class="ticker-line"><strong>${item.ticker}</strong><span class="market-flag" title="${item.exchange}">${item.flag}</span></div>
        <span>${item.industry}</span>
        <div class="market-meta">
          <span class="market-badge">${item.market}</span>
          <span class="exchange-label">${item.exchange}${item.listingDetails ? ` · ${item.listingDetails}` : ""}</span>
          <span class="listing-source">${item.source === "Yahoo Finance" ? "YF LIVE" : "FALLBACK"}</span>
        </div>
        <div class="index-strip">
          <small>INDEX / ETF</small>
          ${item.references.map((reference) => `<b>${reference}</b>`).join("")}
        </div>
      </div>
      <div class="research-thesis">${item.thesis}</div>
      <div class="research-stat"><span>Posterior return</span><strong class="${financeClass(item.posteriorValue)}">${item.posterior}</strong></div>
      <div class="research-stat">
        <span>Confidence</span><strong class="finance-neutral">${item.confidence}%</strong>
        <div class="confidence-track"><i style="width:${item.confidence}%"></i></div>
      </div>
    </article>
  `).join("");
}

function formatPercent(value, digits = 1) {
  return Number.isFinite(Number(value)) ? `${(Number(value) * 100).toFixed(digits)}%` : "N/A";
}

function formatDuration(config) {
  const training = Number(config.trainingYears);
  const trainingText = training < 1
    ? `${Math.round(training * 12)} months`
    : `${training.toFixed(training % 1 ? 2 : 0)} ${training === 1 ? "year" : "years"}`;
  const oos = Number(config.oosMonths);
  return {
    training: trainingText,
    oos: oos === 0 ? "Disabled" : `${oos} ${oos === 1 ? "month" : "months"}`
  };
}

function livePortfolio(portfolio, metrics) {
  const holdings = (portfolio.holdings || []).map((item) => [
    item.ticker,
    Number(item.weight) * 100
  ]);
  const topFive = holdings.slice(0, 5).reduce((sum, item) => sum + item[1], 0);
  const palette = ["#f4f5f6", "#3ad17d", "#aeb5bd", "#737b85", "#d8dce0", "#ff5e68", "#555d66"];
  return {
    metricValues: {
      return: Number(metrics.return),
      risk: Number(metrics.risk),
      sharpe: Number(metrics.sharpe),
      concentration: topFive / 100
    },
    metrics: {
      return: formatPercent(metrics.return),
      risk: formatPercent(metrics.risk),
      sharpe: Number(metrics.sharpe).toFixed(2),
      concentration: `${topFive.toFixed(1)}%`
    },
    note: `Largest sector exposure is ${portfolio.sectors?.[0]?.sector || "unclassified"} at ${formatPercent(portfolio.sectors?.[0]?.weight || 0)}. Maximum position was constrained by the completed run configuration.`,
    holdings,
    sectors: (portfolio.sectors || []).map((item, index) => [
      item.sector,
      Number(item.weight) * 100,
      palette[index % palette.length]
    ])
  };
}

function chartPath(values, minimum, maximum) {
  if (!values?.length) return "";
  const left = 48;
  const right = 730;
  const top = 35;
  const bottom = 235;
  const span = maximum - minimum || 1;
  return values.map((rawValue, index) => {
    const x = left + (index / Math.max(values.length - 1, 1)) * (right - left);
    const y = bottom - ((Number(rawValue) - minimum) / span) * (bottom - top);
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

function renderPerformance(performance) {
  if (!performance?.dates?.length || !performance.series) return;
  const maxSeries = performance.series.Max_Sharpe || [];
  const minSeries = performance.series.Min_Vol || [];
  const benchmarkName = Object.keys(performance.series).find((name) => !["Max_Sharpe", "Min_Vol"].includes(name));
  const benchmarkSeries = benchmarkName ? performance.series[benchmarkName] : [];
  const allValues = [...maxSeries, ...minSeries, ...benchmarkSeries].map(Number).filter(Number.isFinite);
  if (!allValues.length) return;
  const minimum = Math.min(...allValues);
  const maximum = Math.max(...allValues);
  document.getElementById("chart-max").setAttribute("d", chartPath(maxSeries, minimum, maximum));
  document.getElementById("chart-min").setAttribute("d", chartPath(minSeries, minimum, maximum));
  document.getElementById("chart-benchmark").setAttribute("d", chartPath(benchmarkSeries, minimum, maximum));

  const dates = performance.dates;
  const labelIndexes = [...new Set([0, Math.floor((dates.length - 1) / 2), dates.length - 1])];
  document.getElementById("chart-axis-labels").innerHTML = labelIndexes.map((index, position) => {
    const date = new Date(dates[index]);
    const x = 48 + (index / Math.max(dates.length - 1, 1)) * (730 - 48);
    const anchor = position === 0 ? "start" : position === labelIndexes.length - 1 ? "end" : "middle";
    const label = date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
    return `<text x="${x.toFixed(1)}" y="275" text-anchor="${anchor}">${label}</text>`;
  }).join("");
}

function applyLiveResults(results) {
  if (!results?.metrics || !results?.portfolios || !results?.config) return;
  const isExample = results.dataMode === "example";
  currentResultMode = isExample ? "example" : "live";
  const durations = formatDuration(results.config);
  document.getElementById("hero-training").textContent = durations.training;
  document.getElementById("hero-oos").textContent = durations.oos;
  document.getElementById("hero-cap").textContent = `${Number(results.config.maxPositionPercent).toFixed(0)}%`;
  document.getElementById("data-date").textContent = isExample
    ? `${results.snapshotLabel || "Bundled example"} · Data through ${results.dataThrough || "snapshot date"}`
    : `Live run · Data through ${results.dataThrough || "latest completed run"}`;
  document.getElementById("data-mode").textContent = isExample ? "WEALTHGPT SNAPSHOT" : "WEALTHGPT LIVE";
  document.getElementById("run-label").textContent = isExample ? "Bundled example portfolio" : "Latest model run";

  setFinanceValue("overview-max-return", results.metrics.max.return, formatPercent(results.metrics.max.return));
  setFinanceValue("overview-max-risk", results.metrics.max.risk, formatPercent(results.metrics.max.risk), true);
  setFinanceValue("overview-max-sharpe", results.metrics.max.sharpe, Number(results.metrics.max.sharpe).toFixed(2));
  setFinanceValue("overview-min-return", results.metrics.min.return, formatPercent(results.metrics.min.return));
  setFinanceValue("overview-min-risk", results.metrics.min.risk, formatPercent(results.metrics.min.risk), true);
  setFinanceValue("overview-min-sharpe", results.metrics.min.sharpe, Number(results.metrics.min.sharpe).toFixed(2));

  portfolioData = {
    max: livePortfolio(results.portfolios.max, results.metrics.max),
    min: livePortfolio(results.portfolios.min, results.metrics.min)
  };
  const selectedPortfolio = document.querySelector("[data-portfolio].active")?.dataset.portfolio || "max";
  renderPortfolio(selectedPortfolio);

  researchData = (results.research || [])
    .filter((item) => item.view)
    .map((item) => {
      const market = marketMetadata(item.ticker, item.listing);
      return {
        ticker: item.ticker,
        industry: `${item.sector || "Unclassified"} / ${item.industry || "Not classified"}`,
        posterior: formatPercent(item.posteriorReturn),
        posteriorValue: Number(item.posteriorReturn),
        confidence: Math.round(Number(item.confidence || 0) * 100),
        thesis: item.view,
        listingDetails: [item.listing?.exchangeCode, item.listing?.currency].filter(Boolean).join(" · "),
        ...market
      };
    });
  renderResearch(document.getElementById("research-search").value);

  trainingRange.value = results.config.trainingYears;
  oosRange.value = results.config.oosMonths;
  positionRange.value = results.config.maxPositionPercent;
  document.getElementById("training-value").textContent = durations.training;
  document.getElementById("oos-value").textContent = durations.oos;
  document.getElementById("position-value").textContent = `${results.config.maxPositionPercent}%`;
  document.getElementById("remote-training").value = results.config.trainingYears;
  document.getElementById("remote-oos").value = results.config.oosMonths;
  document.getElementById("remote-position").value = results.config.maxPositionPercent;
  document.getElementById("remote-universe").value = results.config.universe;
  document.getElementById("remote-gpt").checked = Boolean(results.config.gptViews);
  document.getElementById("remote-refresh").checked = Boolean(results.config.refreshCache);
  renderPerformance(results.performance);
}

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => showView(item.dataset.view));
});

document.querySelectorAll("[data-shortcut-view]").forEach((item) => {
  item.addEventListener("click", () => showView(item.dataset.shortcutView));
});

const functionViews = ["overview", "portfolios", "research", "settings", "console", "report"];
document.addEventListener("keydown", (event) => {
  const match = /^F([1-6])$/.exec(event.key);
  if (!match) return;
  event.preventDefault();
  showView(functionViews[Number(match[1]) - 1]);
});

function updateTerminalClock() {
  const clock = document.getElementById("terminal-clock");
  if (!clock) return;
  clock.textContent = `${new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date())} ET`;
}

updateTerminalClock();
setInterval(updateTerminalClock, 1000);

document.querySelectorAll("[data-go]").forEach((item) => {
  item.addEventListener("click", () => showView(item.dataset.go));
});

document.getElementById("configure-button").addEventListener("click", () => showView("settings"));
document.getElementById("open-report-button").addEventListener("click", () => {
  showView("report");
  if (runnerConnected) refreshReportArtifacts();
});

document.querySelectorAll("[data-portfolio]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-portfolio]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderPortfolio(button.dataset.portfolio);
  });
});

document.getElementById("research-search").addEventListener("input", (event) => {
  renderResearch(event.target.value);
});

const trainingRange = document.getElementById("training-range");
const oosRange = document.getElementById("oos-range");
const positionRange = document.getElementById("position-range");

trainingRange.addEventListener("input", () => {
  document.getElementById("training-value").textContent = `${trainingRange.value} ${trainingRange.value === "1" ? "year" : "years"}`;
});

oosRange.addEventListener("input", () => {
  document.getElementById("oos-value").textContent = oosRange.value === "0" ? "Disabled" : `${oosRange.value} months`;
});

positionRange.addEventListener("input", () => {
  document.getElementById("position-value").textContent = `${positionRange.value}%`;
});

document.getElementById("save-settings").addEventListener("click", () => {
  const settings = {
    trainingYears: trainingRange.value,
    oosMonths: oosRange.value,
    maxPosition: positionRange.value,
    gptViews: document.getElementById("gpt-toggle").checked,
    universe: document.getElementById("universe-select").value
  };
  localStorage.setItem("wealthgpt-dashboard-settings", JSON.stringify(settings));
  document.getElementById("remote-training").value = settings.trainingYears;
  document.getElementById("remote-oos").value = settings.oosMonths;
  document.getElementById("remote-position").value = settings.maxPosition;
  document.getElementById("remote-gpt").checked = settings.gptViews;
  document.getElementById("settings-message").textContent = "Saved locally";
});

const runnerUrl = document.getElementById("runner-url");
const runnerToken = document.getElementById("runner-token");
const runnerState = document.getElementById("runner-state");
const runnerStart = document.getElementById("runner-start");
const runnerStop = document.getElementById("runner-stop");
const terminalOutput = document.getElementById("terminal-output");
const terminalRunId = document.getElementById("terminal-run-id");
const terminalLineCount = document.getElementById("terminal-line-count");
let runnerConnected = false;
let runnerOffset = 0;
let runnerPollTimer = null;
let terminalLines = 0;
let loadedResultRunId = null;
let legacyRunnerNoticeShown = false;
let pdfBlobUrl = null;
let chartBlobUrl = null;
let runnerCapabilities = {};
let artifactCompatibilityNoticeShown = false;
let analysisEnvironmentReady = false;
let currentResultMode = "empty";

const hostedRunnerUrl = location.protocol === "http:" || location.protocol === "https:"
  ? location.origin
  : runnerUrl.value;
runnerUrl.value = localStorage.getItem("wealthgpt-runner-url") || hostedRunnerUrl;

function runnerHeaders(includeJson = false) {
  const headers = {};
  if (includeJson) headers["Content-Type"] = "application/json";
  if (runnerToken.value) headers.Authorization = `Bearer ${runnerToken.value}`;
  return headers;
}

function runnerEndpoint(path) {
  return `${runnerUrl.value.trim().replace(/\/+$/, "")}${path}`;
}

async function runnerRequest(path, options = {}) {
  const response = await fetch(runnerEndpoint(path), {
    ...options,
    headers: { ...runnerHeaders(Boolean(options.body)), ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `Runner returned HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

function setRunnerState(status, label) {
  runnerState.className = `runner-state ${status}`;
  runnerState.querySelector("strong").textContent = label;
  const running = status === "running";
  runnerStart.disabled = !runnerConnected || !analysisEnvironmentReady || running;
  runnerStop.disabled = !runnerConnected || !running;
}

function applyRunConfig(config) {
  if (!config) return;
  const durations = formatDuration(config);
  document.getElementById("hero-training").textContent = durations.training;
  document.getElementById("hero-oos").textContent = durations.oos;
  document.getElementById("hero-cap").textContent = `${Number(config.maxPositionPercent).toFixed(0)}%`;
}

function appendTerminal(text, kind = "") {
  if (!text) return;
  if (terminalLines === 0) terminalOutput.textContent = "";
  const line = document.createElement("span");
  if (kind) line.className = `terminal-${kind}`;
  line.textContent = `${text}\n`;
  terminalOutput.appendChild(line);
  terminalLines += 1;
  terminalLineCount.textContent = `${terminalLines} ${terminalLines === 1 ? "line" : "lines"}`;
  if (document.getElementById("terminal-autoscroll").checked) {
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }
}

async function loadCompletedResults(status) {
  if (Number(status.api_version || 1) < 2) {
    if (!legacyRunnerNoticeShown) {
      appendTerminal("[relay] Runner update required. Restart server.py, then run the analysis again.", "error");
      legacyRunnerNoticeShown = true;
    }
    loadedResultRunId = status.run_id;
    return false;
  }
  try {
    const results = await runnerRequest("/api/results");
    applyLiveResults(results);
    loadedResultRunId = status.run_id || `persisted:${results.generatedAt || "latest"}`;
    appendTerminal(
      results.dataMode === "example"
        ? "[relay] Loaded bundled example portfolio and AI research"
        : "[relay] Dashboard updated with completed run results",
      "system"
    );
    await refreshReportArtifacts();
    return true;
  } catch (error) {
    if (error.status === 404) {
      appendTerminal("[relay] Run completed, but no live result file exists. Run it once more after restarting the service.", "error");
      loadedResultRunId = status.run_id;
      return false;
    }
    throw error;
  }
}

async function fetchArtifact(path) {
  const response = await fetch(runnerEndpoint(path), { headers: runnerHeaders(false) });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.error || `Artifact returned HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.blob();
}

function setReportState(status, label) {
  const element = document.getElementById("report-state");
  element.className = `runner-state ${status}`;
  element.querySelector("strong").textContent = label;
}

async function refreshReportArtifacts() {
  if (!runnerConnected) {
    setReportState("disconnected", "Runner disconnected");
    return;
  }
  if (!runnerCapabilities.artifacts) {
    setReportState("failed", "Runner restart required");
    document.getElementById("pdf-status").textContent = "Runner update required";
    document.getElementById("chart-status").textContent = "Runner update required";
    if (!artifactCompatibilityNoticeShown) {
      appendTerminal("[relay] Report viewer requires the updated runner. Stop server.py, restart it, then refresh this page.", "error");
      artifactCompatibilityNoticeShown = true;
    }
    return;
  }
  setReportState("running", "Loading artifacts");

  try {
    const pdfBlob = await fetchArtifact("/api/artifacts/pdf");
    if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    pdfBlobUrl = URL.createObjectURL(pdfBlob);
    const viewer = document.getElementById("pdf-viewer");
    viewer.src = pdfBlobUrl;
    viewer.style.display = "block";
    document.getElementById("pdf-placeholder").style.display = "none";
    document.getElementById("pdf-status").textContent = `${(pdfBlob.size / 1024).toFixed(0)} KB`;
    document.getElementById("download-report").disabled = false;
  } catch (error) {
    document.getElementById("pdf-status").textContent = "Unavailable";
    document.getElementById("pdf-placeholder").style.display = "grid";
    appendTerminal(`[relay] PDF: ${error.message}`, "error");
  }

  try {
    const chartBlob = await fetchArtifact("/api/artifacts/chart");
    if (chartBlobUrl) URL.revokeObjectURL(chartBlobUrl);
    chartBlobUrl = URL.createObjectURL(chartBlob);
    const image = document.getElementById("report-chart");
    image.src = chartBlobUrl;
    image.style.display = "block";
    document.getElementById("chart-placeholder").style.display = "none";
    document.getElementById("chart-status").textContent = `${(chartBlob.size / 1024).toFixed(0)} KB`;
  } catch (error) {
    document.getElementById("chart-status").textContent = error.status === 404 ? "OOS disabled" : "Unavailable";
    document.getElementById("chart-placeholder").style.display = "grid";
    if (error.status !== 404) appendTerminal(`[relay] Chart: ${error.message}`, "error");
  }
  const readyLabel = currentResultMode === "example" ? "Example report ready" : "Report ready";
  setReportState(pdfBlobUrl ? "connected" : "failed", pdfBlobUrl ? readyLabel : "Report unavailable");
}

async function pollRunner() {
  if (!runnerConnected) return;
  try {
    const [status, logs] = await Promise.all([
      runnerRequest("/api/status"),
      runnerRequest(`/api/logs?after=${runnerOffset}`)
    ]);
    logs.lines.forEach((entry) => {
      appendTerminal(entry.text, entry.stream === "system" ? "system" : entry.stream === "stderr" ? "error" : "");
      runnerOffset = Math.max(runnerOffset, entry.id);
    });
    terminalRunId.textContent = status.run_id ? `Run ${status.run_id}` : "No active run";
    runnerCapabilities = status.capabilities || {};
    analysisEnvironmentReady = Boolean(status.analysis_environment?.ready);
    applyRunConfig(status.config);
    if (status.status === "running" || status.status === "stopping") {
      setRunnerState("running", status.status === "stopping" ? "Stopping" : "Running");
    } else if (status.status === "failed") {
      setRunnerState("failed", "Run failed");
    } else {
      setRunnerState("connected", status.status === "completed" ? "Completed" : status.status === "stopped" ? "Stopped" : "Connected");
      if (status.status === "completed" && status.run_id !== loadedResultRunId) {
        await loadCompletedResults(status);
      }
    }
  } catch (error) {
    runnerConnected = false;
    setRunnerState("disconnected", "Disconnected");
    appendTerminal(`[relay] ${error.message}`, "error");
    clearInterval(runnerPollTimer);
    runnerPollTimer = null;
  }
}

async function connectRunner() {
  localStorage.setItem("wealthgpt-runner-url", runnerUrl.value.trim());
  setRunnerState("disconnected", "Connecting");
  try {
    const status = await runnerRequest("/api/status");
    runnerConnected = true;
    runnerCapabilities = status.capabilities || {};
    analysisEnvironmentReady = Boolean(status.analysis_environment?.ready);
    runnerOffset = 0;
    appendTerminal(`[relay] Connected to ${runnerUrl.value.trim()}`, "system");
    if (analysisEnvironmentReady) {
      appendTerminal(
        `[relay] Analysis Python ${status.analysis_environment.version}: ${status.analysis_environment.python}`,
        "system"
      );
    } else {
      appendTerminal(
        `[relay] Analysis environment unavailable: ${status.analysis_environment?.error || "server update required"}`,
        "error"
      );
    }
    setRunnerState(status.status === "running" ? "running" : "connected", status.status === "running" ? "Running" : "Connected");
    clearInterval(runnerPollTimer);
    runnerPollTimer = setInterval(pollRunner, 900);
    await pollRunner();
    if (status.results_available && !loadedResultRunId) await loadCompletedResults(status);
  } catch (error) {
    runnerConnected = false;
    setRunnerState("failed", "Connection failed");
    appendTerminal(`[relay] ${error.message}`, "error");
  }
}

document.getElementById("runner-connect").addEventListener("click", connectRunner);
document.getElementById("refresh-report").addEventListener("click", refreshReportArtifacts);
document.getElementById("download-report").addEventListener("click", () => {
  if (pdfBlobUrl) window.open(pdfBlobUrl, "_blank", "noopener");
});

runnerStart.addEventListener("click", async () => {
  const config = {
    trainingYears: Number(document.getElementById("remote-training").value),
    oosMonths: Number(document.getElementById("remote-oos").value),
    maxPositionPercent: Number(document.getElementById("remote-position").value),
    universe: document.getElementById("remote-universe").value,
    gptViews: document.getElementById("remote-gpt").checked,
    refreshCache: document.getElementById("remote-refresh").checked
  };
  try {
    if (config.trainingYears < 0.25 || config.trainingYears > 10) throw new Error("Training lookback must be between 0.25 and 10 years.");
    if (config.oosMonths < 0 || config.oosMonths > 60) throw new Error("OOS window must be between 0 and 60 months.");
    if (config.maxPositionPercent < 1 || config.maxPositionPercent > 100) throw new Error("Maximum position must be between 1% and 100%.");
    const result = await runnerRequest("/api/run", { method: "POST", body: JSON.stringify(config) });
    applyRunConfig(config);
    runnerOffset = 0;
    terminalOutput.textContent = "";
    terminalLines = 0;
    terminalLineCount.textContent = "0 lines";
    terminalRunId.textContent = `Run ${result.run_id}`;
    appendTerminal(`[relay] Run ${result.run_id} accepted`, "system");
    setRunnerState("running", "Running");
    await pollRunner();
  } catch (error) {
    appendTerminal(`[relay] ${error.message}`, "error");
  }
});

runnerStop.addEventListener("click", async () => {
  try {
    await runnerRequest("/api/stop", { method: "POST" });
    setRunnerState("running", "Stopping");
    appendTerminal("[relay] Stop requested", "system");
  } catch (error) {
    appendTerminal(`[relay] ${error.message}`, "error");
  }
});

document.getElementById("terminal-clear").addEventListener("click", () => {
  terminalOutput.textContent = "";
  terminalLines = 0;
  terminalLineCount.textContent = "0 lines";
});

document.getElementById("terminal-copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(terminalOutput.innerText);
    appendTerminal("[relay] Output copied to clipboard", "system");
  } catch {
    appendTerminal("[relay] Clipboard access was unavailable", "error");
  }
});

const initialView = location.hash.replace("#", "");
showView(pageTitles[initialView] ? initialView : "overview");
renderPortfolio("max");
renderResearch();
if (location.protocol === "http:" || location.protocol === "https:") connectRunner();
