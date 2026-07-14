const stages = [
  ["lead", "Lead", 10],
  ["qualified", "Qualificado", 30],
  ["proposal", "Proposta", 55],
  ["negotiation", "Negociação", 75],
  ["won", "Ganho", 100]
];

const demoDeals = [
  {
    id: "deal-1",
    company: "Solaris Tech",
    contact: "Marina Costa",
    product: "Plano Corporativo",
    value: 42000,
    probability: 75,
    owner: "Wesley",
    segment: "Tecnologia",
    nextFollowUp: "2026-07-08",
    stage: "negotiation",
    notes: "Aprovação financeira pendente."
  },
  {
    id: "deal-2",
    company: "Mercado Sakura",
    contact: "Renato Lima",
    product: "Implantação ERP",
    value: 28000,
    probability: 55,
    owner: "Ana",
    segment: "Varejo",
    nextFollowUp: "2026-07-11",
    stage: "proposal",
    notes: "Comparando com fornecedor atual."
  },
  {
    id: "deal-3",
    company: "Clínica Vida",
    contact: "Paula Ribeiro",
    product: "Suporte Premium",
    value: 15600,
    probability: 30,
    owner: "Wesley",
    segment: "Saúde",
    nextFollowUp: "2026-07-07",
    stage: "qualified",
    notes: "Precisa de contrato anual."
  },
  {
    id: "deal-4",
    company: "Orion Lab",
    contact: "Caio Mendes",
    product: "API Plus",
    value: 33800,
    probability: 10,
    owner: "Bianca",
    segment: "Tecnologia",
    nextFollowUp: "2026-07-18",
    stage: "lead",
    notes: "Lead frio vindo do site."
  },
  {
    id: "deal-5",
    company: "Delta Foods",
    contact: "Juliana Alves",
    product: "Consultoria BI",
    value: 52000,
    probability: 100,
    owner: "Ana",
    segment: "Alimentos",
    nextFollowUp: "2026-07-05",
    stage: "won",
    notes: "Contrato assinado."
  }
];

const pipeline = document.querySelector("#pipeline");
const kpis = document.querySelector("#kpis");
const followups = document.querySelector("#followups");
const dealForm = document.querySelector("#dealForm");
const dealTemplate = document.querySelector("#dealTemplate");
const searchInput = document.querySelector("#searchInput");
const ownerFilter = document.querySelector("#ownerFilter");
const segmentFilter = document.querySelector("#segmentFilter");
const sortFilter = document.querySelector("#sortFilter");
const exportCsvBtn = document.querySelector("#exportCsvBtn");
const resetBtn = document.querySelector("#resetBtn");

let deals = JSON.parse(localStorage.getItem("crm-pipeline-deals") || "null") || demoDeals;
let draggedDealId = null;

function save() {
  localStorage.setItem("crm-pipeline-deals", JSON.stringify(deals));
}

function currency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function filteredDeals() {
  const search = searchInput.value.trim().toLowerCase();
  const owner = ownerFilter.value;
  const segment = segmentFilter.value;

  const list = deals.filter((deal) => {
    const text = `${deal.company} ${deal.contact} ${deal.product}`.toLowerCase();
    return (!search || text.includes(search))
      && (owner === "all" || deal.owner === owner)
      && (segment === "all" || deal.segment === segment);
  });

  const sorters = {
    value: (a, b) => b.value - a.value,
    date: (a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp),
    probability: (a, b) => b.probability - a.probability
  };

  return list.sort(sorters[sortFilter.value]);
}

function weightedValue(list) {
  return list.reduce((sum, deal) => sum + deal.value * (deal.probability / 100), 0);
}

function renderOptions() {
  const currentOwner = ownerFilter.value;
  const currentSegment = segmentFilter.value;
  const owners = [...new Set(deals.map((deal) => deal.owner))].sort();
  const segments = [...new Set(deals.map((deal) => deal.segment))].sort();

  ownerFilter.innerHTML = "<option value='all'>Todos responsáveis</option>"
    + owners.map((owner) => `<option value="${owner}">${owner}</option>`).join("");
  segmentFilter.innerHTML = "<option value='all'>Todos segmentos</option>"
    + segments.map((segment) => `<option value="${segment}">${segment}</option>`).join("");

  ownerFilter.value = owners.includes(currentOwner) ? currentOwner : "all";
  segmentFilter.value = segments.includes(currentSegment) ? currentSegment : "all";
}

