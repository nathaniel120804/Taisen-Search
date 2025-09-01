window.onload = () => {
  console.log("Google Custom Search Engine loaded!");

  // Initialize search element
  google.search.cse.element.render({
    div: "searchbox",
    tag: 'searchbox-only',
    attributes: {
      enableAutoComplete: true
    }
  });

  // Listen for search events
  google.search.cse.element.getElement('searchbox').execute = (query) => {
    console.log("User searched:", query);

    // You can send this to your server to store
    fetch('/log-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    // Call the original execute to perform search
    google.search.cse.element.getElement('searchbox').originalExecute(query);
  };
};
