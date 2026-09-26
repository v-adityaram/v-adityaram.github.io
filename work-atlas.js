(() => {
  const atlas = document.querySelector('[data-atlas]');
  if (!atlas) return;

  // Editorial relationships: shared engineering capabilities, not a live dependency graph.
  const projects = [
    {
      id: 'incident', title: 'Incident response AI', status: 'TCS · Client proof of concept',
      client: 'A global beauty leader',
      description: 'Turns monitoring evidence into a timeline, ranked root-cause hypotheses and a recovery plan. Citations are checked in code; recovery stays behind human approval.',
      metrics: [['124 → ~70 s', 'diagnosis latency'], ['400+', 'existing monitoring rules']],
      stack: ['Azure AI Foundry', 'Python', 'GPT-5', 'Azure VM'],
      capabilities: ['agents', 'retrieval', 'approval', 'deployment'],
      href: 'assets/Resume.pdf', link: 'Read in my resume',
    },
    {
      id: 'telecom', title: 'A conversation, in four languages.', status: 'TCS · Client proof of concept',
      client: 'Africa’s largest mobile network operator',
      description: 'Account questions by chat or real-time voice. A confidence-gated router handles simple requests; LangGraph coordinates multiple lookups. Only approved tools can reach account data.',
      metrics: [['4 languages', 'mid-call switching'], ['~2.9 s', 'typical chat latency']],
      stack: ['Azure OpenAI', 'LangGraph', 'FastAPI', 'WebRTC'],
      capabilities: ['agents', 'voice', 'deployment'],
      href: 'project-telecom-assistant.html', link: 'Explore the case study',
    },
    {
      id: 'sales', title: 'Sales & service assistants', status: 'TCS · Client prototypes',
      client: 'North America’s largest roofing manufacturer',
      description: 'Two assistants for orders, products and warranties. Python owns pricing, stock and credit checks. People confirm orders, and uncertain warranty answers go to a review queue.',
      metrics: [['~1.7 s', 'tuned model latency'], ['160 tests', 'offline, mocked suite']],
      stack: ['Azure AI Foundry', 'FastAPI', 'Python', 'WebRTC'],
      capabilities: ['agents', 'voice', 'approval', 'deployment'],
      href: 'assets/Resume.pdf', link: 'Read in my resume',
    },
    {
      id: 'portfolio', title: 'Ask about Aditya', status: 'Independent · Live product',
      client: 'The assistant on this website',
      description: 'Answers questions from my published work, with source links and a model fallback. A small corpus taught a useful lesson: retrieve less aggressively when dropping context costs more than including it.',
      metrics: [['Source-linked', 'answers about my work'], ['2 providers', 'generation + fallback']],
      stack: ['Cloudflare Workers', 'Vectorize', 'Gemini', 'Workers AI'],
      capabilities: ['retrieval', 'deployment'],
      href: 'projects.html#ask-aditya', link: 'See how it works',
    },
    {
      id: 'budget', title: 'Budget, with an assistant.', status: 'Independent · Live product',
      client: 'A finance app I build, operate and use',
      description: 'Daily budgeting with a text-and-voice assistant. Shorthand expenses need no model call. AI-proposed changes wait for confirmation, with a second model provider available as a fallback.',
      metrics: [['Confirm first', 'before AI-proposed changes'], ['Used daily', 'a personal, live product']],
      stack: ['Cloudflare Workers', 'D1', 'Gemini', 'TypeScript'],
      capabilities: ['agents', 'approval', 'deployment'],
      href: 'live-project-budget.html', link: 'Explore Budget',
    },
    {
      id: 'paperbrief', title: 'PaperBrief AI', status: 'Independent · Research project',
      client: 'A workspace for scientific literature',
      description: 'Explore and compare research papers with retrieval, local-model chat and relationship graphs. PDF parsing and PubMed retrieval bring the source material into one workspace.',
      metrics: [['Local LLM', 'Ollama / Phi-3 chat'], ['Paper graphs', 'relationship analysis']],
      stack: ['Python', 'Streamlit', 'Ollama', 'NetworkX'],
      capabilities: ['retrieval'],
      href: 'projects.html#paperbrief', link: 'View the project',
    },
  ];

  const filters = Array.from(atlas.querySelectorAll('[data-atlas-filter]'));
  const nodes = Array.from(atlas.querySelectorAll('[data-atlas-node]'));
  const detail = atlas.querySelector('[data-atlas-detail]');
  const status = atlas.querySelector('[data-atlas-announcement]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeFilter = 'all';
  let selectedId = 'telecom';

  const matches = (project) => activeFilter === 'all' || project.capabilities.includes(activeFilter);
  const visibleProjects = () => projects.filter(matches);

  function select(id, announce = true, updateURL = true) {
    const project = projects.find((item) => item.id === id);
    if (!project) return;
    selectedId = id;
    // Selecting a dimmed node clears the filter, so selected items always match the view.
    if (!matches(project)) activeFilter = 'all';
    const visible = visibleProjects();
    filters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.atlasFilter === activeFilter)));
    nodes.forEach((button) => {
      const item = projects.find((entry) => entry.id === button.dataset.atlasNode);
      button.setAttribute('aria-pressed', String(item.id === id));
      button.classList.toggle('is-muted', !matches(item));
      const edge = atlas.querySelector(`[data-atlas-edge="${item.id}"]`);
      edge.classList.toggle('is-selected', item.id === id);
      edge.classList.toggle('is-muted', !matches(item));
      edge.classList.toggle('is-connected', matches(item) && (activeFilter !== 'all' || item.capabilities.some((cap) => project.capabilities.includes(cap))));
    });
    atlas.querySelectorAll('[data-atlas-capability]').forEach((label) => {
      label.classList.toggle('is-connected', project.capabilities.includes(label.dataset.atlasCapability));
    });
    atlas.querySelector('[data-atlas-count]').textContent = `${visible.length} of ${projects.length} systems`;
    const setText = (name, value) => { detail.querySelector(`[data-atlas-${name}]`).textContent = value; };
    setText('status', project.status);
    setText('step', `${String(visible.indexOf(project) + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}`);
    setText('title', project.title);
    setText('client', project.client);
    setText('description', project.description);
    const metrics = detail.querySelector('[data-atlas-metrics]');
    metrics.replaceChildren(...project.metrics.map(([value, label]) => {
      const group = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = value;
      dd.textContent = label;
      group.append(dt, dd);
      return group;
    }));
    detail.querySelector('[data-atlas-stack]').replaceChildren(...project.stack.map((name) => {
      const tag = document.createElement('span');
      tag.textContent = name;
      return tag;
    }));
    const link = detail.querySelector('[data-atlas-link]');
    link.href = project.href;
    link.textContent = `${project.link} ↗`;
    if (updateURL) {
      const url = new URL(window.location.href);
      url.searchParams.set('project', selectedId);
      if (activeFilter === 'all') url.searchParams.delete('filter');
      else url.searchParams.set('filter', activeFilter);
      if (url.href !== window.location.href) history.pushState(null, '', url);
    }
    if (announce) status.textContent = `${project.title}. ${project.status}. ${visible.length} matching systems.`;
    if (announce && !reduced.matches) {
      detail.classList.remove('is-changing');
      void detail.offsetWidth;
      detail.classList.add('is-changing');
    }
  }

  filters.forEach((button) => button.addEventListener('click', () => {
    activeFilter = button.dataset.atlasFilter;
    const selected = projects.find((project) => project.id === selectedId);
    select(matches(selected) ? selectedId : visibleProjects()[0].id);
  }));
  nodes.forEach((button) => {
    button.addEventListener('click', () => select(button.dataset.atlasNode));
    button.addEventListener('keydown', (event) => {
      const directions = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (!(event.key in directions) && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      const list = visibleProjects();
      let index = list.findIndex((item) => item.id === button.dataset.atlasNode);
      index = event.key === 'Home' ? 0 : event.key === 'End' ? list.length - 1 : (index + directions[event.key] + list.length) % list.length;
      select(list[index].id);
      nodes.find((node) => node.dataset.atlasNode === list[index].id).focus();
    });
  });
  atlas.querySelectorAll('[data-atlas-direction]').forEach((button) => button.addEventListener('click', () => {
    const list = visibleProjects();
    const index = list.findIndex((item) => item.id === selectedId);
    select(list[(index + Number(button.dataset.atlasDirection) + list.length) % list.length].id);
  }));
  function restoreFromURL(announce = false) {
    const url = new URL(window.location.href);
    const filter = url.searchParams.get('filter');
    activeFilter = filters.some(button => button.dataset.atlasFilter === filter) ? filter : 'all';
    const requested = projects.find(project => project.id === url.searchParams.get('project'));
    const fallback = activeFilter === 'all' ? projects.find(project => project.id === 'telecom') : visibleProjects()[0];
    select(requested && matches(requested) ? requested.id : fallback.id, announce, false);
  }
  window.addEventListener('popstate', () => restoreFromURL(true));
  restoreFromURL();
})();