function renderKpis(list) {
  const total = list.reduce((sum, deal) => sum + deal.value, 0);
  const weighted = weightedValue(list);
  const won = list.filter((deal) => deal.stage === "won").reduce((sum, deal) => sum + deal.value, 0);
  const avgProbability = list.length
    ? list.reduce((sum, deal) => sum + deal.probability, 0) / list.length
    : 0;

  const cards = [
    ["Funil", currency(total)],
    ["Previsão", currency(weighted)],
    ["Ganho", currency(won)],
    ["Prob. média", `${avgProbability.toFixed(1).replace(".", ",")}%`]
  ];

  kpis.innerHTML = cards
    .map(([label, value]) => `
      <article class="kpi">
        <span>${label}</span>
        <strong>${value}</strong>
      </article>
    `)
    .join("");
}

function renderPipeline(list) {
  pipeline.innerHTML = stages
    .map(([stage, label]) => {
      const stageDeals = list.filter((deal) => deal.stage === stage);
      const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
      return `
        <section class="stage" data-stage="${stage}">
          <div class="stage-head">
            <h2>${label}</h2>
            <span>${stageDeals.length} • ${currency(stageValue)}</span>
          </div>
          <div class="deals"></div>
        </section>
      `;
    })
    .join("");

  pipeline.querySelectorAll(".stage").forEach((stageEl) => {
    const container = stageEl.querySelector(".deals");
    stageEl.addEventListener("dragover", (event) => event.preventDefault());
    stageEl.addEventListener("drop", () => {
      const stageConfig = stages.find(([stage]) => stage === stageEl.dataset.stage);
      deals = deals.map((deal) => {
        if (deal.id !== draggedDealId) return deal;
        return {
          ...deal,
          stage: stageEl.dataset.stage,
          probability: Math.max(deal.probability, stageConfig[2])
        };
      });
      draggedDealId = null;
      save();
      render();
    });

    list
      .filter((deal) => deal.stage === stageEl.dataset.stage)
      .forEach((deal) => container.appendChild(createDealCard(deal)));
  });
}

function createDealCard(deal) {
  const node = dealTemplate.content.cloneNode(true);
  const card = node.querySelector(".deal");
  const tag = node.querySelector(".tag");
  const title = node.querySelector("h3");
  const details = node.querySelector("p");
  const value = node.querySelector(".value");
  const probability = node.querySelector(".probability");
  const footer = node.querySelector("footer");
  const deleteButton = node.querySelector(".delete");

  tag.textContent = deal.segment;
  title.textContent = deal.company;
  details.textContent = `${deal.product} • ${deal.contact}`;
  value.textContent = currency(deal.value);
  probability.textContent = `${deal.probability}%`;
  footer.textContent = `${deal.owner} • acompanhamento ${deal.nextFollowUp.split("-").reverse().join("/")}`;
  card.dataset.id = deal.id;

  card.addEventListener("dragstart", () => {
    draggedDealId = deal.id;
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", () => card.classList.remove("dragging"));

  deleteButton.addEventListener("click", () => {
    deals = deals.filter((item) => item.id !== deal.id);
    save();
    render();
  });

  return node;
}

function renderFollowups(list) {
  followups.innerHTML = [...list]
    .filter((deal) => deal.stage !== "won")
    .sort((a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp))
    .slice(0, 6)
    .map((deal) => `
      <article class="followup">
        <strong>${deal.nextFollowUp.split("-").reverse().join("/")} • ${deal.company}</strong>
        <p>${deal.owner} precisa falar com ${deal.contact}. ${deal.notes}</p>
      </article>
    `)
    .join("");
}

function render() {
  renderOptions();
  const list = filteredDeals();
  renderKpis(list);
  renderPipeline(list);
  renderFollowups(list);
}

dealForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(dealForm).entries());
  deals.unshift({
    id: crypto.randomUUID(),
    ...payload,
    value: Number(payload.value),
    probability: Number(payload.probability),
    stage: "lead"
  });
  save();
  dealForm.reset();
  render();
});

[searchInput, ownerFilter, segmentFilter, sortFilter].forEach((field) => {
  field.addEventListener("input", render);
});

exportCsvBtn.addEventListener("click", () => {
  const rows = filteredDeals();
  const header = ["Empresa", "Contato", "Produto", "Valor", "Probabilidade", "Responsável", "Segmento", "Etapa"];
  const csv = [
    header.join(";"),
    ...rows.map((deal) => [deal.company, deal.contact, deal.product, deal.value, deal.probability, deal.owner, deal.segment, deal.stage].join(";"))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "crm-pipeline.csv";
  link.click();
  URL.revokeObjectURL(url);
});

resetBtn.addEventListener("click", () => {
  deals = demoDeals;
  save();
  render();
});

render();
