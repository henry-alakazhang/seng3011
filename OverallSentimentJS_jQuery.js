// Genreal (POST http://gateway-a.watsonplatform.net/calls/text/TextGetTextSentiment)

jQuery.ajax({
    url: "http://gateway-a.watsonplatform.net/calls/text/TextGetTextSentiment",
    type: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
    contentType: "application/x-www-form-urlencoded",
    data: {
        "apikey": "43d8789a0576632dc197805731ca9abd54006afd",
        "text": "Europe expected to unveil QE plan\\n    * Resources benefit from commodities rebound\\n    * Canada rate cut adds to speculation of similar move in\\nAustralia\\n\\n (Adds analysis, quotes, stocks on the move)\\n    SYDNEY/WELLINGTON, Jan 22 (Reuters) - Australian shares rose\\nfor a second session on Thursday as investors wagered the\\nEuropean Central Bank will unveil a stimulus package later in\\nthe day, while a rebound in oil and copper prices shored up the\\nresources sector.\\n     A shock interest rate cut in Canada, which stoked\\nspeculation that the Reserve Bank of Australia may cut interest\\nrates later in 2015 underpinned a sunny mood, while investors\\nalso cheered well-received production reports from mining giants\\nBHP Billiton <BHP.AX> and Rio Tinto <RIO.AX>.\\n    The S&P/ASX 200 index <.AXJO> rose 33.9 points or 0.6\\npercent to 5427.3 by 0143 GMT.\\n    \\\"Expectations are that they're going to act,\\\" said Quay\\nSecurities head of trading Tristan K'Nell, referring to the\\nEuropean Central Bank.\\n    \\\"It's a bit of a positive sentiment after we had a lot of\\nuncertainty to start the year.\\\"\\n    The ECB was poised to announce later on Thursday a plan to\\nprint money to buy 50 billion euros in bonds per month from\\nMarch, in a move seen as likely to inject momentum into the\\nglobal economy. [ID:nL6N0V02KJ]\\n    BHP rose 3 percent and Rio Tinto added 2.3 percent,\\nrebounding after months of declines amid slumping iron ore\\nprices. Iron ore miner Arrium <ARI.AX> leapt 17 percent as\\ninvestors took advantage of its sluggish share price to \\nincrease their stakes.\\n    Among energy players, Woodside Petroleum <WPL.AX> gained 4\\npercent, Santos <STO.AX> added 2.3 percent and Origin Energy\\n<ORG.AX> rose 2.4 percent after oil price gained 2 percent\\novernight. [ID:nL6N0V011C]\\n    Banks also firmed, with Westpac Banking Corp <WBC.AX> up 1.3\\npercent while National Australia Bank <NAB.AX> and Australia and\\nNew Zealand Banking Group <ANZ.AX> both rising 0.8 percent.\\n    Recruiter Skilled Group <SKE.AX> slipped 4 percent after it\\nrejected a takeover offer from rival Programmed <PRG.AX>.\\nPackaging firm Amcor <AMC.AX> dropped 4 percent after its CEO\\nretired.\\n    New Zealand shares were in record territory with the\\nbenchmark NZX-50 index <.NZ50> hitting a lifetime high in early\\ntrading before trimming its gains to be up 0.1 percent at\\n5,680.88.\\n    Market bellwether Fletcher Building <FBU.NZ> was 0.5 percent\\nlower after the previous session's 5 percent gain. \\n    A sharp fall in the exchange rate helped exporter stocks or\\nthose with significant offshore interests like Fisher and Paykel\\nHealthcare <FPH.NZ>, up 1.4 percent.\\n    The country's biggest listed retailer The Warehouse <WHS.NZ>\\nrose 5.2 percent as substantial shareholder James Pascoe Ltd,\\nwhich operates jewellery shops and a rival department store\\nchain, said it upped its stake to 7.4 percent from 6.3 percent.\\n\\n (Reporting by Byron Kaye and Gyles Beckford; Editing by Shri\\nNavaratnam)\\n ((byron.kaye@thomsonreuters.com; +612 9373 1815; Reuters\\nMessaging: byron.kaye.thomsonreuters.com@reuters.net))\\n \\n((For more information on DIARIES & DATA:\\n U.S. earnings diary  [RESF/US]  \\n Wall Street Week Ahead   [.N/O]\\n Eurostocks Week Ahead  [.EU/O]\\n................................................................\\nFor latest top breaking news across all markets          [NEWS1]))\\n\\nKeywords: MARKETS AUSTRALIA STOCKS/\"",
        "outputMode": "json",
    },
})
.done(function(data, textStatus, jqXHR) {
    console.log("HTTP Request Succeeded: " + jqXHR.status);
    console.log(data);
})
.fail(function(jqXHR, textStatus, errorThrown) {
    console.log("HTTP Request Failed");
})
.always(function() {
    /* ... */
});
