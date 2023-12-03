const PageAnalyzer = require('../analyzers/pageAnalyzer');


test('PageAnalyzer.fetchContent should fetch the content of a page', async () => {
    const analyzer = new PageAnalyzer('https://seosrbija.rs');
    const content = await analyzer.fetchContent();
    console.log(content);
    expect(content).toBeTruthy();
});


test('PageAnalyzer.parseHTML should parse the HTML to find all the links', async () => {
    const analyzer = new PageAnalyzer('https://seosrbija.rs');
    const html = await analyzer.fetchContent();
    const links = analyzer.parseHTML(html);
    console.log(links);
    expect(links).toBeInstanceOf(Array);
    expect(links).not.toHaveLength(0);
});