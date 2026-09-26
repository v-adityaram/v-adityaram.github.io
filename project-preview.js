(() => {
  const preview = document.querySelector('[data-telecom-preview]');
  if (!preview) return;

  // A public explanation of documented routing paths. All account values are synthetic.
  // This walkthrough makes no account lookups, microphone requests or model calls.
  const examples = {
    balance: {
      question: 'What is my balance?', answer: 'Your available balance is R184.50.', lang: 'en',
      steps: ['Route a clear balance question to the approved balance tool.', 'Fetch account data through the backend-owned customer identity.', 'Format the returned amount into a deterministic answer.'],
      source: 'Sample source: account balance. One lookup; no multi-step graph.',
    },
    eligibility: {
      question: 'Can I use 5G with my current phone and plan?', answer: 'In this example, your plan supports 5G, but your phone supports 4G. You would need a compatible device.', lang: 'en',
      steps: ['Recognize that eligibility needs both plan and device information.', 'LangGraph plans two approved lookups; the fetch step runs them concurrently.', 'Build the answer from both results without inferring missing account details.'],
      source: 'Sample sources: plan + device. A multi-lookup question enters the graph.',
    },
    clarify: {
      question: 'Can you check that for me?', answer: 'What would you like to check: your balance, plan, or device?', lang: 'en',
      steps: ['The intent is not clear enough to choose a tool.', 'Ask a clarifying question before planning any account lookup.', 'Wait for the customer’s reply; no telecom API is called on a guess.'],
      source: 'No account lookup. Clarification comes first.',
    },
    voice: {
      question: 'मेरा बैलेंस कितना है?', answer: 'आपका उपलब्ध बैलेंस R184.50 है।', lang: 'hi',
      steps: ['A caller switches to Hindi. The audio turn is committed and transcribed.', 'The client reads the transcript’s script and explicitly sets the response language.', 'Request the voice reply with the approved balance-tool result. The account boundary stays the same.'],
      source: 'Illustrative voice turn: Hindi transcript + synthetic balance. No audio is recorded here.',
    },
  };
  const buttons = [...preview.querySelectorAll('[data-preview-example]')];
  buttons.forEach(button => button.addEventListener('click', () => {
    const example = examples[button.dataset.previewExample];
    if (!example) return;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    for (const name of ['question', 'answer']) {
      const element = preview.querySelector(`[data-preview-${name}]`);
      element.textContent = example[name];
      element.lang = example.lang;
    }
    preview.querySelector('[data-preview-steps]').replaceChildren(...example.steps.map(text => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    }));
    preview.querySelector('[data-preview-source]').textContent = example.source;
    preview.querySelector('[data-preview-announcement]').textContent = `${button.textContent.trim()} example selected. ${example.steps.join(' ')}`;
  }));
})();
