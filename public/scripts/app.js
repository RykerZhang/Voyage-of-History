/* global algoliasearch instantsearch */

const searchClient = algoliasearch(
  '68WZ6X6LW2',
  '2e8336c9ccbe685fd2d406ac6f64364b'
);

const search = instantsearch({
  indexName: 'entry',
  searchClient,
});

search.addWidgets([

  instantsearch.widgets.searchBox({
    container: '#searchbox',
  }),
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: `
      <div id = "FirstBalkanWar">
<article >
  <div>{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}</div>
</article></div>
`,
    },
  }),
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),
]);


search.start();
